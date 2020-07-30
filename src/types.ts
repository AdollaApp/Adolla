
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
}
export interface MangaData {
	chapters: Chapter[]
}

interface Manga {
	// Todo. obviously.
}

export interface Database {
	manga_cache: {
		[key: string]: MangaMeta;
	}
	reading: Manga[]
}

// Scraper interfaces
export interface ScraperData {
	constant: MangaMeta;
	data: MangaData;
	success: boolean;
}
export interface ScraperError {
	status: number;
	err: string;
	success: boolean;
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