
import { Chapter, ScraperResponse } from "../types";
import fetch from "node-fetch";
import Fuse from "fuse.js";
import updateManga from "../util/updateManga";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import { error } from "./index";

// Search interfaces
/** This is for `DirectoryItem`, the values there aren't very useful */
export enum Directory {
	Genres = "g",
	Slug = "i",
	Title = "s",
	OngoingPublish = "ps", // Maybe?
	OngoingPrint = "ss", // Maybe?
	AlternateTitles = "al"
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
	al: string[]
	l: string;
	lt: number;
	g: string[];
	h: boolean;
}

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
	}

	public async search(query: string, options?: Partial<SearchOptions>): Promise<(ScraperResponse)[]> {

		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		const { resultCount } = {
			resultCount: 40,
			...options,
		}

		let matchedResults = [];
		// If the query is empty, sort by popular
		if(query === "") {
			
			const searchUrl = `https://mangasee123.com/search/?sort=vm&desc=true&name=${encodeURIComponent(query)}`;
			let searchRes = await fetch(searchUrl);	
			let html = await searchRes.text();	


			// Parse directory	
			let directory = JSON.parse(html.split("vm.Directory = ")[1].split("];")[0] + "]");

			// @ts-ignore You can totally substract strings.
			matchedResults = directory.sort((a: DirectoryItem, b: DirectoryItem) => b.v - a.v).slice(0, resultCount);
		
		} else {

			// Fetch search results
			let directory = await (await fetch("https://mangasee123.com/_search.php")).json();
			
			// If query is not empty, use fuse to search
			const fuse = new Fuse(directory, {
				threshold: 0.2,
				distance: 100,
				keys: [Directory.Title, Directory.Genres, Directory.AlternateTitles]
			});
			matchedResults = fuse.search(query)
			  .map(result => result.item)
			  .slice(0, resultCount);
		}

		
		// Get details for each search result
		let searchResultData: ScraperResponse[] = await Promise.all(matchedResults.map((item: DirectoryItem) => updateManga("Mangasee", item[Directory.Slug])))

		// Return all successfull data requests
		return searchResultData.filter(v => v.success);
	}

	/**
	 * The scrape function. This returns data for an anime
	 * @param slug The manga's slug.  
	 * @param chapter 
	 * @param season 
	 */
	public async scrape(slug: string, chapterId: string | number | null = null): Promise<ScraperResponse> {



		let season: number;
		let chapter: number;
		if(chapterId && typeof chapterId === "string") {
			let chapterMatch = chapterId.match(/(\d*\.?\d+)-(\d*\.?\d+)/);
			if(!chapterMatch) {
				return error(403, "Invalid season chapter string");
			}

			let nums: number[] = chapterMatch.map(v => Number(v));
			season = nums[1];
			chapter = nums[2]; // Bit of a hack...
		}

		try {
			// Generate URL and fetch page
			let url = `https://mangasee123.com/manga/${slug}`;
			let pageRes = await fetch(url);
			let html = await pageRes.text();

			// Check if response is valid.
			// Throw error if not
			if(!pageRes.ok || pageRes.url.endsWith("undefined") || html.includes(`<title>404 Page Not Found</title>`)) {
				console.error(`Throwing error for ${slug}`);
				return error(pageRes.status, html);
			}
		
			// Shittily extract values from page.
			// I could be using JSDoc but I'm not.
			let title = html.split("<h1>")[1].split("</h1>")[0]; // You can tell what this does
			let posterUrl = html.split(`<meta property="og:image" content="`)[1].split(`"`)[0]; // Get poster url from og:image
			let alternateTitles = [];
			if(html.includes("Alternate Name(s):")) alternateTitles = html
			  .split(`<span class="mlabel">Alternate Name(s):</span>`)[1] // Find starting point of alternate names
			  .split("<")[0] // Find closing HMTL tag
			  .trim() // Remove trailing stuff
			  .split(", ") // Seperate names on comma
			  .filter(Boolean); // Remove empty strings
		
			  // Get description paragraphs
			let descriptionParagraphs = html
			  .split(`<span class="mlabel">Description:</span>`)[1] // Find start of div of descriptions (it's a bit weird)
			  .split(">")[1] // Find closing of opening paragraph
			  .split("</")[0] // Find closing paragraph
			  .trim() // Remove start & end trim
			  .split("\n") // Get seperate paragraphs
			  .filter(Boolean); // filter out empty strings
		
			// Extract chapter data from script tag in DOM
			// Then `map` it into a Chapter type
			let chapterData = JSON.parse(html.split(`vm.Chapters = `)[1].split(";")[0]);
			let chapters: Chapter[] = chapterData.map((ch: ChapterResponse) => {

				let season = Number(ch.Chapter[0]);
				let chapter = normalizeNumber(ch.Chapter.slice(1)) / 10;
				let label = `${ch.Type} ${chapter}`;
				let date = new Date(ch.Date);
		
				return {
					season,
					chapter,
					label,
					date,
					hrefString: `${season}-${chapter}`,
					combined: (season * 1e5) + chapter
				}
		
			}).sort((a: Chapter, b: Chapter) => a.combined - b.combined);

			// Extract genre array from dom
			let genres = JSON.parse(html.split(`"genre": `)[1].split("],")[0] + "]");
		
			// Get status
			let status = html.split(`<span class="mlabel">Status:</span>`)[1].split(">")[1].split(" (")[0].trim().toLowerCase();

			// Generate chapter images
			let chapterImages: string[] = [];
			if(season >= 0 && chapter >= 0) {
				// Generate URL for page with chapter data
				console.log("Generating chapter images".repeat(50));
				const chapterUrl = `https://mangasee123.com/read-online/${slug}-chapter-${chapter}-index-${season}.html`;

				// Fetch chapter data
				let chapterRes = await fetch(chapterUrl);
				let chapterBody = await chapterRes.text();

				// CDN url, like `s6.mangabeast.com`
				let cdnUrl = chapterBody.split(`vm.CurPathName = "`)[1].split(`"`)[0];
				
				// Get curChapter (which has info on pages and such)
				let curChapter = JSON.parse(chapterBody.split(`vm.CurChapter = `)[1].split("};")[0] + "}");
				
				// Generate URLs
				chapterImages = [];
				for(let page = 0; page < Number(curChapter.Page); page++) {

					// Thanks Pandawan, for helping out with floating point funny business!
					
					// Get 0-paddedchapter string with decimal
					let [chapterNormal, ...chapterModded] = chapter.toString().split(/(\.)/); // Using a capture group holds the divider in the array. ChapterModded becomes ['.', someDecimalNumber]
					let chapterString = `${chapterNormal.padStart(4, "0")}${chapterModded.join("")}`;
					
					// Get directory and page
					let directoryString = curChapter.Directory ? `/${curChapter.Directory}` : "";
					let pageString = (page + 1).toString().padStart(3, "0");

					// Add page url to array
					chapterImages.push(`https://${cdnUrl}/manga/${slug}${directoryString}/${chapterString}-${pageString}.png`);
				
				}

			}

			// Turn chapterImages URLs into base64 strings
			chapterImages = await Promise.all(chapterImages.map(async url => {
				// @ts-ignore node-fetch's TS does not have buffer in its definitions
				let base64 = await fetch(url).then(r => r.buffer()).then(buf => `data:image/${url.split(".").pop()};base64,`+buf.toString('base64'));
				return base64;
			}));

			// NSFW
			const nsfw = false; // I don't think Mangasee has hentai

			// Now we return it
			let providerId = getProviderId(this.provider);
			return {
				constant: {
					title,
					slug,
					posterUrl,
					alternateTitles,
					descriptionParagraphs,
					genres,
					nsfw
				},
				data: {
					chapters,
					chapterImages,
					status
				},
				success: true,
				provider: isProviderId(providerId) ? providerId : null
			}
		} catch(err) {
			//  OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!
			console.error(err.stack);
			return error(-1, err);
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
	let str = input;
	while(str.startsWith("0")) str = str.slice(1);
	return Number(str);
}
