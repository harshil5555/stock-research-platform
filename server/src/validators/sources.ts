import { z } from "zod";

export const createSourceSchema = z.object({
  title: z.string().min(1).max(255),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
});

export const updateSourceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
