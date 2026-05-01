import { getSearchResults } from "$lib/hooks/search";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
  const query = url.searchParams.get("q") || ""
  try {
    const searchResults = query.length > 3 ? await getSearchResults(
      query,
      "weebcentral",
    ) : []
    return {
      searchResults,
      query,
      err: null
    };
  } catch (err) {
    return {
      query,
      searchResults: [],
      err,
    }
  }
};
