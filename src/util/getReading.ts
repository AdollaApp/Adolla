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

export default async function getReading(
	maxResults = Infinity
): Promise<ScraperResponse[]> {
	// Get manga that is being read
	const readingManga = db.get("reading_new");

	const allProviders = Object.keys(readingManga);
	let readingMeta: ReadingMeta[] = [];
	for (const provider of allProviders) {
		if (!readingManga[provider]) continue;
		for (const slug of Object.keys(readingManga[provider])) {
			// Check if it actually has any content
			// If it's "mark as unread" it'll be undefined
			// Not having an if statement for that would still add it
			// Obviously, we don't want that
			if (
				readingManga[provider][slug] &&
				Object.keys(readingManga[provider][slug]).length > 0
			) {
				if (db.get(`hide_read.${provider}.${slug}`) !== true) {
					readingMeta.push({
						provider,
						slug,
					});
				}
			}
		}
	}

	// Sort data
	readingMeta = readingMeta.sort(
		(b, a) =>
			readingManga[a.provider][a.slug].last?.at -
			readingManga[b.provider][b.slug].last?.at
	);

	// Slice down to max results
	readingMeta = readingMeta.slice(0, maxResults);

	let reading: ScraperResponse[] = await Promise.all(
		readingMeta.map(async (obj) => {
			let manga = await updateManga(obj.provider ?? "mangasee", obj.slug);
			manga = await setMangaProgress(manga);
			return manga;
		})
	);

	// TypeScript doesn't typeguard .filter :/
	reading = reading
		.filter((e) => e.success === true)
		.sort(
			(a, b) =>
				(b.success && b.progress ? b.progress?.at : 0) -
				(a.success && a.progress ? a.progress?.at : 0)
		);

	return reading;
}
