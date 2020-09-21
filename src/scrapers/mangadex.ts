
import { ScraperError, Chapter, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import md from "mangadex-api";
import fetch from "node-fetch";

class MangadexClass extends Scraper {

	constructor() {
		super();
		this.provider = "Mangadex";
	}

	public async scrape(slug: string, chapterId: number = -1): Promise<ScraperResponse> {
		
		let id = Number(slug);
		
		// Get main data
		let data = await md.getManga(id);

		// Chapters
		let chapters = data.chapter
		  .filter(c => c.lang_code.includes("en") || c.lang_code.includes("gb"))

		// Get largest volume count
		let largestVolumeCount = 0;
		for(let chapter of chapters) {
			let volume = Number(chapter.volume);
			if(volume > largestVolumeCount) largestVolumeCount = volume;
		}
		
		// Map chapters to new format
		let newChapters: Chapter[] = chapters.map(c => {
			let volume = Number(c.volume) || largestVolumeCount + 1;
			let chapter = Number(c.chapter);
			return {
				season: volume,
				chapter,
				label: `vol ${volume} ch ${chapter ?? "??"}`,
				date: new Date(c.timestamp * 1e3),
				combined: (volume * 1e5) + chapter,
				hrefString: c.id.toString()
			};
		}).sort((a, b) => a.combined - b.combined);

		// Get chapter-relevant data
		// Just images I think
		let chapterImages: string[] = [];
		if(chapterId && chapterId !== null && chapterId !== -1) {
			let chapter = await md.getChapter(Number(chapterId));

			let imagePromises = chapter.page_array.map(async url => {
				// @ts-ignore node-fetch's TS does not have buffer in its stuff
				let base64 = await fetch(url).then(r => r.buffer()).then(buf => `data:image/${url.split(".").pop()};base64,`+buf.toString('base64'));
				return base64;
			});

			chapterImages = await Promise.all(imagePromises); // Page array is an array filled with URLs. Perfect!
		}

		return {
			constant: {
				title: data.manga.title,
				slug,
				posterUrl: data.manga.cover_url,
				alternateTitles: data.manga.alt_names,
				// @ts-ignore
				genres: data.manga.genres.map(g => g.label),
				descriptionParagraphs: data.manga.description.split("\r\n").filter(Boolean).filter(c => !c.startsWith("["))
			},
			data: {
				chapters: newChapters,
				chapterImages
			},
			success: true,
			provider: "Mangadex"
		}
	}
	public async search(query: string, options?: Partial<SearchOptions>) {
		return [];
	}
}

// Create instance and extend it
const Mangadex = new MangadexClass();
export default Mangadex;