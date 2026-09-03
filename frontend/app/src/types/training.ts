import { z } from "zod";

export interface TrainingOption {
  name: string;
}

// Session get request

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

// Allergy get request
export const AllergySchema = z.object({
  id: z.number(),
  name: z.string()
});

export const AllergyConfigSchema = PaginatedSchema(AllergySchema);

export type Allergy = z.infer<typeof AllergySchema>

// Session creation

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

// Chat message turn
export type ActorRole = 'AI' | 'User' | 'System';

export type TrainingSessionStatus =
  | 'Ongoing'
  | 'Completed';

export interface ConversationTurn {
  uuid: string;
  role: ActorRole;
  content: string;
  created_at: string;
}

export interface SendMessageResponse {
  status: 'accepted';
  message_uuid: string;
}

export interface TrainingSession {
  uuid: string;
  status: TrainingSessionStatus;
  score: number;
  started_at: string;
  last_edited: string | null;
  end_at: string | null;
  current_step: number | null;
}

