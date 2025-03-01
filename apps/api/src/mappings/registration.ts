import type { registrations } from '@/modules/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type RegistrationDto = {
  id: string;
  usernameSuggestion: string | null;
};

export function mapRegistration(reg: InferSelectModel<typeof registrations>): RegistrationDto {
  return {
    id: reg.id,
    usernameSuggestion: reg.usernameSuggestion,
  };
}
