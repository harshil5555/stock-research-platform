import { Router, Response } from "express";
import { eq, desc, ilike, and, SQL } from "drizzle-orm";
import { db } from "../db";
import {
  sources,
  sourceTodos,
  sourceStocks,
  stocks,
  todos,
  attachments,
} from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSourceSchema, updateSourceSchema } from "../validators/sources";
import { AuthRequest, param, escapeLike, handleRouteError, UUID_RE } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

const validSourceTypes = [
  "article",
  "video",
  "podcast",
  "report",
  "tweet",
  "other",
] as const;
type SourceType = (typeof validSourceTypes)[number];

// GET /api/sources
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, sourceType, type: typeAlias } = req.query;

      const conditions: SQL[] = [];
      if (search && typeof search === "string") {
        conditions.push(ilike(sources.title, `%${escapeLike(search)}%`));
      }
      // Accept both "sourceType" and "type" as query param names
      const typeParam = (sourceType || typeAlias) as string | undefined;
      if (typeParam && typeof typeParam === "string") {
        if (validSourceTypes.includes(typeParam as SourceType)) {
          conditions.push(
            eq(sources.sourceType, typeParam as SourceType)
          );
        }
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select()
        .from(sources)
        .where(where)
        .orderBy(desc(sources.createdAt));

      res.json(result);
    } catch (err) {
      console.error("List sources error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/sources/:id
router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [source] = await db
        .select()
        .from(sources)
        .where(eq(sources.id, id))
        .limit(1);

      if (!source) {
        res.status(404).json({ error: "Source not found" });
        return;
      }

      // Fetch linked stocks, todos, and attachments in parallel
      const [linkedStocks, linkedTodos, linkedAttachments] = await Promise.all([
        db
          .select({
            id: stocks.id,
            ticker: stocks.ticker,
            companyName: stocks.companyName,
          })
          .from(sourceStocks)
          .innerJoin(stocks, eq(sourceStocks.stockId, stocks.id))
          .where(eq(sourceStocks.sourceId, source.id)),
        db
          .select({
            id: todos.id,
            title: todos.title,
            status: todos.status,
          })
          .from(sourceTodos)
          .innerJoin(todos, eq(sourceTodos.todoId, todos.id))
          .where(eq(sourceTodos.sourceId, source.id)),
        db
          .select()
          .from(attachments)
          .where(eq(attachments.sourceId, source.id)),
      ]);

      res.json({
        ...source,
        stocks: linkedStocks,
        todos: linkedTodos,
        attachments: linkedAttachments,
      });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Get source error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/sources (C3 fix: wrapped in transaction)
router.post(
  "/",
  authMiddleware,
  validate(createSourceSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { stockIds, todoIds, ...sourceData } = req.body;

      const source = await db.transaction(async (tx) => {
        const [src] = await tx
          .insert(sources)
          .values({
            ...sourceData,
            createdBy: req.user!.userId,
          })
          .returning();

        if (stockIds && stockIds.length > 0) {
          await tx.insert(sourceStocks).values(
            stockIds.map((stockId: string) => ({
              sourceId: src.id,
              stockId,
            }))
          );
        }

        if (todoIds && todoIds.length > 0) {
          await tx.insert(sourceTodos).values(
            todoIds.map((todoId: string) => ({
              sourceId: src.id,
              todoId,
            }))
          );
        }

        return src;
      });

      broadcast("source", "created", source, req.user!.userId);
      res.status(201).json(source);
    } catch (err: unknown) {
      if (handleRouteError(err, res)) return;
      if (err instanceof Error && "code" in err && (err as any).code === "23503") {
        res.status(400).json({
          error: "One or more linked stock or todo IDs do not exist",
        });
        return;
      }
      console.error("Create source error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/sources/:id (C4 fix: wrapped in transaction)
router.put(
  "/:id",
  authMiddleware,
  validate(updateSourceSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const { stockIds, todoIds, ...sourceData } = req.body;

      const source = await db.transaction(async (tx) => {
        const [src] = await tx
          .update(sources)
          .set({ ...sourceData, updatedAt: new Date() })
          .where(eq(sources.id, id))
          .returning();

        if (!src) return null;

        if (stockIds !== undefined) {
          await tx
            .delete(sourceStocks)
            .where(eq(sourceStocks.sourceId, src.id));
          if (stockIds.length > 0) {
            await tx.insert(sourceStocks).values(
              stockIds.map((stockId: string) => ({
                sourceId: src.id,
                stockId,
              }))
            );
          }
        }

        if (todoIds !== undefined) {
          await tx
            .delete(sourceTodos)
            .where(eq(sourceTodos.sourceId, src.id));
          if (todoIds.length > 0) {
            await tx.insert(sourceTodos).values(
              todoIds.map((todoId: string) => ({
                sourceId: src.id,
                todoId,
              }))
            );
          }
        }

        return src;
      });

      if (!source) {
        res.status(404).json({ error: "Source not found" });
        return;
      }

      broadcast("source", "updated", source, req.user!.userId);
      res.json(source);
    } catch (err: unknown) {
      if (handleRouteError(err, res)) return;
      if (err instanceof Error && "code" in err && (err as any).code === "23503") {
        res.status(400).json({
          error: "One or more linked stock or todo IDs do not exist",
        });
        return;
      }
      console.error("Update source error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Shared handlers for link/unlink operations
async function handleLinkStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const stockId = req.params.stockId
      ? param(req, "stockId")
      : req.body?.stockId;

    if (!stockId || !UUID_RE.test(stockId)) {
      res.status(400).json({ error: "Valid stockId is required" });
      return;
    }

    const [source] = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);
    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const [stock] = await db
      .select({ id: stocks.id })
      .from(stocks)
      .where(eq(stocks.id, stockId))
      .limit(1);
    if (!stock) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }

    await db
      .insert(sourceStocks)
      .values({ sourceId: id, stockId })
      .onConflictDoNothing();

    res.status(201).json({ message: "Stock linked" });
  } catch (err) {
    if (handleRouteError(err, res)) return;
    console.error("Link stock error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleUnlinkStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const stockId = param(req, "stockId");

    await db
      .delete(sourceStocks)
      .where(
        and(
          eq(sourceStocks.sourceId, id),
          eq(sourceStocks.stockId, stockId)
        )
      );

    res.json({ message: "Stock unlinked" });
  } catch (err) {
    if (handleRouteError(err, res)) return;
    console.error("Unlink stock error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleLinkTodo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const todoId = req.params.todoId
      ? param(req, "todoId")
      : req.body?.todoId;

    if (!todoId || !UUID_RE.test(todoId)) {
      res.status(400).json({ error: "Valid todoId is required" });
      return;
    }

    const [source] = await db
      .select({ id: sources.id })
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);
    if (!source) {
      res.status(404).json({ error: "Source not found" });
      return;
    }

    const [todo] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(eq(todos.id, todoId))
      .limit(1);
    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    await db
      .insert(sourceTodos)
      .values({ sourceId: id, todoId })
      .onConflictDoNothing();

    res.status(201).json({ message: "Todo linked" });
  } catch (err) {
    if (handleRouteError(err, res)) return;
    console.error("Link todo error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleUnlinkTodo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const todoId = param(req, "todoId");

    await db
      .delete(sourceTodos)
      .where(
        and(
          eq(sourceTodos.sourceId, id),
          eq(sourceTodos.todoId, todoId)
        )
      );

    res.json({ message: "Todo unlinked" });
  } catch (err) {
    if (handleRouteError(err, res)) return;
    console.error("Unlink todo error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Link/unlink stock routes (support both URL patterns)
router.post("/:id/stocks/:stockId", authMiddleware, handleLinkStock);
router.post("/:id/link-stock", authMiddleware, handleLinkStock);
router.delete("/:id/stocks/:stockId", authMiddleware, handleUnlinkStock);
router.delete("/:id/link-stock/:stockId", authMiddleware, handleUnlinkStock);

// Link/unlink todo routes (support both URL patterns)
router.post("/:id/todos/:todoId", authMiddleware, handleLinkTodo);
router.post("/:id/link-todo", authMiddleware, handleLinkTodo);
router.delete("/:id/todos/:todoId", authMiddleware, handleUnlinkTodo);
router.delete("/:id/link-todo/:todoId", authMiddleware, handleUnlinkTodo);

// DELETE /api/sources/:id
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [source] = await db
        .delete(sources)
        .where(eq(sources.id, id))
        .returning();

      if (!source) {
        res.status(404).json({ error: "Source not found" });
        return;
      }

      broadcast("source", "deleted", { id: source.id }, req.user!.userId);
      res.json({ message: "Source deleted" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Delete source error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
