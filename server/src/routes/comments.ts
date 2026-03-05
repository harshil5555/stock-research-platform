import { Router, Response } from "express";
import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comments";
import { AuthRequest, param, handleRouteError, UUID_RE } from "../types";
import { broadcast } from "../ws/broadcast";

const router = Router();

const validEntityTypes = ["source", "stock", "todo"] as const;
type EntityType = (typeof validEntityTypes)[number];

// GET /api/comments?entityType=source&entityId=xxx
router.get(
  "/",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { entityType, entityId } = req.query;

      if (!entityType || !entityId) {
        res
          .status(400)
          .json({ error: "entityType and entityId are required" });
        return;
      }

      if (
        typeof entityType !== "string" ||
        !validEntityTypes.includes(entityType as EntityType)
      ) {
        res.status(400).json({ error: "Invalid entityType" });
        return;
      }

      if (typeof entityId !== "string" || !UUID_RE.test(entityId)) {
        res.status(400).json({ error: "Invalid entityId" });
        return;
      }

      // Get top-level comments with user info
      const topLevelComments = await db
        .select({
          id: comments.id,
          entityType: comments.entityType,
          entityId: comments.entityId,
          parentId: comments.parentId,
          body: comments.body,
          createdBy: comments.createdBy,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          authorName: users.displayName,
          authorUsername: users.username,
        })
        .from(comments)
        .innerJoin(users, eq(comments.createdBy, users.id))
        .where(
          and(
            eq(comments.entityType, entityType as EntityType),
            eq(comments.entityId, entityId),
            isNull(comments.parentId)
          )
        )
        .orderBy(desc(comments.createdAt));

      // Get all replies for these comments
      const allReplies = await db
        .select({
          id: comments.id,
          entityType: comments.entityType,
          entityId: comments.entityId,
          parentId: comments.parentId,
          body: comments.body,
          createdBy: comments.createdBy,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          authorName: users.displayName,
          authorUsername: users.username,
        })
        .from(comments)
        .innerJoin(users, eq(comments.createdBy, users.id))
        .where(
          and(
            eq(comments.entityType, entityType as EntityType),
            eq(comments.entityId, entityId)
          )
        )
        .orderBy(comments.createdAt);

      // Build threaded structure
      const repliesMap = new Map<string, typeof allReplies>();
      for (const reply of allReplies) {
        if (reply.parentId) {
          const existing = repliesMap.get(reply.parentId) || [];
          existing.push(reply);
          repliesMap.set(reply.parentId, existing);
        }
      }

      const threaded = topLevelComments.map((comment) => ({
        ...comment,
        replies: repliesMap.get(comment.id) || [],
      }));

      res.json(threaded);
    } catch (err) {
      console.error("List comments error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/comments (with parentId validation)
router.post(
  "/",
  authMiddleware,
  validate(createCommentSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Validate parentId if provided
      if (req.body.parentId) {
        const [parent] = await db
          .select({
            id: comments.id,
            entityType: comments.entityType,
            entityId: comments.entityId,
            parentId: comments.parentId,
          })
          .from(comments)
          .where(eq(comments.id, req.body.parentId))
          .limit(1);

        if (!parent) {
          res.status(400).json({ error: "Parent comment not found" });
          return;
        }

        // Only allow replying to top-level comments (no nested replies)
        if (parent.parentId !== null) {
          res.status(400).json({
            error: "Cannot reply to a reply; only top-level comments accept replies",
          });
          return;
        }

        // Ensure reply is in the same entity context
        if (
          parent.entityType !== req.body.entityType ||
          parent.entityId !== req.body.entityId
        ) {
          res.status(400).json({
            error: "Reply must be in the same entity context as parent",
          });
          return;
        }
      }

      const [comment] = await db
        .insert(comments)
        .values({
          ...req.body,
          createdBy: req.user!.userId,
        })
        .returning();

      // Fetch with user info for broadcast
      const [full] = await db
        .select({
          id: comments.id,
          entityType: comments.entityType,
          entityId: comments.entityId,
          parentId: comments.parentId,
          body: comments.body,
          createdBy: comments.createdBy,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          authorName: users.displayName,
          authorUsername: users.username,
        })
        .from(comments)
        .innerJoin(users, eq(comments.createdBy, users.id))
        .where(eq(comments.id, comment.id))
        .limit(1);

      broadcast("comment", "created", full, req.user!.userId);
      res.status(201).json(full);
    } catch (err) {
      console.error("Create comment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/comments/:id
router.put(
  "/:id",
  authMiddleware,
  validate(updateCommentSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");

      // Only allow editing own comments
      const [existing] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);

      if (!existing) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }

      if (existing.createdBy !== req.user!.userId) {
        res
          .status(403)
          .json({ error: "You can only edit your own comments" });
        return;
      }

      const [comment] = await db
        .update(comments)
        .set({ body: req.body.body, updatedAt: new Date() })
        .where(eq(comments.id, id))
        .returning();

      broadcast("comment", "updated", comment, req.user!.userId);
      res.json(comment);
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Update comment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/comments/:id (H6 fix: delete child replies too)
router.delete(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = param(req, "id");

      const [existing] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1);

      if (!existing) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }

      if (existing.createdBy !== req.user!.userId) {
        res
          .status(403)
          .json({ error: "You can only delete your own comments" });
        return;
      }

      // Delete child replies first, then the comment itself
      await db.delete(comments).where(eq(comments.parentId, id));
      await db.delete(comments).where(eq(comments.id, id));

      broadcast(
        "comment",
        "deleted",
        {
          id: existing.id,
          entityType: existing.entityType,
          entityId: existing.entityId,
        },
        req.user!.userId
      );
      res.json({ message: "Comment deleted" });
    } catch (err) {
      if (handleRouteError(err, res)) return;
      console.error("Delete comment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
