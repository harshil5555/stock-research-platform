import { Router, Response } from "express";
import { eq, desc, ilike, and, or, SQL } from "drizzle-orm";
import { db } from "../db";
import { stocks } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createStockSchema, updateStockSchema } from "../validators/stocks";
import { AuthRequest, param, escapeLike, handleRouteError } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

const validDecisionStatuses = [
  "researching",
  "considering",
  "bought",
  "passed",
  "sold",
  "watching",
] as const;
type DecisionStatus = (typeof validDecisionStatuses)[number];

// GET /api/stocks
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, sector, decisionStatus } = req.query;

      const conditions: SQL[] = [];
      if (search && typeof search === "string") {
        const escaped = escapeLike(search);
        conditions.push(
          or(
            ilike(stocks.ticker, `%${escaped}%`),
            ilike(stocks.companyName, `%${escaped}%`)
          )!
        );
      }
      if (sector && typeof sector === "string") {
        conditions.push(eq(stocks.sector, sector));
      }
      if (decisionStatus && typeof decisionStatus === "string") {
        if (
          validDecisionStatuses.includes(decisionStatus as DecisionStatus)
        ) {
          conditions.push(
            eq(stocks.decisionStatus, decisionStatus as DecisionStatus)
          );
        }
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select()
        .from(stocks)
        .where(where)
        .orderBy(desc(stocks.createdAt));

      res.json(result);
    } catch (err) {
      console.error("List stocks error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/stocks/:id
router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [stock] = await db
        .select()
        .from(stocks)
        .where(eq(stocks.id, id))
        .limit(1);

      if (!stock) {
        res.status(404).json({ error: "Stock not found" });
        return;
      }

      res.json(stock);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Get stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/stocks
router.post(
  "/",
  authMiddleware,
  validate(createStockSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [stock] = await db
        .insert(stocks)
        .values({
          ...req.body,
          createdBy: req.user!.userId,
        })
        .returning();

      broadcast("stock", "created", stock, req.user!.userId);
      res.status(201).json(stock);
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err && (err as any).code === "23505") {
        res
          .status(409)
          .json({ error: "Stock with this ticker already exists" });
        return;
      }
      console.error("Create stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/stocks/:id
router.put(
  "/:id",
  authMiddleware,
  validate(updateStockSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [stock] = await db
        .update(stocks)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(stocks.id, id))
        .returning();

      if (!stock) {
        res.status(404).json({ error: "Stock not found" });
        return;
      }

      broadcast("stock", "updated", stock, req.user!.userId);
      res.json(stock);
    } catch (err: unknown) {
      if (handleRouteError(err, res)) return;
      if (err instanceof Error && "code" in err && (err as any).code === "23505") {
        res
          .status(409)
          .json({ error: "Stock with this ticker already exists" });
        return;
      }
      console.error("Update stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/stocks/:id
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [stock] = await db
        .delete(stocks)
        .where(eq(stocks.id, id))
        .returning();

      if (!stock) {
        res.status(404).json({ error: "Stock not found" });
        return;
      }

      broadcast("stock", "deleted", { id: stock.id }, req.user!.userId);
      res.json({ message: "Stock deleted" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Delete stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
