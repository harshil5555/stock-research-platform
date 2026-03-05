import { z } from "zod";

export const createCommentSchema = z.object({
  entityType: z.enum(["source", "stock", "todo"]),
  entityId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  body: z.string().min(1).max(5000),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
