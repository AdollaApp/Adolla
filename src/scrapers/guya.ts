import chalk from "chalk";
import fetch from "node-fetch-extra";
import Fuse from "fuse.js";

import { error } from "./index";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

interface GuyaSeriesList {
	[seriesName: string]: {
		description: string;
		slug: string;
		cover: string;
		last_updated: number;
	}
}

interface GuyaSeries {
	title: string;
	slug: string;
	description: string;
	cover: string;
	preferred_sort: string[];
	chapters: {
		[chapterNumber: string]: {
			volume: string;
			title: string;
			folder: string;
			preferred_sort?: string[];
			groups: {
				[groupId: string]: string[];
			};
			release_date: {
				[groupId: string]: number;
			};
		}
	},
	next_release_page: boolean;
}

export class guyaClass extends Scraper {
	constructor() {
		super();
		this.provider = "Guya";
		this.canSearch = true;
		this.nsfw = false;
	}

	public async search(query: string) {
		let pageUrl = "https://guya.moe/api/get_all_series/";

		// Fetch DOM for relevant page
		const pageReq = await fetch(pageUrl);
		const pageJson: GuyaSeriesList = await pageReq.json();

		let ids = []

		if (query.length) {
			// If query is not empty, use fuse to search
			const fuse = new Fuse(Object.keys(pageJson), {
				threshold: 0.3,
				distance: 200,
			});
			ids = fuse
				.search(query)
				.map(({ item }) => pageJson[item].slug);
		} else {
			// Get IDs from nodes
			ids = Object.values(pageJson).map(({ slug }) => slug);
		}


		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("guya", id))
		);

		return searchResultData;
	}

	/**
	 * The scrape function
	 */
	public async scrape(slug: string, chapterId: string | number | null = null) {
		// Set a timeout for how long the request is allowed to take
		const maxTimeout: Promise<ScraperError> = new Promise((resolve) => {
			setTimeout(() => {
				resolve(error(0, "This request took too long"));
			}, 25e3);
		});

		// Attempt scraping series
		const scraping = this.doScrape(slug, chapterId);

		// Get first result of either scraping or timeout
		const raceResult = await Promise.race([maxTimeout, scraping]);

		// Check if it's the timeout instead of the scraped result
		if (
			raceResult.success === false &&
			raceResult.err === "This request took too long"
		) {
			console.error(
				chalk.red("[GUYA]") +
					` A request for '${slug}' at '${chapterId}' took too long and has timed out`
			);
		}

		// Return result
		return raceResult;
	}

	private async doScrape(
		slug: string,
		chapterId: string | number | null = null
	): Promise<ScraperResponse> {
		try {
			// Get HTML
			const pageReq = await fetch(`https://guya.moe/api/series/${slug}/`);
			const pageJson: GuyaSeries = await pageReq.json();

			// Get title
			const title = pageJson.title;
			// Get description
			const description = pageJson.description ?? '';
			// Status
			const isOngoing = pageJson.next_release_page;

			// Get poster URL
			const posterUrl = `https://guya.moe${pageJson.cover}`;

			// Get genres from tags
			const genres = [];

			// Get alternate titles
			const alternateTitles = [];

			const { chapters: chapterData, preferred_sort: seriesPreferredSort } = pageJson;

			let chapterImages = [];

			if (chapterId && typeof chapterId === "string") {
				const { groups, folder, preferred_sort: chapterPreferredSort } = chapterData[chapterId];

				const preferredSort = chapterPreferredSort ?? seriesPreferredSort;

				const bestGroup =
					Object.keys(groups).sort((a, b) => preferredSort.indexOf(a) - preferredSort.indexOf(b))[0] ?? Object.keys(groups)[0];
				const pages = groups[bestGroup];

				chapterImages = pages.map((page) => `https://guya.moe/media/manga/${slug}/chapters/${folder}/${bestGroup}/${page}`);
			}

			let chapters: Chapter[] = Object.entries(chapterData)
				.map(([ chapter, data ]) => {
					const { volume, release_date: releaseDates } = data;

					const releaseDate = Object.values(releaseDates).sort((a, b) => a - b)[0]

					const season = Number(volume);
					const chapterId = Number(chapter);

					return {
						chapter: chapterId,
						season,
						label: `Chapter ${chapter}`,
						date: new Date(releaseDate * 1000),
						hrefString: chapter,
						combined: season * 1e5 + chapterId,
					};
				})
				.sort((a: Chapter, b: Chapter) => a.combined - b.combined);

			// Return it.
			const providerId = getProviderId(this.provider);
			return {
				constant: {
					title,
					slug,
					posterUrl,
					alternateTitles,
					descriptionParagraphs: [description],
					genres,
					nsfw: false,
				},
				data: {
					chapters,
					chapterImages,
					status: isOngoing ? "ongoing" : "ended",
				},
				success: true,
				provider: isProviderId(providerId) ? providerId : null,
			};
		} catch (e) {
			return {
				success: false,
				status: 0,
				err: e,
			};
		}
	}
}

// Generate guya object and export it
const guya = new guyaClass();
export default guya;
