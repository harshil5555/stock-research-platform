import { z } from "zod";

export const createStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase()),
  companyName: z.string().min(1).max(255),
  sector: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateStockSchema = z.object({
  ticker: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase())
    .optional(),
  companyName: z.string().min(1).max(255).optional(),
  sector: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
