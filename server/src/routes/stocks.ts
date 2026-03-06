import { Router, Response } from "express";
import { eq, desc, ilike, and, or, SQL } from "drizzle-orm";
import { db } from "../db";
import { stocks, analyses, decisions, sourceStocks, sources, todoStocks, todos, sourceTodos } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createStockSchema, updateStockSchema } from "../validators/stocks";
import { AuthRequest, param, escapeLike, handleRouteError, UUID_RE } from "../types";
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

      // Include related data
      const [stockAnalyses, stockDecisions, linkedSources, linkedTodos] = await Promise.all([
        db
          .select()
          .from(analyses)
          .where(eq(analyses.stockId, id)),
        db
          .select()
          .from(decisions)
          .where(eq(decisions.stockId, id))
          .orderBy(desc(decisions.createdAt)),
        db
          .select({
            id: sources.id,
            title: sources.title,
            sourceType: sources.sourceType,
            url: sources.url,
          })
          .from(sourceStocks)
          .innerJoin(sources, eq(sourceStocks.sourceId, sources.id))
          .where(eq(sourceStocks.stockId, id)),
        db
          .select({
            id: todos.id,
            title: todos.title,
            status: todos.status,
          })
          .from(todoStocks)
          .innerJoin(todos, eq(todoStocks.todoId, todos.id))
          .where(eq(todoStocks.stockId, id)),
      ]);

      res.json({
        ...stock,
        analyses: stockAnalyses,
        decisions: stockDecisions,
        sources: linkedSources,
        todos: linkedTodos,
      });
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

// Link source to stock
router.post(
  "/:id/link-source",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const { sourceId } = req.body;

      if (!sourceId || !UUID_RE.test(sourceId)) {
        res.status(400).json({ error: "Valid sourceId is required" });
        return;
      }

      const [stock] = await db.select({ id: stocks.id }).from(stocks).where(eq(stocks.id, id)).limit(1);
      if (!stock) { res.status(404).json({ error: "Stock not found" }); return; }

      const [source] = await db.select({ id: sources.id }).from(sources).where(eq(sources.id, sourceId)).limit(1);
      if (!source) { res.status(404).json({ error: "Source not found" }); return; }

      await db.insert(sourceStocks).values({ sourceId, stockId: id }).onConflictDoNothing();
      res.status(201).json({ message: "Source linked" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Link source to stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Unlink source from stock
router.delete(
  "/:id/link-source/:sourceId",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const sourceId = param(req, "sourceId");

      await db.delete(sourceStocks).where(
        and(eq(sourceStocks.stockId, id), eq(sourceStocks.sourceId, sourceId))
      );
      res.json({ message: "Source unlinked" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Unlink source from stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Link todo to stock
router.post(
  "/:id/link-todo",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const { todoId } = req.body;

      if (!todoId || !UUID_RE.test(todoId)) {
        res.status(400).json({ error: "Valid todoId is required" });
        return;
      }

      const [stock] = await db.select({ id: stocks.id }).from(stocks).where(eq(stocks.id, id)).limit(1);
      if (!stock) { res.status(404).json({ error: "Stock not found" }); return; }

      const [todo] = await db.select({ id: todos.id }).from(todos).where(eq(todos.id, todoId)).limit(1);
      if (!todo) { res.status(404).json({ error: "Todo not found" }); return; }

      await db.insert(todoStocks).values({ todoId, stockId: id }).onConflictDoNothing();
      res.status(201).json({ message: "Todo linked" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Link todo to stock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Unlink todo from stock
router.delete(
  "/:id/link-todo/:todoId",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const todoId = param(req, "todoId");

      await db.delete(todoStocks).where(
        and(eq(todoStocks.stockId, id), eq(todoStocks.todoId, todoId))
      );
      res.json({ message: "Todo unlinked" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Unlink todo from stock error:", err);
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
