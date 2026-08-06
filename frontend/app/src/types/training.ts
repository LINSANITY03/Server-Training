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
  is_active: z.boolean(),
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

export const CreateSessionPayloadSchema = z.object({
  scenario: z.number(),
  guest_profile: z.object({
    guest_count: z.number(),
    personality: z.string(),
    knowledge_level: z.string(),
    allergies: z.array(z.number()),
  })
});

export type CreateSession = z.infer<typeof CreateSessionPayloadSchema>;
export const SessionSchema = z.object({
  uuid: z.string(),
})


