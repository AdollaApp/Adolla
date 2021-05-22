import { ScraperResponse } from "../types";

/** All available scrapers */
export type Provider =
	| "Mangasee"
	| "Mangadex"
	| "RCO"
	| "nhentai"
	| "nhentainet"
	| "Manganelo"
	| "ComicExtra"
	| "Mangahere"
	| "Mangadex5";
export type ProviderId =
	| "mangasee"
	| "mangadex"
	| "rco"
	| "nhentai"
	| "nhentainet"
	| "manganelo"
	| "comicextra"
	| "mangahere"
	| "mangadex5";

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
	public nsfw: boolean;
	public searchDisplay?: string;

	public abstract scrape(
		slug: string | number,
		chapterId?: string | number
	): Promise<ScraperResponse>;

	public abstract search(
		query: string,
		options?: Partial<SearchOptions>
	): Promise<ScraperResponse[] | SearchError>;
}
