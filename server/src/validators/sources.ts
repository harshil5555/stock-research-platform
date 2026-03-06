import { z } from "zod";
import { stripHtml } from "../utils/sanitize";

export const createSourceSchema = z.object({
  title: z.string().min(1).max(500).transform(stripHtml),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().max(2000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  notes: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
});

export const updateSourceSchema = z.object({
  title: z.string().min(1).max(500).transform(stripHtml).optional(),
  url: z.string().url().optional().nullable(),
  sourceType: z
    .enum(["article", "video", "podcast", "report", "tweet", "other"])
    .optional(),
  summary: z.string().max(2000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  notes: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  stockIds: z.array(z.string().uuid()).optional(),
  todoIds: z.array(z.string().uuid()).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
