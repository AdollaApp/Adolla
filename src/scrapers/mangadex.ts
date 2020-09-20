
import { ScraperError, Chapter, ScraperResponse } from "../types";
import updateManga from "../util/updateManga";
import { Scraper, SearchOptions } from "./types";
import md from "mangadex-api";
import fs from "fs";

class MangadexClass extends Scraper {
	public async scrape(slug: string, chapter: number = -1, season: number = -1): Promise<ScraperResponse> {
		
		let id = Number(slug);
		
		// Get main data
		let data = await md.getManga(id);

		// Chapters
		let chapters = data.chapter
		  .filter(c => c.lang_code.includes("en") || c.lang_code.includes("gb"))

		fs.writeFileSync("chapters.json", JSON.stringify(chapters, null, "\t"));
		
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
				hrefString: c.id
			};
		});


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
				chapters: newChapters
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