import { z } from "zod";
import { stripHtml } from "../utils/sanitize";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(255).transform(stripHtml),
  description: z.string().max(5000).optional().transform((v) => v ? stripHtml(v) : v),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]).transform((v) => new Date(v)).optional().nullable(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).transform(stripHtml).optional(),
  description: z.string().max(5000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ]).transform((v) => new Date(v)).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export const patchTodoStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "done"]),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
