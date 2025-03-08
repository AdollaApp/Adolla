import type { ArrayValues } from 'type-fest';
import { typeidUnboxed } from 'typeid-js';

const _types = [
  'usr', // user
  'ses', // user session
  'reg', // registrations
  'prg', // progress items
  'lst', // list
  'ltm', // list item
] as const;

export function getId(prefix: ArrayValues<typeof _types>): string {
  return typeidUnboxed(prefix);
}
