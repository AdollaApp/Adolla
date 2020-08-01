
export interface Chapter {
	season: number;
	chapter: number;
	label: string;
	date: Date;
	href: string;
	progress?: Progress;
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
	chapterImages?: string[];
}

export interface Database {
	manga_cache: {
		[key: string]: MangaMeta;
	}
	reading: Reading;
}
export interface Reading {
	[key: string]: {
		[key: string]: Progress
	}
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
	progress?: Progress;
}

export interface Progress {
	/** Current page */
	current: number;
	/** Total pages in chapter */
	total: number
	/** Date timestamp */
	at: number;
	/** Season */
	season: number;
	/** Chapter */
	chapter: number;
	/** Progress in percentages */
	percentage?: number; // Between 0-100
	percentageColor?: string; // Used in list of chapters
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