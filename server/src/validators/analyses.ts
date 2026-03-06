import { z } from "zod";
import { stripHtml } from "../utils/sanitize";

export const upsertAnalysisSchema = z.object({
  thesis: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  bullCase: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  bearCase: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  notes: z.string().max(10000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
  targetPrice: z.string().max(50).optional().nullable().transform((v) => v ? stripHtml(v) : v),
});

export type UpsertAnalysisInput = z.infer<typeof upsertAnalysisSchema>;
