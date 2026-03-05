import { z } from "zod";

export const upsertAnalysisSchema = z.object({
  thesis: z.string().optional().nullable(),
  bullCase: z.string().optional().nullable(),
  bearCase: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  targetPrice: z.string().max(50).optional().nullable(),
});

export type UpsertAnalysisInput = z.infer<typeof upsertAnalysisSchema>;
