export const apiErrorCodes = {
  authInvalidToken: 'Invalid or expired auth token',
  authMissingPermissions:
    'The user does not have access to this resource or action',
  authInvalidInput: 'Invalid credentials have been supplied',
  notFound: 'Resource could not be found',
  invalid: 'The request was invalid',
} as const;

export type ApiErrorCodes = keyof typeof apiErrorCodes;
