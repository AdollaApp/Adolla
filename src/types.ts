import { ProviderId } from "./scrapers/types";

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
	/**
	 * How far along the user is.
	 * This is everchanging, but also optional
	 */
	progress?: Progress;
	realProgress?: Progress;
	/** Season and chapter combined for sorting purposes, for example 300012 */
	combined?: number;
	/**
	 * Href string, really just the chaptor indicator
	 * For mangasee, this is "x-y".
	 * MangaDex has a unique ID for each chapter, so that's just a number sequence
	 */
	hrefString: string;
}

/** Used in manga.constant, these are mostly unchanging */
export interface MangaMeta {
	/** Manga's slug. For Mangasee this is readable (such as Fire-Brigade-Of-Flames), for MD this is an ID */
	slug: string;
	/** Full URL to cover art */
	posterUrl: string;
	/** Primary name of manga (say, "Tower of God" or "Fire Force") */
	title: string;
	/** Alternate titles (in other languages and such) */
	alternateTitles: string[];
	/** Array of paragraps. Each item is a paragraph and is shown in a <p> tag */
	descriptionParagraphs: string[];
	/** Genres as a string */
	genres: string[];
	/** If the manga is NSFW or not */
	nsfw: boolean;
	/** Optional banner, Twitter-like banner. Taken from anilist */
	banner?: string;
}
/** Stored under manga.data, used for more dynamic stuff */
export interface MangaData {
	chapters: Chapter[];
	chapterImages?: string[];
	hasSeasons?: boolean; // if there's more than one "season" in the chapters
	status: string;
}

/** Entire database structure */
export interface Database {
	reading_new: Reading;
	other: {
		host?: string;
	};
	notified: {
		[key: string]: {
			[key: string]: true; //
		};
	};
	lists: List[];
	settings: {
		icon: string;
		"show-nsfw": "yes" | "no";
		"store-nsfw": "yes" | "no";
	};
}
/** Save what the user is currently reading */
export interface Reading {
	[key: string]: {
		[key: string]: Progress;
	};
}

// Scraper interfaces
export type ScraperResponse = StoredData | ScraperError;
/** Data returned by scrapers */
export interface ScraperData {
	constant: MangaMeta;
	data: MangaData;
	provider: ProviderId; // All possible scrapers. Useful for future proofing
	success: true; // Always true
}
/** Error object thrown by scrapers */
export interface ScraperError {
	status: number;
	err: string;
	success: false; // Always false
}

/** Extended ScrapeData with front-end variables */
export interface StoredData extends ScraperData {
	savedAt?: number;
	progress?: Progress;
	realProgress?: Progress;
	isInProgress?: boolean;
	unreadChapterCount?: number;
}

/** Object for progress. Can be stored under ["manga-slug"]["1-5"] */
export interface Progress {
	/** Current page */
	current: number;
	/** Total pages in chapter */
	total: number;
	/** Date timestamp */
	at: number;
	/**
	 * Slug format per scraper
	 * For mangasee that's season-chapter,
	 * MangaDex has its own ID for each chapter
	 */
	chapterId: string | number;
	/** Progress in percentages */
	percentage?: number; // Between 0-100
	percentageColor?: string; // Used in list of chapters
	/** Is new? */
	new?: boolean;
}

/** "List" type. Used for users to store manga */
export interface List {
	showOnHome: boolean;
	byCreator?: boolean;
	name: string;
	slug: string;
	last?: number;
	entries: {
		slug: string;
		provider?: string;
		data?: ScraperResponse;
	}[];
}
