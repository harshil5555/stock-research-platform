import { Router, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { analyses, stocks, users } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upsertAnalysisSchema } from "../validators/analyses";
import { AuthRequest, param, handleRouteError } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

// GET /api/stocks/:stockId/analyses
router.get(
  "/:stockId/analyses",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stockId = param(req, "stockId");
      const result = await db
        .select({
          id: analyses.id,
          stockId: analyses.stockId,
          userId: analyses.userId,
          authorName: users.displayName,
          thesis: analyses.thesis,
          bullCase: analyses.bullCase,
          bearCase: analyses.bearCase,
          notes: analyses.notes,
          targetPrice: analyses.targetPrice,
          createdAt: analyses.createdAt,
          updatedAt: analyses.updatedAt,
        })
        .from(analyses)
        .innerJoin(users, eq(analyses.userId, users.id))
        .where(eq(analyses.stockId, stockId));

      res.json(result);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("List analyses error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/stocks/:stockId/analyses/mine
router.get(
  "/:stockId/analyses/mine",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stockId = param(req, "stockId");
      const [analysis] = await db
        .select()
        .from(analyses)
        .where(
          and(
            eq(analyses.stockId, stockId),
            eq(analyses.userId, req.user!.userId)
          )
        )
        .limit(1);

      if (!analysis) {
        res.json(null);
        return;
      }

      res.json(analysis);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Get my analysis error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/stocks/:stockId/analyses - upsert (201 for create, 200 for update)
router.put(
  "/:stockId/analyses",
  authMiddleware,
  validate(upsertAnalysisSchema),
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

      // Check if analysis already exists
      const [existing] = await db
        .select({ id: analyses.id })
        .from(analyses)
        .where(
          and(
            eq(analyses.stockId, stockId),
            eq(analyses.userId, req.user!.userId)
          )
        )
        .limit(1);

      const isCreate = !existing;

      const [analysis] = await db
        .insert(analyses)
        .values({
          stockId,
          userId: req.user!.userId,
          ...req.body,
        })
        .onConflictDoUpdate({
          target: [analyses.stockId, analyses.userId],
          set: {
            ...req.body,
            updatedAt: new Date(),
          },
        })
        .returning();

      broadcast("analysis", isCreate ? "created" : "updated", analysis, req.user!.userId);
      res.status(isCreate ? 201 : 200).json(analysis);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Upsert analysis error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
