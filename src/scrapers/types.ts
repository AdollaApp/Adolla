import { ScraperResponse } from "../types";

/** All available scrapers */
export type Provider = "Mangasee" | "Mangadex";
export type ProviderId = "mangasee" | "mangadex";

export interface SearchOptions {
	resultCount: number;
}

export interface SearchError {
	error: string;
}

/**
 * A scraper
 * This can be any of the scrapers
 */
export abstract class Scraper {
	public provider: Provider;
	public canSearch: boolean;
	public abstract scrape(slug: any, chapterId?: string | number): Promise<ScraperResponse>;
	public abstract search(query: string, options?: Partial<SearchOptions>): Promise<ScraperResponse[] | SearchError>;
}