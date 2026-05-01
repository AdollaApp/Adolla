import { getSearchResults } from "$lib/hooks/search";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, params }) => {
  const query = url.searchParams.get("q") || ""
  const provider = params.providerId || "weebcentral"
  try {
    const searchResults = query.length > 3 ? await getSearchResults(
      query,
      provider,
    ) : []
    return {
      searchResults,
      query,
      err: null,
      provider
    };
  } catch (err) {
    return {
      query,
      searchResults: [],
      err,
      provider
    }
  }
};
