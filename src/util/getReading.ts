
import db from "../db";
import { setMangaProgress } from "../util/getMangaProgress";
import updateManga from "../util/updateManga";
import { ScraperResponse } from "../types";
interface ReadingMeta {
	/** Really `Provider`, but the DB doesn't have types */
	provider: string;
	/** A Manga's slug */
	slug: string;
}

export default async function getReading(maxResults: number = Infinity) {

	// Get manga that is being read
	let readingManga = db.get("reading_new");

	let allProviders = Object.keys(readingManga);
	let readingMeta: ReadingMeta[] = [];
	for(let provider of allProviders) {
		for(let slug of Object.keys(readingManga[provider])) {
			readingMeta.push({
				provider,
				slug
			});
		}
	}


	// Sort data
	readingMeta = readingMeta.sort((a, b) => readingManga[a.provider][a.slug].at - readingManga[b.provider][b.slug].at);

	// Slice down to max results
	readingMeta = readingMeta.slice(0, maxResults);


	// TypeScript doesn't typeguard .filter :/
	let reading: ScraperResponse[] = await Promise.all(readingMeta.map(async obj => {
		let manga = await updateManga(obj.provider ?? "Mangasee", obj.slug);
		manga = await setMangaProgress(manga);
		return manga;
	}));
	
	reading = reading.filter(e => e.success === true).sort((a, b) => (b.success ? b.progress.at : 0) - (a.success ? a.progress.at : 0))

	return reading;
}