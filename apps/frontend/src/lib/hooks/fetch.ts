import {
  createFetch,
  type FetchOptions,
  type FetchRequest,
  type ResponseType,
} from "ofetch";
import { env } from "$env/dynamic/public";
import { getAuth } from "./auth";

export function isExternalApiUrl(url: string) {
  return url.startsWith(env.PUBLIC_EXTERNAL_API_BASEURL ?? "");
}

export function isInternalApiUrl(url: string) {
  return url.startsWith(env.PUBLIC_INTERNAL_API_BASEURL ?? "");
}

export function replaceExternalUrlWithInternal(url: string) {
  return url.replace(
    env.PUBLIC_EXTERNAL_API_BASEURL ?? "",
    env.PUBLIC_INTERNAL_API_BASEURL ?? "",
  );
}

export const api = {
  fetch<T = any, R extends ResponseType = "json">(
    request: FetchRequest,
    options?: FetchOptions<R>,
  ) {
    return this.useFetch<T, R>(globalThis.fetch, request, options);
  },
  useFetch<T = any, R extends ResponseType = "json">(
    fetch: any,
    request: FetchRequest,
    options?: FetchOptions<R>,
  ) {
    const token = getAuth();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const newFetch = createFetch({
      fetch,
    });
    return newFetch.create({
      baseURL: env.PUBLIC_EXTERNAL_API_BASEURL,
      headers,
    })<T, R>(request, options);
  },
};
