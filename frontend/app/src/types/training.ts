import { z } from "zod";

export interface TrainingOption {
  name: string;
}
const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });

export const SessionScenarioSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  guest_count: z.number(),
  dining_type: z.object({ name: z.string() }),
  allergy: z.object({ name: z.string() }),
});

export const TrainingConfigSchema = PaginatedSchema(SessionScenarioSchema);

export type SessionScenario = z.infer<typeof SessionScenarioSchema>;
export type TrainingConfig = z.infer<typeof TrainingConfigSchema>;


export const AllergySchema = z.object({
  id: z.number(),
  name: z.string()
});

export const AllergyConfigSchema = PaginatedSchema(AllergySchema);

export type Allergy = z.infer<typeof AllergySchema>
export type AllergyConfig = z.infer<typeof AllergyConfigSchema>;

