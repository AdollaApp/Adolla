
export interface Chapter {
	season: number;
	chapter: number;
	label: string;
	date: Date;
	href: string;
}

export interface MangaMeta {
	slug: string;
	posterUrl: string;
	title: string;
	alternateTitles: string[];
	descriptionParagraphs: string[];
	genres: string[];
}
export interface MangaData {
	chapters: Chapter[];
}

export interface Database {
	manga_cache: {
		[key: string]: MangaMeta;
	}
	reading: any[] // TODO: Fix this.
}

// Scraper interfaces
export type ScraperResponse = StoredData | ScraperError;
export interface ScraperData {
	constant: MangaMeta;
	data: MangaData;
	success: true; // Always true
}
export interface ScraperError {
	status: number;
	err: string;
	success: false; // Always fale
}

export interface StoredData extends ScraperData {
	savedAt?: number;
}

// Search interfaces
export enum Directory {
	Genres = "g",
	Slug = "i",
	Title = "s",
	OngoingPublish = "ps", // Maybe?
	OngoingPrint = "ss", // Maybe?
}
export interface DirectoryItem {
	s: string;
	i: string;
	o: string;
	ss: string;
	ps: string;
	t: string;
	v: string;
	vm: string;
	y: string;
	a: string[];
	al: string[]
	l: string;
	lt: number;
	g: string[];
	h: boolean;
}