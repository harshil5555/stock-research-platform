import { z } from "zod";

export const upsertAnalysisSchema = z.object({
  thesis: z.string().max(10000).optional().nullable(),
  bullCase: z.string().max(10000).optional().nullable(),
  bearCase: z.string().max(10000).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  targetPrice: z.string().max(50).optional().nullable(),
});

export type UpsertAnalysisInput = z.infer<typeof upsertAnalysisSchema>;
