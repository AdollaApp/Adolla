import { ScraperError } from "../types";

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

// Import Mangahere
import MangahereInstance from "./mangahere";
export const Mangahere = MangahereInstance;

// Import MangaDex V5
import MangadexInstance from "./mangadex-v5";
export const Mangadex5 = MangadexInstance;

export const scrapers = {
	Mangasee,
	Mangadex5,
	Manganelo,
	Mangahere,
	RCO,
	ComicExtra,
	nhentai,
};
