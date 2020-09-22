
import db from "../db";
import { getScraperId } from "../routers/manga-page";
import { ProviderId } from "../scrapers/types";
import { Progress, ScraperResponse } from "../types";
import getProgressData from "./getProgressData";

export default async function getMangaProgress(provider: ProviderId, slug: string, where: string = "last"): Promise<Progress> {
	let dbString = `reading_new.${getScraperId(provider) || provider}.${slug}.${where.replace(/\./g, "_")}`;
	let entry = db.get(dbString);
	let data = entry ?? null;
	if(data) {
		data = getProgressData(data);
	}
	return data;
}

export async function setMangaProgress(manga: ScraperResponse): Promise<ScraperResponse> {
	if(manga.success) {
		manga.progress = await getMangaProgress(manga.provider, manga.constant.slug);
		manga.realProgress = Object.assign({}, manga.progress);

		// Check if next chapter should be used instead
		if(manga.progress && manga.progress.percentage > 90) { // The 90% might be subject to change
			let { chapterId } = manga.progress;
			let currentChapter = manga.data.chapters.find(ch => ch.hrefString === chapterId);
			let nextChapter = manga.data.chapters[manga.data.chapters.indexOf(currentChapter) + 1] ?? null;
			
			if(nextChapter) {

				let progressLast = manga.progress.at;
				let chapterDateObj = new Date(nextChapter.date);
				chapterDateObj.setHours(23);
				chapterDateObj.setMinutes(59);
				let chapterDate = chapterDateObj.getTime();

				manga.progress = {
					...manga.progress,
					percentage: 0,
					chapterId: nextChapter.hrefString,
					current: 0,
					total: null, // Unknown
					at: progressLast > chapterDate ? progressLast : Date.now(), // If the chapter is newer than last read, sort by that. If not, don't.
					new: chapterDate > progressLast
				}	
			}

		}

	}
	return manga;
}