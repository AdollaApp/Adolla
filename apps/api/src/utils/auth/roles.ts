import type { EnumType } from '../types';

export const roles = {
  user: 'user', // Every user has this role automatically
  super: 'super', // can do everything, even the sketchy stuff
} as const;
export type Roles = EnumType<typeof roles>;
