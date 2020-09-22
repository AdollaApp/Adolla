
// Utility function for search

import { ProviderId, Scraper, SearchOptions } from "../scrapers/types";
import * as scrapers from "../scrapers";
import { getScraperName } from "../routers/manga-page";

export async function doSearch(provider: ProviderId, query: string = "", searchOptions: Partial<SearchOptions> = {}) {
	
	// Get and verify scraper
	let scraper: Scraper | undefined = scrapers[getScraperName(provider)];
	if(!scraper) {
		return null;
	}

	// Get search results
	let searchResults = await scraper.search(query, {
		...searchOptions,
		resultCount: 20
	});

	// Give back results
	return searchResults || []; // Return empty array if there's an error
}