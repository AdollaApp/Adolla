
import * as scrapers from "../scrapers";
import db from "../db";
import { ScraperError, ScraperResponse } from "../types";
import getMangaProgress from "./getMangaProgress";
import config from "../config.json";
import { Provider, Scraper } from "../scrapers/types";
import { getProviderId, getProviderName } from "../routers/manga-page";

const nsfwError: ScraperError = {
	success: false,
	status: 0,
	err: "This is NSFW content"
};

export default async function updateManga(provider: Provider | string, slug: string, ignoreExisting: boolean = false, chapterId: number | string = -1): Promise<ScraperResponse> {

	let dbQuery = `data_cache.${getProviderId(provider)}.${slug}`;

	let existing = db.get(dbQuery);
	if(existing && existing.savedAt > Date.now() - config.cache.duration && !ignoreExisting && chapterId === -1) {
		let d = await addInfo(existing);
		if(d.success && d.constant.nsfw && db.get("settings.show-nsfw") === "no") return nsfwError;
		return d;
	}

	let scraperName = getProviderName(provider) || provider;
	let scraper: Scraper | undefined = scrapers[scraperName];
	
	if(!scraper) {
		console.error("No scraper: " + provider);
		return {
			err: "No such scraper exists",
			status: 0,
			success: false
		};
	}

	let data = await scraper.scrape(slug, chapterId);
	if(data.success) {
		
		let nData = JSON.parse(JSON.stringify(data)); // Clone data

		nData.savedAt = Date.now();
		
		// Remove unnecesary data from DB
		nData.data.chapters.forEach(d => {
			delete d.progress;
			delete d.realProgress;
		});
		
		delete nData.data.chapterImages; // Get rid of images
		delete nData.realProgress;
		delete nData.progress;

		db.set(dbQuery, nData);
	} 
	let d = await addInfo(data);
	if(d.success && d.constant.nsfw && db.get("settings.show-nsfw") === "no") return nsfwError;
	return d;
}

async function addInfo(data: ScraperResponse) {

	if(data.success) {
		// This still works thanks to references, somehow
		let chapterPromises = data.data.chapters.map(async ch => {
			ch.progress = await getMangaProgress(data.provider, data.constant.slug, ch.hrefString);
			return ch;
		});
		await Promise.all(chapterPromises);
	}

	return data;
}