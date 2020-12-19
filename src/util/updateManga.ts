import * as scrapers from "../scrapers";
import db from "../db";
import { ScraperError, ScraperResponse } from "../types";
import getMangaProgress from "./getMangaProgress";
import config from "../config.json";
import { Provider, Scraper } from "../scrapers/types";
import { getProviderId, getProviderName } from "../routers/manga-page";
import cache from "../util/cache";

const nsfwError: ScraperError = {
	success: false,
	status: 0,
	err: "This is NSFW content"
};

export default async function updateManga(provider: Provider | string, slug: string, ignoreExisting = false, chapterId: number | string = -1): Promise<ScraperResponse> {
	const existing = cache?.[getProviderId(provider)]?.[slug];
	if (existing && existing.savedAt > Date.now() - config.cache.duration && !ignoreExisting && chapterId === -1) {
		const d = await addInfo(existing);
		if (d.success && d.constant.nsfw && db.get("settings.show-nsfw") === "no") return nsfwError;
		return d;
	}

	const scraperName = getProviderName(provider) || provider;
	const scraper: Scraper | undefined = scrapers[scraperName];

	if (!scraper) {
		console.error("No scraper: " + provider);
		return {
			err: "No such scraper exists",
			status: 0,
			success: false
		};
	}

	const data = await scraper.scrape(slug, chapterId);
	if (data.success) {
		const nData = JSON.parse(JSON.stringify(data)); // Clone data

		nData.savedAt = Date.now();

		// Remove unnecesary data from DB
		nData.data.chapters.forEach((d) => {
			delete d.progress;
			delete d.realProgress;
		});

		delete nData.data.chapterImages; // Get rid of images
		delete nData.realProgress;
		delete nData.progress;

		const p = getProviderId(provider);
		if (!cache[p]) cache[p] = [];
		cache[getProviderId(p)][slug] = nData;
		// db.set(dbQuery, nData);
	}
	const d = await addInfo(data);
	if (d.success && d.constant.nsfw && db.get("settings.show-nsfw") === "no") return nsfwError;
	return d;
}

async function addInfo(data: ScraperResponse) {
	if (data.success) {
		// This still works thanks to references, somehow
		// Add progress to each chapter
		const chapterPromises = data.data.chapters.map(async (ch) => {
			ch.progress = await getMangaProgress(data.provider, data.constant.slug, ch.hrefString);
			return ch;
		});
		await Promise.all(chapterPromises);

		// Add a boolean to indicate if there is more than one chapter or not
		const seasonSet = new Set(data.data.chapters.map((c) => c.season.toString()));
		const chapters = Array.from(seasonSet);
		data.data.hasSeasons = chapters.length > 1;
	}

	return data;
}
