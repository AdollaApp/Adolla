
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
	}
	return manga;
}