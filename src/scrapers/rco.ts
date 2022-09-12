import fetch from "node-fetch-extra";
import chalk from "chalk";
import { JSDOM } from "jsdom";
import updateManga from "../util/updateManga";
import { XmlEntities } from "html-entities";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import { error } from "./index";
import { beau } from "./rco-garbage";

const Entities = new XmlEntities();

class RCOClass extends Scraper {
	constructor() {
		super();
		this.provider = "RCO";
		this.canSearch = true;
		this.nsfw = false;
	}

	public async scrape(
		slug: string,
		chapterId: string | number | null = null
	): Promise<ScraperResponse> {
		// Set a timeout for how long the request is allowed to take
		const maxTimeout: Promise<ScraperError> = new Promise((resolve) => {
			setTimeout(() => {
				resolve(error(0, "This request took too long"));
			}, 10e3);
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
				chalk.red("[RCO]") +
					` A request for '${slug}' at '${chapterId}' took too long and has timed out`
			);
		}

		// Return result
		return raceResult;
	}

	private async doScrape(
		slug: string,
		chapterId: string | number = -1
	): Promise<ScraperResponse> {
		try {
			const mainReq = await fetch(`https://readcomiconline.li/Comic/${slug}`, {
				family: 6,
				headers: {
					"user-agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
				},
			});
			let html = await mainReq.text();
			html = html.replace(/\r\n| {2}|\t/g, "");

			// Get title
			const title = Entities.decode(
				html.split('<a Class="bigChar"')[1].split(">")[1].split("</")[0]
			);

			// Get poster URL
			let posterUrl = "/poster.png";
			try {
				// Get poster url
				posterUrl = html
					.split("Cover</div>")[1]
					.trim()
					.split('src="')[1]
					.split('"')[0]
					.replace(/https\/\//g, "https://");

				// If the poster path is relative, apply that
				if (!posterUrl.startsWith("http"))
					posterUrl = "https://readcomiconline.li" + posterUrl;
			} catch (err) {
				posterUrl = "/poster.png";
			}

			// Description
			let descriptionParagraphs = [];
			try {
				descriptionParagraphs = Entities.decode(
					html.split('<p style="text-align: justify;">')[1].split("</p>")[0]
				).split("<br />");
			} catch (err) {
				// Something, I'm sure
			}

			// Get chapters
			const chaptersHTML = html
				.split("<tr>")
				.slice(2)
				.map((s) => s.split("</tr>")[0]);

			// Map chapters
			const chapters: Chapter[] = chaptersHTML
				.map((str: string, i: number) => {
					// Get TD elements
					const tds = str.split("<td>").map((s) => s.split("</td>")[0]);
					const tdOne = tds[1];
					const tdTwo = tds[2];

					// Get label
					const label = tdOne
						.split('">')[1]
						.split("</")[0]
						.replace(title, "")
						.trim();

					// Get HREF
					const hrefString = tdOne
						.split('href="')[1]
						.split('"')[0]
						.split("?")[0]
						.split("/")
						.pop();

					return {
						label,
						season: 1,
						chapter: chaptersHTML.length - i,
						combined: chaptersHTML.length - i,
						date: new Date(tdTwo),
						hrefString,
					};
				})
				.sort((a, b) => a.combined - b.combined);

			// Get chapter's images
			let chapterImages = [];
			if (chapterId !== -1) {
				const imgReq = await fetch(
					`https://readcomiconline.li/Comic/${slug}/${chapterId}?quality=lq`,
					{
						family: 6,
						headers: {
							"user-agent":
								"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
						},
					}
				);
				const chapterHTML = await imgReq.text();

				if (chapterHTML.includes("Are You Human")) {
					chapterImages = ["captcha"];
				} else {
					const imgSources = chapterHTML
						.match(/lstImages\.push\("?'?(.+?)"?'?\);/g)
						.map((snippet) => {
							return snippet.match(/lstImages\.push\("?'?(.+?)"?'?\);/)[1];
						});

					// Beautify URLS if they were obfuscated
					chapterImages = beau(imgSources);
				}
			}

			// Series status
			const status = html
				.split("Status:</span>")[1]
				.split("<")[0]
				.trim()
				.replace(/&nbsp;/g, "")
				.toLowerCase();

			// Get provider
			const provider = getProviderId(this.provider);

			// console.info(chalk.blue("[RCO]") + ` Resolving ${title} at ${new Date().toLocaleString("it")}`);

			return {
				constant: {
					title,
					slug,
					posterUrl,
					alternateTitles: [],
					genres: [],
					descriptionParagraphs,
					nsfw: false,
				},
				data: {
					chapters,
					chapterImages,
					status,
				},
				success: true,
				provider: isProviderId(provider) ? provider : null,
			};
		} catch (err) {
			console.error(chalk.red("[RCO]") + " An error occured:", err);
			return error(0, err);
		}
	}
	public async search(query: string, options?: Partial<SearchOptions>) {
		// Verify we can search
		if (!this.canSearch) {
			return {
				error: "Unable to search. Check logs for more information.",
			};
		}

		let resultIds = [];
		if (query === "") {
			// Fetch popular page
			const mainReq = await fetch(
				"https://readcomiconline.li/ComicList/MostPopular",
				{
					family: 6,
					headers: {
						"user-agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
					},
				}
			);
			// Get HTML for page
			const body = await mainReq.text();

			const dom = new JSDOM(body);
			const document = dom.window.document;

			resultIds = Array.from(
				document.querySelectorAll(".item > a:first-child")
				// @ts-ignore
			).map((v) => v.getAttribute("href").replace("/Comic/", ""));
		} else {
			// Fetch search results HTML
			const searchUrl = "https://readcomiconline.li/Search/Comic";
			const searchReq = await fetch(searchUrl, {
				family: 6,
				method: "POST",
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					"user-agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
				},
				body: `keyword=${query.split(" ").join("+")}`,
			});

			// Map search
			if (searchReq.url === searchUrl) {
				// Get each ID for search results
				const searchHTML = await searchReq.text();
				resultIds = searchHTML
					.split('<a href="/Comic/')
					.slice(1)
					.map((v) => v.split('"')[0]);
			} else {
				// If there's only one result, RCO redirects to the comic's page
				resultIds = [searchReq.url.split("/").pop()];
			}
		}

		// Map to Adolla style format
		const chapterCount = query === "" ? 15 : options.resultCount;

		// To Adolla data
		const searchResults = await Promise.all(
			resultIds
				.slice(0, chapterCount)
				.map((id) => updateManga("RCO", id.toString()))
		);

		// Return Adolla-formatted search results
		return searchResults.filter((r) => r.success);
	}
}

// Create instance and extend it
const RCOInstance = new RCOClass();
export default RCOInstance;
