import { z } from "zod";

export const createSourceSchema = z.object({
  title: z.string().min(1).max(500),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().max(2000).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
});

export const updateSourceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().max(2000).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
