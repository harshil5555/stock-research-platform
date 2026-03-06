import { z } from "zod";
import { stripHtml } from "../utils/sanitize";

export const createStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => stripHtml(v).toUpperCase()),
  companyName: z.string().min(1).max(500).transform(stripHtml),
  sector: z.string().max(100).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  notes: z.string().max(5000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
});

export const updateStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => stripHtml(v).toUpperCase())
    .optional(),
  companyName: z.string().min(1).max(500).transform(stripHtml).optional(),
  sector: z.string().max(100).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  notes: z.string().max(5000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
