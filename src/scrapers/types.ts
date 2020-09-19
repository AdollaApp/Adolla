import { ScraperResponse } from "../types";

/** All available scrapers */
export type Provider = "Mangasee";

export interface SearchOptions {
	resultCount: number;
}

/**
 * A scraper
 * This can be any of the scrapers
 */
export interface Scraper {
	provider: Provider;
	search(query: string, options?: Partial<SearchOptions>): Promise<ScraperResponse[]>;
	scrape(query: string, chapter?: number, season?: number): Promise<ScraperResponse>
}