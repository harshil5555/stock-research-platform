import { z } from "zod";

export const createDecisionSchema = z.object({
  status: z.enum([
    "researching",
    "considering",
    "bought",
    "passed",
    "sold",
    "watching",
  ]),
  reasoning: z.string().max(5000).optional().nullable(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
