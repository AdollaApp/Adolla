import chalk from "chalk";
import fetch from "node-fetch-extra";
import { JSDOM } from "jsdom";
import { error } from "./index";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class mangahereClass extends Scraper {
	constructor() {
		super();
		this.provider = "Mangahere";
		this.canSearch = true;
		this.nsfw = false;
	}

	public async search(query: string, options?: Partial<SearchOptions>) {
		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		const { resultCount } = {
			resultCount: 12,
			...options,
		};

		let pageUrl: string;

		if (query === "") {
			// Get popular page
			pageUrl = "http://www.mangahere.cc/ranking/";
		} else {
			pageUrl = `http://www.mangahere.cc/search?title=${encodeURIComponent(
				query
			)}`;
		}

		// Fetch DOM for relevant page
		const pageReq = await fetch(pageUrl);
		const pageHtml = await pageReq.text();

		// Get DOM for popular page
		const dom = new JSDOM(pageHtml);
		const document = dom.window.document;

		// Get nodes
		const anchors = [
			...document.querySelectorAll("p.manga-list-4-item-title a"),
			...document.querySelectorAll("p.manga-list-1-item-title a"),
		];

		// Get IDs from nodes
		const ids = anchors
			.map((anchor) => anchor.href.split("/")[2])
			.slice(0, resultCount);

		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("mangahere", id))
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
				chalk.red("[mangahere]") +
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
		// Get HTML
		const pageReq = await fetch(`http://www.mangahere.cc/manga/${slug}`, {
			headers: { cookie: "isAdult=1" },
		});
		const pageHtml = await pageReq.text();

		// Get variables
		const dom = new JSDOM(pageHtml);
		const document = dom.window.document;

		// Get title
		const title = document.querySelector(".detail-info-right-title-font")
			.textContent;

		// Get poster URL
		let posterUrl = document.querySelector(".detail-info-cover-img").src;
		if (posterUrl.startsWith("/"))
			posterUrl = "https://www.mangahere.cc" + posterUrl;
		posterUrl = `/proxy-image?url=${posterUrl}&referer=mangahere`;

		// Get genres from tags
		const genreWrapper = document.querySelector(".detail-info-right-tag-list");
		const genreLinks = [...genreWrapper.querySelectorAll("a")];
		const genres = genreLinks.map((v) => v.textContent);

		// Get alternate titles
		const alternateTitles = [""];

		// Get status
		const statusWrapper = document.querySelector(
			".detail-info-right-title-tip"
		);
		const status = statusWrapper.textContent.toLowerCase();

		// Get chapters
		const chapters: Chapter[] = [
			...document.querySelectorAll(".detail-main-list li"),
		]
			.reverse()
			.map(
				(row): Chapter => {
					// Find all values
					const label = row.querySelector("a .detail-main-list-main .title3")
						.textContent;
					const slug = row.querySelector("a").href.split("/")[3];
					const chapter = row.querySelector("a").href.split("/")[3].slice(1);
					let date = new Date(
						row.querySelector("a .detail-main-list-main .title2").textContent
					);

					// Make sure date is valid, otherwise set it to now
					// Thanks for nothing MangaHere (it might be something like "x hours ago")
					if (!date.getTime()) date = new Date();

					// Return product of chapter
					return {
						label,
						hrefString: slug,
						season: 1,
						chapter,
						date,
						combined: Number(chapter),
					};
				}
			);

		// Find images
		let chapterImages = [];
		if (chapterId != "-1") {
			// Scrape page to find images
			const url = `http://mangahere.cc/roll_manga/${slug}/${chapterId}/1.html`;
			const chapterPageReq = await fetch(url, {});
			const chapterPageHtml = await chapterPageReq.text();

			// Ooooh boy
			const internalChapterId = chapterPageHtml.match(
				/var chapterid =(\d+);/
			)[1];

			const evalUrls = [
				`https://www.mangahere.cc/manga/${slug}/${chapterId}/chapterfun.ashx?cid=${internalChapterId}&page=1&key=`,
				`https://www.mangahere.cc/manga/${slug}/${chapterId}/chapterfun.ashx?cid=${internalChapterId}&page=2&key=`,
			];

			const allImageUrls: string[] = [];

			for (const evalUrl of evalUrls) {
				const code = (
					await fetch(evalUrl, {
						headers: {
							cookie: `image_time_cookie=1150766|637986415228659192|0,${internalChapterId}|637986436934227685|1;`,
							"accept-language":
								"en-GB,en;q=0.9,nl;q=0.8,la;q=0.7,af;q=0.6,fr;q=0.5,de;q=0.4,fy;q=0.3,haw;q=0.2,lb;q=0.1",
							Referer: `https://www.mangahere.cc/manga/${slug}/${slug}/`,
						},
					}).then((d) => d.text())
				).slice(5, -2);

				let currentimageid = 1;
				let imgGenCode = "";
				eval(`imgGenCode = ${code};`);
				const urls = eval(`${imgGenCode}d;`); // Run image URL generation code and return d
				allImageUrls.push(...urls);
			}

			chapterImages = Array.from(new Set(allImageUrls))
				.map((url) => `https:${url}`)
				.map(
					(url) =>
						`/proxy-image?url=${encodeURIComponent(url)}&referer=mangahere`
				);
			console.log(chapterImages);
		}

		// Find description
		const descriptionParagraphs = document
			.querySelector(".fullcontent")
			.textContent.split(/\n|<br>/g);

		// Return it.
		const providerId = getProviderId(this.provider);
		return {
			constant: {
				title,
				slug,
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
	}
}

// Generate mangahere object and export it
const mangahere = new mangahereClass();
export default mangahere;
