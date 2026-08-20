import { z } from "zod";

export const profileSchema = z.object({
  groupMembers: z
    .array(z.string().min(2, "Nome deve ter ao menos 2 caracteres"))
    .min(1, "Informe ao menos um integrante")
    .max(4, "Máximo de 4 integrantes"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
