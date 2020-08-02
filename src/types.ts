
/** This is a single chapter */
export interface Chapter {
	/** Season of chapter */
	season: number;
	/** Chapter number */
	chapter: number;
	/** Label, for example "Chapter 123" or "Z= 123" */
	label: string;
	/** Manga's date */
	date: Date;
	/** String to chapter page, for example "/Fire-Brigade-Of-Flames/1-15/" */
	href: string;
	/**
	 * How far along the user is.
	 * This is everchanging, but also optional
	 */
	progress?: Progress;
	realProgress?: Progress;
	/** Season and chapter combined for sorting purposes, for example 300012 */
	combined?: number;
}

/** Used in manga.constant, these are mostly unchanging */
export interface MangaMeta {
	slug: string;
	posterUrl: string;
	title: string;
	alternateTitles: string[];
	descriptionParagraphs: string[];
	genres: string[];
}
/** Stored under manga.data, used for more dynamic stuff */
export interface MangaData {
	chapters: Chapter[];
	chapterImages?: string[];
}

/** Entire database structure */
export interface Database {
	manga_cache: {
		[key: string]: MangaMeta;
	}
	reading: Reading;
}
/** Save what the user is currently reading */
export interface Reading {
	[key: string]: {
		[key: string]: Progress
	}
}

// Scraper interfaces
export type ScraperResponse = StoredData | ScraperError;
/** Data returned by scrapers */
export interface ScraperData {
	constant: MangaMeta;
	data: MangaData;
	provider: "Mangasee"; // All possible scrapers. Useful for future proofing
	success: true; // Always true
}
/** Error object thrown by scrapers */
export interface ScraperError {
	status: number;
	err: string;
	success: false; // Always fale
}

/** Extended ScrapeData with front-end variables */
export interface StoredData extends ScraperData {
	savedAt?: number;
	progress?: Progress;
	realProgress?: Progress;
}

/** Object for progress. Can be stored under ["manga-slug"]["1-5"] */
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
/** This is for `DirectoryItem`, the values there aren't very useful */
export enum Directory {
	Genres = "g",
	Slug = "i",
	Title = "s",
	OngoingPublish = "ps", // Maybe?
	OngoingPrint = "ss", // Maybe?
	AlternateTitles = "al"
}
/** This is what the API holds in the Directory array. Fun. */
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