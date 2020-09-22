import { ScraperResponse } from "../types";

/** All available scrapers */
export type Provider = "Mangasee" | "Mangadex";
export type ProviderId = "mangasee" | "mangadex";

export interface SearchOptions {
	resultCount: number;
}

/**
 * A scraper
 * This can be any of the scrapers
 */
export abstract class Scraper {
	public provider: Provider;
	public abstract search(query: string, options?: Partial<SearchOptions>): Promise<ScraperResponse[]>;
	public abstract scrape(slug: any, chapterId?: string | number): Promise<ScraperResponse>;
}