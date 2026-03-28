import { getSearchResults } from "$lib/hooks/search";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
  const searchResults = await getSearchResults(
    url.searchParams.get("q") || "",
    "weebcentral",
  );
  return {
    searchResults,
  };
};
