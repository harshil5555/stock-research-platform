import { Router, Response } from "express";
import { eq, desc, asc, ilike, and, SQL } from "drizzle-orm";
import { db } from "../db";
import { todos } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createTodoSchema,
  updateTodoSchema,
  patchTodoStatusSchema,
} from "../validators/todos";
import { AuthRequest, param, escapeLike, handleRouteError, UUID_RE } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

const validTodoStatuses = ["pending", "in_progress", "done"] as const;
type TodoStatus = (typeof validTodoStatuses)[number];

// GET /api/todos
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, assignedTo, search, sort, order, priority } = req.query;

      const conditions: SQL[] = [];

      if (status && typeof status === "string") {
        if (validTodoStatuses.includes(status as TodoStatus)) {
          conditions.push(eq(todos.status, status as TodoStatus));
        }
      }
      if (assignedTo && typeof assignedTo === "string") {
        if (UUID_RE.test(assignedTo)) {
          conditions.push(eq(todos.assignedTo, assignedTo));
        }
      }
      if (priority && typeof priority === "string") {
        const p = parseInt(priority, 10);
        if (!isNaN(p) && p >= 0 && p <= 10) {
          conditions.push(eq(todos.priority, p));
        }
      }
      if (search && typeof search === "string") {
        conditions.push(ilike(todos.title, `%${escapeLike(search)}%`));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const sortColumn =
        sort === "priority"
          ? todos.priority
          : sort === "title"
            ? todos.title
            : todos.createdAt;
      const orderDir = order === "asc" ? asc(sortColumn) : desc(sortColumn);

      const result = await db
        .select({
          id: todos.id,
          title: todos.title,
          description: todos.description,
          status: todos.status,
          priority: todos.priority,
          createdBy: todos.createdBy,
          assignedTo: todos.assignedTo,
          dueDate: todos.dueDate,
          createdAt: todos.createdAt,
          updatedAt: todos.updatedAt,
        })
        .from(todos)
        .where(where)
        .orderBy(orderDir);

      res.json(result);
    } catch (err) {
      console.error("List todos error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/todos/:id
router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [todo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, id))
        .limit(1);

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      res.json(todo);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Get todo error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/todos
router.post(
  "/",
  authMiddleware,
  validate(createTodoSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [todo] = await db
        .insert(todos)
        .values({
          ...req.body,
          createdBy: req.user!.userId,
        })
        .returning();

      broadcast("todo", "created", todo, req.user!.userId);
      res.status(201).json(todo);
    } catch (err) {
      console.error("Create todo error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/todos/:id
router.put(
  "/:id",
  authMiddleware,
  validate(updateTodoSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [todo] = await db
        .update(todos)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(todos.id, id))
        .returning();

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      broadcast("todo", "updated", todo, req.user!.userId);
      res.json(todo);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Update todo error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PATCH /api/todos/:id/status
router.patch(
  "/:id/status",
  authMiddleware,
  validate(patchTodoStatusSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [todo] = await db
        .update(todos)
        .set({ status: req.body.status, updatedAt: new Date() })
        .where(eq(todos.id, id))
        .returning();

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      broadcast("todo", "updated", todo, req.user!.userId);
      res.json(todo);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Patch todo status error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/todos/:id
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");
      const [todo] = await db
        .delete(todos)
        .where(eq(todos.id, id))
        .returning();

      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }

      broadcast("todo", "deleted", { id: todo.id }, req.user!.userId);
      res.json({ message: "Todo deleted" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Delete todo error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
