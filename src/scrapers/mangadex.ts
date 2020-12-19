
import chalk from "chalk";
import fetch from "node-fetch-extra";
import { Mangadex, Tag } from "mangadex-api";

import secretConfig from "../util/secretConfig";
import updateManga from "../util/updateManga";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import { error } from "./index";
import { disallowedGenres } from "../config.json";

class MangadexClass extends Scraper {

	private client: Mangadex | null;
	private tags: Tag[] | null;

	constructor() {
		super();
		
		this.provider = "Mangadex";
		this.canSearch = false;
		this.tags = null;
		
		// Update tags
		this.updateTags()

		// Log in
		this.client = new Mangadex();
		if(secretConfig?.mangadex?.username && secretConfig?.mangadex?.password) {
			try {
				this.doLogin();
				setInterval(this.doLogin, 1e3 * 60 * 60 * 2);
			} catch(err) {
				this.client = null;
				console.error(chalk.red("[MANGADEX]") + ` An error occured:`, err);
			}

		} else {
			this.client = null;
			console.error(chalk.red("[SECRET]") + ` No mangadex credentials provided in secret-config. Search will be disabled.`);
		}
	}

	private doLogin() {
		this.client.agent.login(secretConfig.mangadex.username, secretConfig.mangadex.password).then(res => {
			if(res) {
				this.canSearch = true;
				console.info(chalk.green("[MANGADEX]") + ` Signed into MangaDex`);	
			} else {
				console.error(chalk.red("[MANGADEX]") + ` Failed to sign into MangaDex`);	
			}
		});
	}

	private async updateTags() {
		// A tag is really a genre
		this.tags = await Mangadex.tag.getTags();
	}

	public async scrape(slug: string, chapterId: number = -1): Promise<ScraperResponse> {
		
		// Set a timeout for how long the request is allowed to take
		let maxTimeout: Promise<ScraperError> = new Promise(resolve => {
			setTimeout(() => {
				resolve(error(0, "This request took too long"));
			}, 25e3);
		});

		// Attempt scraping series
		let scraping = this.doScrape(slug, chapterId);
		
		// Get first result of either scraping or timeout
		let raceResult = await Promise.race([maxTimeout, scraping]);

		// Check if it's the timeout instead of the scraped result
		if(raceResult.success === false && raceResult.err === "This request took too long") {
			console.error(chalk.red("[MANGADEX]") + ` A request for '${slug}' at '${chapterId}' took too long and has timed out`);
		}

		// Return result
		return raceResult;

	}

	private async doScrape(slug: string, chapterId: number = -1): Promise<ScraperResponse> {
		try {
	
			// Get ID (IDs for MangaDex are always numbers, except they're provided as strings)
			let id = Number(slug);
		
			// Get main data
			let data = await Mangadex.manga.getManga(id);

			// Chapters
			let chaptersData = await Mangadex.manga.getMangaChapters(id);
			let chapters = chaptersData.chapters
			  .filter(c => c.language.includes("en") || c.language.includes("gb") || c.language.includes("nl"));

			// Get largest volume count
			let largestVolumeCount = 0;
			for(let chapter of chapters) {
				let volume = Number(chapter.volume);
				if(volume > largestVolumeCount) largestVolumeCount = volume;
			}

			// Map chapters to new format
			let newChapters: Chapter[] = chapters.map(c => {
				let volume = Number(c.volume) || largestVolumeCount + 1;
				let chapter = Number(c.chapter);
				return {
					season: volume,
					chapter,
					label: `V${volume} - Chapter ${chapter ?? "??"}`,
					date: new Date(c.timestamp * 1e3),
					combined: (volume * 1e5) + chapter,
					hrefString: c.id.toString()
				};
			}).sort((a, b) => a.combined - b.combined);

			// Get chapter-relevant data
			// Just images I think
			let chapterImages: string[] = [];

			if(chapterId && chapterId !== null && chapterId !== -1) {
				let chapter = await Mangadex.chapter.getChapter(Number(chapterId));

				let imagePromises = chapter.pages.map(async url => {
					// @ts-ignore node-fetch's TS does not have buffer in its definitions
					let base64 = await fetch(url).then(r => r.buffer()).then(buf => `data:image/${url.split(".").pop()};base64,`+buf.toString('base64'));
					return base64;
				});

				chapterImages = await Promise.all(imagePromises); // Page array is an array filled with URLs. Perfect!
			}

			// Get series status
			let mdStatus = [null, "ongoing", "completed", "cancelled", "hiatus"];
			let status = mdStatus[data.publication.status]; // data.manga.status is an integer, 1-indexed

			// Map genres
			let genres = data.tags.map(num => this.tags.find(tag => tag.id === num)?.name ?? "Unknown genre");

			// Get description paragraphs
			const descriptionParagraphs = data.description.split("\r\n").filter(Boolean).filter(c => !c.startsWith("["));

			// See if it's hentai 
			let nsfw = data.isHentai;
			for(let genre of genres) {
				if(disallowedGenres.includes(genre.toLowerCase())) nsfw = true;
			}

			// Return data
			let provider = getProviderId(this.provider);
		
			// console.info(chalk.blue(" [MD]") + ` Resolving ${data.title} at ${new Date().toLocaleString("it")}`);

			return {
				constant: {
					title: data.title,
					slug,
					genres,
					posterUrl: data.mainCover,
					alternateTitles: data.altTitles,
					descriptionParagraphs,
					nsfw
				},
				data: {
					chapters: newChapters,
					chapterImages,
					status
				},
				success: true,
				provider: isProviderId(provider) ? provider : null
			};
		} catch(err) {
			console.error(chalk.red("[MANGADEX]") + ` An error occured:`, err);
			return error(0, err);
		}
	}

	public async search(query: string, options?: Partial<SearchOptions>) {

		// MangaDex takes a bit sometimes to enable search
		// Verify we can search MangaDex
		if(!this.canSearch) {
			return {
				error: "Unable to search. Check logs for more information."
			}
		}

		let searchData = await this.client.search(query); // Get search results

		// Map to Adolla style format
		let resultIds = searchData.titles.map(title => title.id)
		let searchResults = await Promise.all(resultIds
			.slice(0, query === "" ? 5 : options.resultCount)
			.map(id => updateManga("Mangadex", id.toString()) 
		));
		
		// Return Adolla-formatted search results
		return searchResults.filter(r => r.success);
	}
}

// Create instance and extend it
const Mangadex2 = new MangadexClass();
export default Mangadex2;