import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export const patchTodoStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "done"]),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
