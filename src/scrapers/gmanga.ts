import chalk from "chalk";
import fetch from "node-fetch-extra";
import { JSDOM } from "jsdom";
import { error } from "./index";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class gmangaClass extends Scraper {
	constructor() {
		super();
		this.provider = "gmanga";
		this.searchDisplay = "Gmanga";
		this.canSearch = true;
		this.nsfw = false;
	}

	public async search(query: string, options?: Partial<SearchOptions>) {
		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		let { resultCount } = {
			resultCount: 15,
			...options,
		};

		let pageUrl: string;

		const quickSearch = await fetch("https://api.gmanga.me/api/quick_search", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				query,
				includes: ["Manga"],
			}),
		}).then((d) => d.json());

		// Get IDs from nodes
		const ids = quickSearch
			.find((t) => t.class === "Manga")
			.data.map((result) => result.id.toString())
			.slice(0, resultCount);

		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("gmanga", id))
		);

		return searchResultData;
	}

	/**
	 * The scrape function
	 */
	public async scrape(slug: string, chapterId: string) {
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
				chalk.red("[GMANGA]") +
					` A request for '${slug}' at '${chapterId}' took too long and has timed out`
			);
		}

		// Return result
		return raceResult;
	}

	private async doScrape(
		slug: string,
		chapterId: string
	): Promise<ScraperResponse> {
		try {
			// Get HTML
			const jsonData = await fetch(
				`https://api2.gmanga.me/api/mangas/${slug}`
			).then((d) => d.json());
			const mangaData = jsonData.mangaData;

			// Get title
			const title = mangaData.title;

			// Get poster URL
			const posterUrl = `https://media.gmanga.me/uploads/manga/cover/${slug}/${mangaData.cover}`;

			// Get genres
			const genres = mangaData.categories.map((t) => t.name);

			// Alternate titles
			const alternateTitles = [mangaData.english];

			// Get status
			const status = ["unknown", "unknown", "Ongoing", "Finished"][
				mangaData.story_status
			];

			// Find description
			const descriptionParagraphs = mangaData.summary.trim().split("\n");

			// Get NSFW
			const nsfw = mangaData.over17;

			// Get chapters
			const chapterRes = await fetch(
				`https://api2.gmanga.me/api/mangas/${slug}/releases`
			).then((d) => d.json());

			const chapters: Chapter[] = chapterRes.chapterizations.map((c) => {
				const ch: Chapter = {
					season: c.volume,
					chapter: c.chapter,
					combined: c.volume * 1000 + c.chapter,
					label: `Chapter ${c.chapter}`,
					date: new Date(c.time_stamp * 1e3),
					hrefString: chapterRes.releases
						.find((t) => t.chapterization_id === c.id)
						.id.toString(),
				};
				return ch;
			});

			// Find images
			let chapterImages = [];
			if (chapterId != "-1") {
				// Scrape page to find images
				const url = `https://gmanga.org/mangas/${slug}/hello-world/123/${chapterId}`;
				const chapterPageReq = await fetch(url);
				const chapterPageHtml = await chapterPageReq.text();

				// JSDOM it
				const dom = new JSDOM(chapterPageHtml);
				const chapterDocument = dom.window.document;
				const chapterJson = JSON.parse(
					chapterDocument.querySelector(
						'[type="application/json"][data-component-name="HomeApp"]'
					).textContent
				);
				const release = chapterJson.readerDataAction.readerData.release;
				console.log(chapterJson, release);

				const imgs = release.pages.map(
					(page) =>
						`https://media.gmanga.me/uploads/releases/${release.storage_key}/mq/${page}`
				);
				chapterImages = imgs;
			}

			// Return it.
			const providerId = getProviderId(this.provider);
			return {
				constant: {
					title,
					slug: slug.replace(/manga-/g, ""),
					posterUrl,
					alternateTitles,
					descriptionParagraphs,
					genres,
					nsfw,
				},
				data: {
					chapters,
					chapterImages,
					status,
				},
				success: true,
				provider: isProviderId(providerId) ? providerId : null,
			};
		} catch (err) {
			console.log(err);
			console.error(
				chalk.red("[GMANGA]") +
					` A request for '${slug}' at '${chapterId}' has errored`
			);
			return error(-1, err);
		}
	}
}

// Generate gmanga object and export it
const gmanga = new gmangaClass();
export default gmanga;
