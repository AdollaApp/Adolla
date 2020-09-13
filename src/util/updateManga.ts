
import Mangasee from "../scrapers/mangasee";
import db from "../db";
import { ScraperResponse } from "../types";
import getMangaProgress from "./getMangaProgress";
import config from "../config.json";

export default async function updateManga(slug: string, ignoreExisting: boolean = false) {

	let existing = db.get(`manga_cache.${slug}`);
	if(existing && existing.savedAt > Date.now() - config.cache.duration && !ignoreExisting) return await addInfo(existing);

	let data = await Mangasee.scrape(slug);
	if(data.success) {
		data.savedAt = Date.now();
		
		// Remove unnecesary data from DB
		data.data.chapters.forEach(d => {
			delete d.progress;
			delete d.realProgress;
		});
		
		db.set(`manga_cache.${slug}`, data);
	} 
	return await addInfo(data);
}

async function addInfo(data: ScraperResponse) {

	if(data.success) {
		// This still works thanks to references, somehow
		let chapterPromises = data.data.chapters.map(async ch => {
			ch.progress = await getMangaProgress(data.constant.slug, `${ch.season}-${ch.chapter}`);
			return ch;
		});
		await Promise.all(chapterPromises);
	}

	return data
}