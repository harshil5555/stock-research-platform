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
import { AuthRequest, param, escapeLike, handleRouteError } from "../types";
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
      const { search, sourceType } = req.query;

      const conditions: SQL[] = [];
      if (search && typeof search === "string") {
        conditions.push(ilike(sources.title, `%${escapeLike(search)}%`));
      }
      if (sourceType && typeof sourceType === "string") {
        if (validSourceTypes.includes(sourceType as SourceType)) {
          conditions.push(
            eq(sources.sourceType, sourceType as SourceType)
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

      // Get linked stocks
      const linkedStocks = await db
        .select({
          id: stocks.id,
          ticker: stocks.ticker,
          companyName: stocks.companyName,
        })
        .from(sourceStocks)
        .innerJoin(stocks, eq(sourceStocks.stockId, stocks.id))
        .where(eq(sourceStocks.sourceId, source.id));

      // Get linked todos
      const linkedTodos = await db
        .select({
          id: todos.id,
          title: todos.title,
          status: todos.status,
        })
        .from(sourceTodos)
        .innerJoin(todos, eq(sourceTodos.todoId, todos.id))
        .where(eq(sourceTodos.sourceId, source.id));

      // Get attachments
      const linkedAttachments = await db
        .select()
        .from(attachments)
        .where(eq(attachments.sourceId, source.id));

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
