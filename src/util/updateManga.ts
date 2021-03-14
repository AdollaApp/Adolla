import * as scrapers from "../scrapers";
import db from "../db";
import { ScraperError, ScraperResponse } from "../types";
import getMangaProgress from "./getMangaProgress";
import config from "../config.json";
import { Provider, Scraper } from "../scrapers/types";
import { getProviderId, getProviderName } from "../routers/manga-page";
import cache from "../util/cache";
import fetch from "node-fetch-extra";
import chalk from "chalk";

const bannerCache = {};

const nsfwError: ScraperError = {
	success: false,
	status: 0,
	err: "This is NSFW content",
};

export default async function updateManga(
	provider: Provider | string,
	slug: string,
	ignoreExisting = false,
	chapterId: number | string = -1
): Promise<ScraperResponse> {
	const existing = cache?.[getProviderId(provider)]?.[slug];

	// Verify cache exists and isn't too old
	if (
		existing &&
		existing.savedAt > Date.now() - config.cache.duration &&
		!ignoreExisting &&
		chapterId === -1
	) {
		const d = await addInfo(existing);
		if (d.success && d.constant.nsfw && db.get("settings.show-nsfw") === "no")
			return nsfwError;
		return d;
	}

	// ! Cache is too old. Get new data

	// Get scrapers
	const scraperName = getProviderName(provider) || provider;
	const scraper: Scraper | undefined = scrapers[scraperName];

	if (!scraper) {
		console.error("No scraper: " + provider);
		return {
			err: "No such scraper exists",
			status: 0,
			success: false,
		};
	}

	// Scrape data
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
	// Add other info
	const d = await addInfo(data);

	if (!d?.success) {
		if (typeof d?.success === "undefined") {
			return {
				success: false,
				status: -1,
				err: "Unkown error",
			};
		}
		return d;
	}

	// Throw NSFW error if this content is nsfw and the user doesn't want NSFW content
	if (d.constant.nsfw && db.get("settings.show-nsfw") === "no")
		return nsfwError;

	// Return normal data
	return d;
}

async function addInfo(data: ScraperResponse) {
	if (data.success) {
		// This still works thanks to references
		// Add progress to each chapter
		const chapterPromises = data.data.chapters.map(async (ch) => {
			ch.progress = await getMangaProgress(
				data.provider,
				data.constant.slug,
				ch.hrefString
			);
			return ch;
		});
		await Promise.all(chapterPromises);

		// Add a boolean to indicate if there is more than one chapter or not
		const seasonSet = new Set(
			data.data.chapters.map((c) => c.season.toString())
		);
		const chapters = Array.from(seasonSet);
		data.data.hasSeasons = chapters.length > 1;

		// Find banner for manga
		try {
			if (data.provider === "mangadex" || data.provider === "mangasee") {
				// Check for pre-existing (cached) banner URL
				const existingBanner = bannerCache[data.constant.title];
				if (existingBanner) {
					data.constant.banner = existingBanner;
					return data;
				}

				// Find banner for manga
				const query = `
				query media($search:String, $type:MediaType) { 
					Media(search:$search, type:$type){
						id
						bannerImage
					}
				}
				`;
				const aniListData = await fetch("https://graphql.anilist.co", {
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({
						query,
						variables: {
							search: data.constant.title,
							type: "MANGA",
						},
					}),
					method: "POST",
				}).then((d) => d.json());

				const banner = aniListData?.data?.Media?.bannerImage ?? null;
				data.constant.banner = banner;
				if (banner) bannerCache[data.constant.title] = banner;
			}
			return data;
		} catch (err) {
			console.error(
				chalk.red("[ANILIST]") +
					` Unable to fetch banner for ${data.constant.title}:`,
				err
			);
			return data;
			// /shrug
		}
	}
}
