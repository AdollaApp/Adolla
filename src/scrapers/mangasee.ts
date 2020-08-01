
import { ScraperData, ScraperError, Chapter, Directory, DirectoryItem, ScraperResponse } from "../types";
import fetch from "node-fetch";
import Fuse from 'fuse.js'
import updateManga from "../util/updateManga";

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



interface SearchOptions {
	resultCount: number;
	bThing: number;
}

class MangaseeClass {

	public async search(query: string, options?: Partial<SearchOptions>): Promise<(ScraperResponse)[]> {

		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!
		const { resultCount } = {
			resultCount: 40,
			...options,
		}

		// Fetch search results
		const searchUrl = `https://mangasee123.com/search/?sort=vm&desc=true&name=${encodeURIComponent(query)}`;
		let searchRes = await fetch(searchUrl);
		let html = await searchRes.text();

		// Parse directory
		let directory = JSON.parse(html.split("vm.Directory = ")[1].split("];")[0] + "]");
		
		let matchedResults = [];
		// If the query is empty, sort by popular
		if(query === "") {
			// @ts-ignore You can totally substract strings.
			matchedResults = directory.sort((a: DirectoryItem, b: DirectoryItem) => b.v - a.v).slice(0, resultCount);
		} else {
			// If query is not empty, use fuse to search
			const fuse = new Fuse(directory, {
				keys: [Directory.Title]
			});
			matchedResults = fuse.search(query)
			  .map(result => result.item)
			  .slice(0, resultCount);
		}

		
		// Get details for each search result
		let searchResultData: ScraperResponse[] = await Promise.all(matchedResults.map((item: DirectoryItem) => updateManga(item[Directory.Slug])))

		// Return all successfull data requests
		return searchResultData.filter(v => v.success);
	}

	/**
	 * The scrape function. This returns data for an anime
	 * @param slug The manga's slug.  
	 * @param chapter 
	 * @param season 
	 */
	public async scrape(slug: string, chapter: number = -1, season: number = -1): Promise<ScraperResponse> {

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
				let chapter = normalizeNumber(ch.Chapter.slice(1, -1))
				let label = `${ch.Type} ${chapter}`;
				let date = new Date(ch.Date);
				let href = `/${slug}/${season}-${chapter}/`;
		
				return {
					season,
					chapter,
					label,
					date,
					href,
					combined: (season * 1e5) + chapter
				}
		
			}).sort((a: Chapter, b: Chapter) => a.combined - b.combined);

			// Extract genre array from dom
			let genres = JSON.parse(html.split(`"genre": `)[1].split("],")[0] + "]");
		
			// Generate chapter images
			let chapterImages;
			if(season >= 0 && chapter >= 0) {
				console.log("Fetching chapter image page");
				// Generate URL for page with chapter data
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
					chapterImages.push(`https://${cdnUrl}/manga/${slug}${curChapter.Directory ? `/${curChapter.Directory}` : ""}/${chapter.toString().padStart(4, "0")}-${(page + 1).toString().padStart(3, "0")}.png`);
				}

				console.log("Got HTML");


			}

			// Now we return it
			return {
				constant: {
					title,
					slug,
					posterUrl,
					alternateTitles,
					descriptionParagraphs,
					genres
				},
				data: {
					chapters,
					chapterImages
				},
				success: true
			}
		} catch(err) {
			//  OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!
			console.log(err.stack);
			return error(-1, err);
		}

		
	}
}

/** 
 * Generate error object easily 
 * @param status The HTTP status code
 * @param err A string describing the error
 */
function error(status = -1, err = "Unknown"): ScraperError {
	return {
		status,
		err,
		success: false
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
