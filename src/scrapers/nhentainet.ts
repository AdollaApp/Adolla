import chalk from "chalk";
import { error, getDataFromURL } from "./index";
import { ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class nhentaiClass extends Scraper {
	constructor() {
		super();
		this.provider = "nhentainet";
		this.searchDisplay = "nhentai.net";
		this.canSearch = true;
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
			pageUrl = "https://nhentai.net/api/galleries/search?query=%20";
		} else {
			pageUrl = `https://nhentai.net/api/galleries/search?query=${encodeURIComponent(
				query
			)}`;
		}

		// Fetch search JSON
		const searchData = await getDataFromURL(pageUrl);

		if (searchData?.result) {
			// Find IDs
			const ids = searchData.result
				.map((result) => result.id)
				.slice(0, resultCount);

			// Get details for each search result
			const searchResultData: ScraperResponse[] = await Promise.all(
				ids.map((id) => updateManga("nhentainet", id))
			);

			return searchResultData;
		} else {
			return [];
		}
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

	getImageType(type: string) {
		const types = {
			j: "jpg",
			p: "png",
		};
		return types[type] ?? "jpg";
	}

	private async doScrape(
		slug: string,
		chapterId: string
	): Promise<ScraperResponse> {
		try {
			// Get data
			const data = await getDataFromURL(
				`https://nhentai.net/api/gallery/${slug}`,
				0
			);

			// Find language, default to unknown
			const language =
				data.tags.find((tag) => tag.type === "language")?.name || "unknown";

			// Get title
			const textTitle =
				data.title.pretty ?? data.title.english ?? Object.values(data.title)[0];
			const title = `${
				language.slice(0, 1).toUpperCase() + language.slice(1, 2)
			}: ${textTitle}`;

			const alternateTitles: string[] = Object.values(data.title);

			// Get poster url
			const posterUrlMain = `https://t.nhentai.net/galleries/${
				data.media_id
			}/cover.${this.getImageType(data.images.cover.t)}`;
			const posterUrl = `/proxy-image?url=${encodeURIComponent(posterUrlMain)}`;

			console.log(3);

			// Get genres
			const genres = data.tags.map(
				(tag) => tag.name.slice(0, 1).toUpperCase() + tag.name.slice(1)
			);

			// Get upload date
			const date = new Date(data.upload_date * 1e3);

			// Get image URLs for series
			const chapterImages = data.images.pages.map((pageInfo, i) => {
				return `https://i.nhentai.net/galleries/${data.media_id}/${
					i + 1
				}.${this.getImageType(pageInfo.t)}`;
			});

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
