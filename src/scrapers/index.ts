import { ScraperError } from "../types";
import fetch from "node-fetch-extra";

/**
 * Generate error object easily
 * @param status The HTTP status code
 * @param err A string describing the error
 */
export function error(status = -1, err = "Unknown"): ScraperError {
	return {
		status,
		err,
		success: false,
	};
}

export async function getDataFromURL(url: string, maxRetries = 4) {
	let retryCount = 0;
	let isValid = false;
	let data: any = {};

	while (!isValid && retryCount < maxRetries) {
		// Get data
		const dataReq = await fetch(url);
		if (dataReq.status === 204) {
			// Empty result.
			// Just end the loop
			isValid = true;
			return data;
		} else {
			let res = (data = await dataReq.text());
			if (!res.startsWith("<") && res.trim().length > 0) {
				try {
					data = JSON.parse(data);
					isValid = true;
				} catch (e) {
					// Oh well
					retryCount++;
					await sleep(100 * Math.floor(Math.random() * 50));
				}
			} else {
				retryCount++;
				await sleep(100 * Math.floor(Math.random() * 50));
			}
		}
	}
	return data;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Import Mangasee
import MangaseeInstance from "./mangasee";
export const Mangasee = MangaseeInstance;

// Import MangaDex
// import MangadexInstance from "./mangadex";
// export const Mangadex = MangadexInstance;

// Import ReadComicsOnline
import RCOInstance from "./rco";
export const RCO = RCOInstance;

// Import Manganelo
import ManganeloInstance from "./manganelo";
export const Manganelo = ManganeloInstance;

// Import ComicExtra
import ComicExtraInstance from "./comicextra";
export const ComicExtra = ComicExtraInstance;

// Import nhentai
import nhentaiInstance from "./nhentai";
export const nhentai = nhentaiInstance;

// Import nhentai.net
import nhentainetInstance from "./nhentainet";
export const nhentainet = nhentainetInstance;

// Import Mangahere
import MangahereInstance from "./mangahere";
export const Mangahere = MangahereInstance;

// Import MangaDex V5
import MangadexInstance from "./mangadex-v5";
export const Mangadex5 = MangadexInstance;

// Import Guya.moe
import GuyaInstance from "./guya";
export const Guya = GuyaInstance;

// Import Gmanga
import GmangaInstance from "./gmanga";
export const Gmanga = GmangaInstance;

export const scrapers = {
	Mangasee,
	Mangadex5,
	Manganelo,
	Mangahere,
	RCO,
	ComicExtra,
	nhentai,
	nhentainet,
	Guya,
	Gmanga,
};
