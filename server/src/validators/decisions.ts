import { z } from "zod";
import { stripHtml } from "../utils/sanitize";

export const createDecisionSchema = z.object({
  status: z.enum([
    "researching",
    "considering",
    "bought",
    "passed",
    "sold",
    "watching",
  ]),
  reasoning: z.string().max(5000).optional().nullable().transform((v) => v ? stripHtml(v) : v),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
