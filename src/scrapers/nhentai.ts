import chalk from "chalk";
import fetch from "node-fetch-extra";
import { JSDOM } from "jsdom";
import { error } from "./index";
import { ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class nhentaiClass extends Scraper {
	constructor() {
		super();
		this.provider = "nhentai";
		this.canSearch = false;
		this.nsfw = true;
	}

	public async search(query: string, options?: Partial<SearchOptions>) {
		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		const { resultCount } = {
			resultCount: 40,
			...options,
		};

		let pageUrl: string;

		if (query === "") {
			// Get popular page
			pageUrl = "https://nhentai.to/";
		} else {
			pageUrl = `https://nhentai.to/search?q=${encodeURIComponent(query)}`;
		}

		// Fetch DOM for relevant page
		const pageReq = await fetch(pageUrl);
		const pageHtml = await pageReq.text();

		// Get DOM for popular page
		const dom = new JSDOM(pageHtml);
		const document = dom.window.document;

		// Get nodes
		const anchors = [
			...document.querySelectorAll(".index-container .gallery a"),
		];

		// Get IDs from nodes
		const ids = anchors.map((anchor) => anchor.href.match(/(\d+)/)[1]);

		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("nhentai", id))
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
				chalk.red("[NHENTAI]") +
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
			const pageReq = await fetch(`https://nhentai.to/g/${slug}`);
			const pageHtml = await pageReq.text();

			// Get variables
			const dom = new JSDOM(pageHtml);
			const document = dom.window.document;

			// Get title
			const title = document.querySelector("#bigcontainer h1").textContent;

			// Get poster URL
			const posterUrl = document
				.querySelector("img[data-src]")
				.getAttribute("data-src");

			// Get genres from tags
			const genres = [...document.querySelectorAll(".tag")]
				.map((v) => v.textContent)
				.map((str) => str.slice(0, 1).toUpperCase() + str.slice(1));

			// Get alternate titles
			const alternateTitles = [...document.querySelectorAll("h2")].map(
				(node) => node.textContent
			);

			// Get all images in series
			const chapterImages = [
				...document.querySelectorAll("#thumbnail-container img"),
			]
				.map((v) => v.getAttribute("data-src"))
				.filter(Boolean)
				.map((url) => url.replace(/t\./g, "."));

			// Get series' upload date
			const date = new Date(
				document.querySelector("time").getAttribute("datetime")
			);

			// Return it.
			const providerId = getProviderId(this.provider);
			return {
				constant: {
					title,
					slug,
					posterUrl,
					alternateTitles,
					descriptionParagraphs: ["nhentai does not provide descriptions."],
					genres,
					nsfw: true,
				},
				data: {
					chapters: [
						{
							season: 1,
							chapter: 1,
							label: "Chapter 1",
							date,
							hrefString: "read",
						},
					],
					chapterImages,
					status: "ended",
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

// Generate nhentai object and export it
const nhentai = new nhentaiClass();
export default nhentai;
