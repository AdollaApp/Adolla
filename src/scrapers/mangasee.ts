import fetch from "node-fetch-extra";
import chalk from "chalk";
import Fuse from "fuse.js";

import updateManga from "../util/updateManga";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import { error } from "./index";
import { disallowedGenres } from "../config.json";

// Search interfaces
/** This is for `DirectoryItem`, the values there aren't very useful */
export enum Directory {
	Genres = "g",
	Slug = "i",
	Title = "s",
	OngoingPublish = "ps", // Maybe?
	OngoingPrint = "ss", // Maybe?
	AlternateTitles = "al",
}
/** This is what the API holds in the Directory array. Fun. */
export interface DirectoryItem {
	s: string;
	i: string;
	o: string;
	ss: string;
	ps: string;
	t: string;
	v: string;
	vm: string;
	y: string;
	a: string[];
	al: string[];
	l: string;
	lt: number;
	g: string[];
	h: boolean;
}

const headers = {
	"user-agent": "Adolla",
};

/** This is a chapter in mangasee API */
interface ChapterResponse {
	/** For example, 102280 */
	Chapter: string;
	/**
	 * Chapter type.
	 * Some mangas name their chapters, differently, like "quest" or "story".
	 * Can also be just "chapter"
	 */
	Type: string;
	/** Date string. Formatted like "yyyy-mm-dd hh:mm:ss" */
	Date: string;
	/** I don't even know */
	ChapterName: string | null;
}

export class MangaseeClass extends Scraper {
	constructor() {
		super();
		this.provider = "Mangasee";
		this.canSearch = true;
		this.nsfw = false;
	}

	public async search(
		query: string,
		options?: Partial<SearchOptions>,
		host: string = "manga4life"
	): Promise<ScraperResponse[]> {
		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		const { resultCount } = {
			resultCount: 40,
			...options,
		};

		try {
			let matchedResults = [];
			// If the query is empty, sort by popular
			if (query === "") {
				const searchUrl = `https://${host}.com/search/?sort=vm&desc=true&name=${encodeURIComponent(
					query
				)}`;
				const searchRes = await fetch(searchUrl, { headers });
				const html = await searchRes.text();

				try {
					// Parse directory
					const directory = JSON.parse(
						html.split("vm.Directory = ")[1].split("];")[0] + "]"
					);
					matchedResults = directory
						.sort(
							(a: DirectoryItem, b: DirectoryItem) =>
								normalizeNumber(b.v) - normalizeNumber(a.v)
						)
						.slice(0, resultCount);
				} catch (err) {
					// Error handling.... of sorts
					// We don't need to do anything since matchedResults is already empty
					// console.error("Error in search, MS is probably down....... Again.");
					throw new Error("Initial search went wrong");
				}
			} else {
				// Fetch search results
				const directory = await (
					await fetch(`https://${host}.com/_search.php`, { headers })
				).json();

				// If query is not empty, use fuse to search
				const fuse = new Fuse(directory, {
					threshold: 0.3,
					distance: 200,
					keys: [Directory.Title, Directory.Genres, Directory.AlternateTitles],
				});
				matchedResults = fuse
					.search(query)
					.map((result) => result.item)
					.slice(0, resultCount);
			}

			// Get details for each search result
			const searchResultData: ScraperResponse[] = await Promise.all(
				matchedResults.map((item: DirectoryItem) =>
					updateManga("Mangasee", item[Directory.Slug])
				)
			);

			// Return all successfull data requests
			return searchResultData.filter((v) => v.success);
		} catch (err) {
			if (host === "manga4life") {
				return this.search(query, options, "mangasee123");
			} else {
				return [];
			}
		}
	}

