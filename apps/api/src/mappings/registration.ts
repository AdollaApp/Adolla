import type { Registration } from '@/modules/db/schema';

export type RegistrationDto = {
  id: string;
  usernameSuggestion: string | null;
};

export function mapRegistration(reg: Registration): RegistrationDto {
  return {
    id: reg.id,
    usernameSuggestion: reg.usernameSuggestion,
  };
}
