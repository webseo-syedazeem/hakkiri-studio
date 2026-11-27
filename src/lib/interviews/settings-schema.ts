import { z } from "zod";

const Weight = z.number().min(0).max(100);

/** Session settings as the API accepts them (checked again with mixIsValid). */
export const SettingsBody = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  minutes: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(45), z.literal(60)]),
  preset: z.enum(["balanced", "skills", "technical", "screening", "final", "custom"]),
  mix: z.object({ motivation: z.number(), competency: z.number(), technical: z.number(), cv: z.number(), curveball: z.number() }),
  /** The person's own question focus (Competency & Behavioural, Strengths…), kept so the screens show what they chose. */
  categoryWeights: z
    .object({
      competency: Weight,
      strengths: Weight,
      technical: Weight,
      experience: Weight,
      motivation: Weight,
      situational: Weight,
      caseStudy: Weight,
      leadership: Weight,
      curveball: Weight,
      valuesCulture: Weight,
    })
    .partial()
    .optional(),
});
