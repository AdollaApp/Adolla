
import scrapers from "../scrapers";
import db from "../db";
import { ScraperResponse } from "../types";
import getMangaProgress from "./getMangaProgress";
import config from "../config.json";
import { Scraper } from "../scrapers/types";

export default async function updateManga(provider: string, slug: string, ignoreExisting: boolean = false): Promise<ScraperResponse> {

	let dbQuery = `manga_cache.${provider}.${slug}`;

	let existing = db.get(dbQuery);
	if(existing && existing.savedAt > Date.now() - config.cache.duration && !ignoreExisting) return await addInfo(existing);

	let scraper: Scraper = scrapers[provider];
	if(!scraper) {
		console.error("No scraper: " + provider);
		return {
			err: "No such scraper exists",
			status: 0,
			success: false
		};
	}

	let data = await scraper.scrape(slug);
	if(data.success) {
		data.savedAt = Date.now();
		
		// Remove unnecesary data from DB
		data.data.chapters.forEach(d => {
			delete d.progress;
			delete d.realProgress;
		});
		
		db.set(dbQuery, data);
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