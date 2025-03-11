import type { RequestEvent } from "@sveltejs/kit";
import Cookies from 'js-cookie'

const getCookieExpiryDate = () => new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 90)); // its a date

export function getAuthForServer(event: RequestEvent): string | null {
  return event.cookies.get('auth') ?? null;
}

export function getAuth(): string | null {
  if (!globalThis.window?.document) return null;
  const token = Cookies.get('auth');
  if (token) setAuth(token);
  return token ?? null;
}

export function setAuth(token: string) {
  if (!globalThis.window?.document) return;
  Cookies.set('auth', token, {
    path: "/",
    expires: getCookieExpiryDate(),
    sameSite: "Strict",
  });
}

export function setAuthForServer(event: RequestEvent, token: string) {
  event.cookies.set('auth', token, {
    path: "/",
    expires: getCookieExpiryDate(),
    sameSite: "strict",
  })
}
