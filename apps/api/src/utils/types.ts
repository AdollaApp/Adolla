export type EnumType<E extends Record<string, string>> = E[keyof E];
