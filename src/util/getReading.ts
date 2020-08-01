
import db from "../db";
import { setMangaProgress } from "../util/getMangaProgress";
import updateManga from "../util/updateManga";


export default async function getReading() {

	// Get manga that is being read
	let readingManga = db.get("reading").value();
	let readingKeys = Object.keys(readingManga).sort((b, a) => readingManga[a].last.at - readingManga[b].last.at);

	let reading = await Promise.all(readingKeys.map(async slug => {
		let manga = await updateManga(slug);
		manga = await setMangaProgress(manga);
		return manga;
	}));

	return reading;
}