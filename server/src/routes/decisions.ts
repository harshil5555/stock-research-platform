import { Router, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { decisions, stocks } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createDecisionSchema } from "../validators/decisions";
import { AuthRequest, param, handleRouteError } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

// GET /api/stocks/:stockId/decisions
router.get(
  "/:stockId/decisions",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stockId = param(req, "stockId");
      const result = await db
        .select()
        .from(decisions)
        .where(eq(decisions.stockId, stockId))
        .orderBy(desc(decisions.createdAt));

      res.json(result);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("List decisions error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/stocks/:stockId/decisions (C2 fix: wrapped in transaction)
router.post(
  "/:stockId/decisions",
  authMiddleware,
  validate(createDecisionSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stockId = param(req, "stockId");

      // Verify stock exists
      const [stock] = await db
        .select({ id: stocks.id })
        .from(stocks)
        .where(eq(stocks.id, stockId))
        .limit(1);

      if (!stock) {
        res.status(404).json({ error: "Stock not found" });
        return;
      }

      // Create decision and update stock in a single transaction
      const { decision, updatedStock } = await db.transaction(async (tx) => {
        const [decision] = await tx
          .insert(decisions)
          .values({
            stockId,
            userId: req.user!.userId,
            status: req.body.status,
            reasoning: req.body.reasoning,
          })
          .returning();

        const [updatedStock] = await tx
          .update(stocks)
          .set({
            decisionStatus: req.body.status,
            updatedAt: new Date(),
          })
          .where(eq(stocks.id, stockId))
          .returning();

        return { decision, updatedStock };
      });

      broadcast("decision", "created", decision, req.user!.userId);
      broadcast("stock", "updated", updatedStock, req.user!.userId);

      res.status(201).json(decision);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Create decision error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
