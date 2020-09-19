
import db from "../db";
import { setMangaProgress } from "../util/getMangaProgress";
import updateManga from "../util/updateManga";
import { ScraperResponse, StoredData } from "../types";


export default async function getReading(maxResults: number = Infinity) {

	// Get manga that is being read
	let readingManga = db.get("reading");

	let readingKeys = Object.keys(readingManga).filter(key => readingManga[key]?.last).sort((b, a) => readingManga[a].last.at - readingManga[b].last.at);

	readingKeys = readingKeys.slice(0, maxResults);


	// TypeScript doesn't typeguard .filter :/
	let reading: ScraperResponse[] = await Promise.all(readingKeys.map(async slug => {
		let manga = await updateManga(readingManga[slug].provider ?? "Mangasee", slug);
		manga = await setMangaProgress(manga);
		return manga;
	}));

	reading = reading.filter(e => e.success === true).sort((a, b) => (b.success ? b.progress.at : 0) - (a.success ? a.progress.at : 0))

	return reading;
}