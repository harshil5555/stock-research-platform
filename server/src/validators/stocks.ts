import { z } from "zod";

export const createStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase()),
  companyName: z.string().min(1).max(500),
  sector: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase())
    .optional(),
  companyName: z.string().min(1).max(500).optional(),
  sector: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
