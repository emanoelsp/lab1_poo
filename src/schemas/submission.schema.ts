import { z } from "zod";

export const storyPointsSchema = z.record(
  z.string(),
  z.number().refine((v) => [1, 2, 3, 5, 8, 13].includes(v), {
    message: "Story Point deve ser da sequência de Fibonacci: 1, 2, 3, 5, 8 ou 13",
  })
);

export const deliverySchema = z.object({
  finalStoryPoints: storyPointsSchema,
  storyPointsJustification: z.string().min(20, "Explique a diferença entre estimativa e realidade (mínimo 20 caracteres)"),
  githubLink: z.string().url("Informe um link GitHub válido").includes("github.com", { message: "O link deve ser do GitHub" }),
  pdfUrl: z.string().min(1, "Faça o upload do PDF antes de finalizar"),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;