	/**
	 * The scrape function. This returns data for an anime
	 * @param slug The manga's slug.
	 * @param chapter
	 * @param season
	 */
	public async scrape(
		slug: string,
		chapterId: string | number | null = null
	): Promise<ScraperResponse> {
		// Set a timeout for how long the request is allowed to take
		const maxTimeout: Promise<ScraperError> = new Promise((resolve) => {
			setTimeout(() => {
				resolve(error(0, "This request took too long"));
			}, 15e3);
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
				chalk.red("[MANGASEE]") +
					` A request for '${slug}' at '${chapterId}' took too long and has timed out`
			);
		}

		// Return result
		return raceResult;
	}
	private async doScrape(
		slug: string,
		chapterId: string | number | null = null,
		host: string = "manga4life"
	): Promise<ScraperResponse> {
		let season: number;
		let chapter: number;
		if (chapterId && typeof chapterId === "string") {
			const chapterMatch = chapterId.match(/(\d*\.?\d+)-(\d*\.?\d+)/);
			if (!chapterMatch) {
				return error(403, "Invalid season chapter string");
			}

			const nums: number[] = chapterMatch.map((v) => Number(v));
			season = nums[1];
			chapter = nums[2]; // Bit of a hack...
		}

		const doErr = (status: number, reason: string) => {
			if (host === "manga4life") {
				return this.doScrape(slug, chapterId, "mangasee123");
			} else {
				console.error(`${status} Throwing error for ${slug}`);
				return error(status, reason);
			}
		};

		try {
			// Generate URL and fetch page
			const url = `https://${host}.com/manga/${slug}`;
			const pageRes = await fetch(url, { headers });
			const html = await pageRes.text();

			// if (Math.floor(Math.random() * 2) === 0) throw new Error("lol");

			// Check if response is valid.
			// Throw error if not
			if (
				!pageRes.ok ||
				pageRes.url.endsWith("undefined") ||
				html.includes("<title>404 Page Not Found</title>")
			) {
				return doErr(pageRes.status, html);
			}

			// Shittily extract values from page.
			// I could be using JSDoc or Cheerio but I'm not.
			const title = html.split("<h1>")[1].split("</h1>")[0]; // You can tell what this does
			const posterUrl = html
				.split('<meta property="og:image" content="')[1]
				.split('"')[0]; // Get poster url from og:image
			let alternateTitles = [];
			if (html.includes("Alternate Name(s):"))
				alternateTitles = html
					.split('<span class="mlabel">Alternate Name(s):</span>')[1] // Find starting point of alternate names
					.split("<")[0] // Find closing HMTL tag
					.trim() // Remove trailing stuff
					.split(", ") // Seperate names on comma
					.filter(Boolean); // Remove empty strings

			// Get description paragraphs
			const descriptionParagraphs = html
				.split('<span class="mlabel">Description:</span>')[1] // Find start of div of descriptions (it's a bit weird)
				.split(">")[1] // Find closing of opening paragraph
				.split("</")[0] // Find closing paragraph
				.trim() // Remove start & end trim
				.split("\n") // Get seperate paragraphs
				.filter(Boolean); // filter out empty strings

			// Extract chapter data from script tag in DOM
			// Then `map` it into a Chapter type
			const chapterData = JSON.parse(
				html.split("vm.Chapters = ")[1].split(";")[0]
			);
			const chapters: Chapter[] = chapterData
				.map((ch: ChapterResponse) => {
					const season = Number(ch.Chapter[0]);
					const chapter = normalizeNumber(ch.Chapter.slice(1)) / 10;
					const label = `${ch.Type} ${chapter}`;
					const date = new Date(ch.Date);

					return {
						season,
						chapter,
						label,
						date,
						hrefString: `${season}-${chapter}`,
						combined: season * 1e5 + chapter,
					};
				})
				.sort((a: Chapter, b: Chapter) => a.combined - b.combined);

			// Extract genre array from dom
			const genres = JSON.parse(
				html.split('"genre": ')[1].split("],")[0] + "]"
			);

			// Get status
			const status = html
				.split('<span class="mlabel">Status:</span>')[1]
				.split(">")[1]
				.split(" (")[0]
				.trim()
				.toLowerCase();

			// Generate chapter images
			let chapterImages: string[] = [];
			if (season >= 0 && chapter >= 0) {
				// Generate URL for page with chapter data
				const chapterUrl = `https://${host}.com/read-online/${slug}-chapter-${chapter}-index-${season}.html`;

				// Fetch chapter data
				const chapterRes = await fetch(chapterUrl, { headers });
				const chapterBody = await chapterRes.text();

				// CDN url, like `s6.mangabeast.com`
				const cdnUrl = chapterBody.split('vm.CurPathName = "')[1].split('"')[0];

				// Get curChapter (which has info on pages and such)
				const curChapter = JSON.parse(
					chapterBody.split("vm.CurChapter = ")[1].split("};")[0] + "}"
				);

				// Generate URLs
				chapterImages = [];
				for (let page = 0; page < Number(curChapter.Page); page++) {
					// Thanks Pandawan, for helping out with floating point funny business!

					// Get 0-paddedchapter string with decimal
					const [chapterNormal, ...chapterModded] = chapter
						.toString()
						.split(/(\.)/); // Using a capture group holds the divider in the array. ChapterModded becomes ['.', someDecimalNumber]
					const chapterString = `${chapterNormal.padStart(
						4,
						"0"
					)}${chapterModded.join("")}`;

					// Get directory and page
					const directoryString = curChapter.Directory
						? `/${curChapter.Directory}`
						: "";
					const pageString = (page + 1).toString().padStart(3, "0");

					// Add page url to array
					chapterImages.push(
						`https://${cdnUrl}/manga/${slug}${directoryString}/${chapterString}-${pageString}.png`
					);
				}
			}

			// See if it's hentai or if it's safe
			let nsfw = false; // I don't think Mangasee has hentai
			for (const genre of genres) {
				if (disallowedGenres.includes(genre.toLowerCase())) nsfw = true;
			}

			// Now we return it
			const providerId = getProviderId(this.provider);

			// console.info(chalk.blue(" [MS]") + ` Resolving ${title} at ${new Date().toLocaleString("it")}`);

			return {
				constant: {
					title,
					slug,
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
			// OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!
			// console.error(err.stack);
			return doErr(-1, err);
		}
	}
}

// Generate mangasee object and export it
const Mangasee = new MangaseeClass();
export default Mangasee;

/**
 * Normalize a number string.
 * Many strings are 0-padded, if you do `Number("00005")` weird stuff happens.
 *
 * Returns a normal number
 * @param input a zero-padded number string, like `0003`
 *
 */
function normalizeNumber(input: string): number {
	const normalized = Number(
		input.slice(input.split("").findIndex((v) => v !== "0"))
	);

	return normalized;
}
