
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
	res: string;
	success: boolean;
}