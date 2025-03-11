import { getAuthForServer } from "$lib/hooks/auth";
import { isExternalApiUrl, isInternalApiUrl, replaceExternalUrlWithInternal } from "$lib/hooks/fetch";
import type { Handle, HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	if (isExternalApiUrl(request.url)) {
		request = new Request(
			replaceExternalUrlWithInternal(request.url),
			request
		);
	}

  if (isInternalApiUrl(request.url)) {
    const token = getAuthForServer(event);
    if (token) request.headers.append('Authorization', `Bearer ${token}`);
  }

	return fetch(request);
};

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => {
      const allowedHeaders = ['content-type'];
      return allowedHeaders.includes(name);
    }
  });
	return response;
};
