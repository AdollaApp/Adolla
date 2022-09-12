import chalk from "chalk";
import fetch from "node-fetch-extra";
import { JSDOM } from "jsdom";
import { error } from "./index";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class manganeloClass extends Scraper {
	constructor() {
		super();
		this.provider = "Manganelo";
		this.searchDisplay = "Manganato";
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

		if (query === "") {
			// Get popular page
			resultCount = 5;
			pageUrl = "https://manganato.com/genre-all?type=topview";
		} else {
			pageUrl = `https://manganato.com/search/story/${encodeURIComponent(
				query
					.replace(/[^a-zA-Z]/g, " ")
					.trim()
					.replace(/ /g, "_")
			)}`;
		}
		console.log(pageUrl);

		// Fetch DOM for relevant page
		const pageReq = await fetch(pageUrl);
		const pageHtml = await pageReq.text();

		// Get DOM for popular page
		const dom = new JSDOM(pageHtml);
		const document = dom.window.document;

		// Get nodes
		const anchors = [
			...document.querySelectorAll(".genres-item-info .a-h:first-child"),
			...document.querySelectorAll(".item-title"),
		];

		// Get IDs from nodes
		const ids = anchors
			.map((anchor) => anchor.href.split("/").pop())
			.slice(0, resultCount);

		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("manganelo", id))
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
				chalk.red("[MANGANELO]") +
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
			slug = slug.startsWith("manga-") ? slug : `manga-${slug}`;
			const pageReq = await fetch(`https://readmanganato.com/${slug}`);
			const pageHtml = await pageReq.text();

			// Get variables
			const dom = new JSDOM(pageHtml);
			const document = dom.window.document;

			// Get title
			const title = document.querySelector("h1").textContent;

			// Get poster URL
			let posterUrl =
				(document.querySelector(".info-image img") ?? {}).src || "";
			if (posterUrl.startsWith("/"))
				posterUrl = "https://manganato.com/" + posterUrl;

			if (!posterUrl) posterUrl = "https://jipfr.nl/jip.jpg";

			// Get genres from tags
			const genreWrapper = [
				...document.querySelectorAll(".variations-tableInfo tr"),
			].find((tr) => tr.textContent.includes("Genres"));
			const genreLinks = [...genreWrapper.querySelectorAll(".a-h")];
			const genres = genreLinks.map((v) => v.textContent);

			// Get alternate titles
			const altTitleWrapper = document.querySelector(".info-alternative")
				.parentNode.parentNode;
			const alternateTitles = altTitleWrapper
				.querySelector("h2")
				.textContent.split(";")
				.map((v) => v.trim());

			// Get status
			const statusWrapper = document.querySelector(".info-status").parentNode
				.parentNode;
			const status = statusWrapper
				.querySelectorAll("td")[1]
				.textContent.toLowerCase();

			// Get chapters
			const chapters: Chapter[] = [
				...document.querySelectorAll(".row-content-chapter li"),
			]
				.reverse() // Their default sorting is large > small — we want the opposite of that
				.map(
					(row): Chapter => {
						// Find all values
						const label = row.querySelector("a").textContent.split(":")[0];
						const slug = row
							.querySelector("a")
							.href.split("/")
							.pop()
							.replace(/-/g, "_");
						const chapter = Number(slug.split("_").pop());
						let date = new Date(row.querySelector(".chapter-time").textContent);

						// Make sure date is valid, otherwise set it to now
						// Thanks for nothing Manganelo
						if (!date.getTime()) date = new Date();

						// Return product of chapter
						return {
							label,
							// Since the creation of the Manganelo scraper, MN has replaced hyphens with underscores. We're replacing that here to keep the reading data intact
							hrefString: slug,
							season: 1,
							chapter,
							date,
							combined: chapter,
						};
					}
				);

			// Find images
			let chapterImages = [];
			if (chapterId != "-1") {
				// Scrape page to find images
				const url = `https://readmanganato.com/${slug}/${chapterId.replace(
					/_/g,
					"-" // See generation of chapter hrefString above
				)}`;
				const chapterPageReq = await fetch(url);
				const chapterPageHtml = await chapterPageReq.text();

				// JSDOM it
				const dom = new JSDOM(chapterPageHtml);
				const chapterDocument = dom.window.document;

				const images = [
					...chapterDocument.querySelectorAll(".container-chapter-reader img"),
				];
				chapterImages = images.map((v) => v.getAttribute("src"));
			}

			// Find description
			const descriptionParagraphs = document
				.querySelector("#panel-story-info-description")
				.textContent.split(" :")
				.slice(1)
				.join(" :")
				.split(/\n|<br>/g);

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
					nsfw: false,
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
			console.error(
				chalk.red("[MANGANELO]") +
					` A request for '${slug}' at '${chapterId}' has errored`
			);
			return error(-1, err);
		}
	}
}

// Generate manganelo object and export it
const manganelo = new manganeloClass();
export default manganelo;
