
import fetch from "node-fetch-extra";
import chalk from "chalk";
import updateManga from "../util/updateManga";
import { XmlEntities } from "html-entities";
import { Chapter, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import { error } from "./index";

const Entities = new XmlEntities();


class RCOClass extends Scraper {

	constructor() {
		super();
		this.provider = "RCO";
		this.canSearch = true;
	}

	public scrape(slug: string, chapterId: number = -1): Promise<ScraperResponse> {

		return new Promise(async resolve => {

			try {

				let mainReq = await fetch(`https://readcomiconline.to/Comic/${slug}`, {
					family: 6,
					headers: {
						"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
					}
				});
				let html = await (mainReq).text();
				html = html.replace(/\r\n|  |\t/g, "")

				// Get title
				let title = Entities.decode(html.split(`<a Class="bigChar"`)[1].split(">")[1].split("</")[0]);

				// Get poster URL
				let posterUrl = "/poster.png";
				try {
					posterUrl = html.split(`Cover</div>`)[1].trim().split(`src="`)[1].split(`"`)[0].replace(/https\/\//g, "https://");
					if(!posterUrl.startsWith("http")) posterUrl = `https://readcomiconline.to` + posterUrl;
				} catch(err) {
					posterUrl = "/poster.png";
				}

				// Description
				let descriptionParagraphs = [];
				try {
					descriptionParagraphs = Entities.decode(html.split(`<p style="text-align: justify;">`)[1].split("</p>")[0]).split("<br />");
				} catch(err) {
					// Something, I'm sure
				}

				// Get chapters
				let chaptersHTML = html.split("<tr>").slice(2).map(s => s.split("</tr>")[0]);
				let chapters: Chapter[] = chaptersHTML.map((str: string, i: number) => {

					let [_null, tdOne, tdTwo] = str.split("<td>").map(s => s.split("</td>")[0]);
					
					let label = tdOne.split(`">`)[1].split("</")[0].replace(title, "").trim();		
					let hrefString = tdOne.split(`href="`)[1].split(`"`)[0].split("?")[0].split("/").pop();

					return {
						label,
						season: 1,
						chapter: chaptersHTML.length - i,
						combined: chaptersHTML.length - i,
						date: new Date(tdTwo),
						hrefString
					}
				}).sort((a, b) => a.combined - b.combined)

				// Get chapter's images
				let chapterImages = [];
				if(chapterId !== -1) {
					
					let imgReq = await fetch(`https://readcomiconline.to/Comic/${slug}/${chapterId}?quality=lq`, {
						family: 6,
						headers: {
							"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
						}
					});
					let chapterHTML = await imgReq.text();

					let js = chapterHTML.split(`var lstImages = new Array();`)[1].split(`var currImage = 0;`)[0];
					let imgSources = js.match(/lstImages\.push\("(.+?)"\);/g).map(snippet => {
						return snippet.match(/lstImages\.push\("(.+?)"\);/)[1];
					});

					chapterImages = imgSources;
				}

				// Series status
				let status = html.split(`Status:</span>`)[1].split("<")[0].trim().replace(/&nbsp;/g, "").toLowerCase();

				// Get provider
				let provider = getProviderId(this.provider);

				console.info(chalk.blue("[RCO]") + ` Resolving ${title} at ${new Date().toLocaleString("it")}`);

				resolve({
					constant: {
						title,
						slug,
						posterUrl,
						alternateTitles: [],
						genres: [],
						descriptionParagraphs,
						nsfw: false
					},
					data: {
						chapters,
						chapterImages,
						status
					},
					success: true,
					provider: isProviderId(provider) ? provider : null
				});

			} catch (err) {
				console.error(chalk.red("[RCO]") + ` An error occured:`, err);
				resolve(error(0, err));
			}

		});

	}
	public async search(query: string, options?: Partial<SearchOptions>) {
		// Verify we can search
		if(!this.canSearch) {
			return {
				error: "Unable to search. Check logs for more information."
			}
		}

		
		let resultIds = [];
		if(query === "") {
			// Fetch popular page
			let mainReq = await fetch("https://readcomiconline.to/ComicList/MostPopular", {
				family: 6,
				headers: {
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
				}
			});
			// Get HTML for page
			let body = await mainReq.text();

			// Get each table row
			let divs = body.split(`<tr>`).slice(1).map(v => v.split("</tr>")[0].replace(/\r\n|  |\t/g, ""));

			// Extract links
			resultIds = divs.map(div => {
				// Get slug from table row
				let slug = div.split(`href="/Comic/`)[1].split(`"`)[0];
				return slug;
			});

		} else {
			// Fetch search results HTML
			let searchUrl = "https://readcomiconline.to/Search/Comic";
			let searchReq = await fetch(searchUrl, {
				family: 6,
				method: "POST",
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36"
				},
				body: `keyword=${query.split(" ").join("+")}`
			});

			
			// Map search
			if(searchReq.url === searchUrl) {
				let searchHTML = await searchReq.text();
				resultIds = searchHTML.split(`<a href="/Comic/`).slice(1).map(v => v.split(`"`)[0]);
			} else {
				// If there's only one result, RCO redirects to the comic's page
				resultIds = [searchReq.url.split("/").pop()];
			}
			
		}


		// Map to Adolla style format
		let chapterCount = query === "" ? 15 : options.resultCount;

		// To Adolla data
		let searchResults = await Promise.all(resultIds
			.slice(0, chapterCount)
			.map(id => updateManga("RCO", id.toString()) 
		));
		
		// Return Adolla-formatted search results
		return searchResults.filter(r => r.success);

	}
}

// Create instance and extend it
const RCOInstance = new RCOClass();
export default RCOInstance;