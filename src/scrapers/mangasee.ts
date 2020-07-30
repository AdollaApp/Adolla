
import { ScraperData, ScraperError, Chapter } from "../types";
import fetch from "node-fetch";

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



class MangaseeClass {
	constructor() {

	}

	public async search(query: string): Promise<(ScraperData | ScraperError)[]> {

		return [];
	}

	public async scrape(slug: string, chapter: number = -1, season: number = -1): Promise<ScraperData | ScraperError> {

		async function error() {
			return {
				status: pageRes.status,
				res: html,
				success: false
			}
		}
	
		let url = `https://mangasee123.com/manga/${slug}`;
	
		let pageRes = await fetch(url);
		
		let html = await pageRes.text();

		if(!pageRes.ok || pageRes.url.endsWith("undefined") || html.includes(`<title>404 Page Not Found</title>`)) {
			console.error(`Throwing error for ${slug}`);
			return await error();
		}
	
		let title = html.split("<h1>")[1].split("</h1>")[0];
		let posterUrl = html.split(`<meta property="og:image" content="`)[1].split(`"`)[0];
		let alternateTitles = html.split(`<span class="mlabel">Alternate Name(s):</span>`)[1].split("<")[0].trim().split(", ").filter(Boolean);
	
		let descriptionParagraphs = html.split(`<span class="mlabel">Description:</span>`)[1].split(">")[1].split("</")[0].trim().split("\n").filter(Boolean);
	
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
				href
			}
	
		});
	
		return {
			constant: {
				title,
				slug,
				posterUrl,
				alternateTitles,
				descriptionParagraphs
			},
			data: {
				chapters
			},
			success: true
		}
	}
}

const Mangasee = new MangaseeClass();
export default Mangasee;

function normalizeNumber(input: string): number {
	let str = input;
	while(str.startsWith("0")) str = str.slice(1);
	return Number(str);
}