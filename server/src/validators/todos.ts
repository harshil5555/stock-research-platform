import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const patchTodoStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "done"]),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
