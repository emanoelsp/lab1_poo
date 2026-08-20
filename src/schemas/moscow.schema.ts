import { z } from "zod";

export const moscowSchema = z.object({
  matrix: z.object({
    must: z.array(z.string()),
    should: z.array(z.string()),
    could: z.array(z.string()),
    wont: z.array(z.string()),
  }),
  justification: z
    .string()
    .min(100, "Justifique suas prioridades (mínimo 100 caracteres)"),
});

export type MoscowFormData = z.infer<typeof moscowSchema>;
