
import db from "../db";
import { StoredData, ScraperResponse } from "../types";

export default async function getMangaProgress(slug: string, where: string = "last") {
	let entry = db.get(`reading.${slug}.${where}`).value();
	if(entry) {
		entry.percentage = Math.round((entry.current / entry.total) * 100);
		return entry;
	}
	return null;
}

export async function setMangaProgress(manga: ScraperResponse) {
	if(manga.success) {
		manga.progress = await getMangaProgress(manga.constant.slug);
		manga.realProgress = Object.assign({}, manga.progress);

		// Check if next chapter should be used instead
		if(manga.progress && manga.progress.percentage > 90) { // The 90% might be subject to change
			let { season, chapter } = manga.progress;
			let currentChapter = manga.data.chapters.find(ch => ch.season === manga.progress.season && ch.chapter === manga.progress.chapter);
			let nextChapter = manga.data.chapters[manga.data.chapters.indexOf(currentChapter) + 1] ?? null;
			
			if(nextChapter) {

				let progressLast = manga.progress.at;
				let chapterDate = new Date(nextChapter.date).getTime();

				manga.progress = {
					...manga.progress,
					percentage: 0,
					season: nextChapter.season,
					chapter: nextChapter.chapter,
					current: 0,
					total: null, // Unknown
					at: progressLast > chapterDate ? progressLast : chapterDate // If the chapter is newer than last read, sort by that. If not, don't.
				}	
			}

		}

	}
	return manga;
}