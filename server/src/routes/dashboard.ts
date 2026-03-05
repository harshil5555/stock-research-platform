import { Router, Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { stocks, sources, todos, comments, decisions } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// GET /api/dashboard/stats
router.get(
  "/stats",
  authMiddleware,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [[stockCount], [sourceCount], [todoCount], [pendingCount]] =
        await Promise.all([
          db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(stocks),
          db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(sources),
          db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(todos),
          db
            .select({ count: sql<number>`cast(count(*) as int)` })
            .from(todos)
            .where(eq(todos.status, "pending")),
        ]);

      // Build recent activity from multiple tables
      const [recentStocks, recentSources, recentTodos, recentDecisions, recentComments] =
        await Promise.all([
          db
            .select({
              id: stocks.id,
              createdAt: stocks.createdAt,
              userId: stocks.createdBy,
              description: stocks.ticker,
            })
            .from(stocks)
            .orderBy(desc(stocks.createdAt))
            .limit(5),
          db
            .select({
              id: sources.id,
              createdAt: sources.createdAt,
              userId: sources.createdBy,
              description: sources.title,
            })
            .from(sources)
            .orderBy(desc(sources.createdAt))
            .limit(5),
          db
            .select({
              id: todos.id,
              createdAt: todos.createdAt,
              userId: todos.createdBy,
              description: todos.title,
            })
            .from(todos)
            .orderBy(desc(todos.createdAt))
            .limit(5),
          db
            .select({
              id: decisions.id,
              createdAt: decisions.createdAt,
              userId: decisions.userId,
              description: decisions.status,
            })
            .from(decisions)
            .orderBy(desc(decisions.createdAt))
            .limit(5),
          db
            .select({
              id: comments.id,
              createdAt: comments.createdAt,
              userId: comments.createdBy,
              description: comments.body,
            })
            .from(comments)
            .orderBy(desc(comments.createdAt))
            .limit(5),
        ]);

      const recentActivity = [
        ...recentStocks.map((r) => ({
          id: r.id,
          type: "stock_added" as const,
          description: `Added stock ${r.description}`,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
        ...recentSources.map((r) => ({
          id: r.id,
          type: "source_added" as const,
          description: `Added source "${r.description}"`,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
        ...recentTodos.map((r) => ({
          id: r.id,
          type: "todo_created" as const,
          description: `Created todo "${r.description}"`,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
        ...recentDecisions.map((r) => ({
          id: r.id,
          type: "decision_made" as const,
          description: `Decision: ${r.description}`,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
        ...recentComments.map((r) => ({
          id: r.id,
          type: "comment_added" as const,
          description: `Comment: "${(r.description || "").slice(0, 80)}"`,
          createdAt: r.createdAt,
          userId: r.userId,
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      res.json({
        totalStocks: stockCount.count,
        totalSources: sourceCount.count,
        totalTodos: todoCount.count,
        pendingTodos: pendingCount.count,
        recentActivity,
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
