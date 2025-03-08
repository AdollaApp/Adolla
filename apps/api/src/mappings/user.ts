import type { User } from '@/modules/db/schema';
import type { Roles } from '@/utils/auth/roles';
import type { EnumType } from '@/utils/types';

export type ShallowUserDto = {
  id: string;
  username: string;
  createdAt: string;
  loginSource: AccountType[];
  roles: Roles[];
};

export type UserDto = {
  id: string;
  username: string;
  createdAt: string;
};

export const accountType = {
  discord: 'discord',
} as const;
export type AccountType = EnumType<typeof accountType>;

export function mapShallowUserForAdmins(user: User): ShallowUserDto {
  const accountTypes: AccountType[] = [];
  if (user.discordId) accountTypes.push(accountType.discord);
  return {
    id: user.id,
    createdAt: user.createdAt.toISOString(),
    loginSource: accountTypes,
    username: user.username,
    roles: user.roles as Roles[],
  };
}

export function mapUserForSelf(user: User): UserDto {
  return {
    id: user.id,
    createdAt: user.createdAt.toISOString(),
    username: user.username,
  };
}
