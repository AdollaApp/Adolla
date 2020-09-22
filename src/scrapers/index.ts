
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
		success: false
	}
}

// Import Mangasee
import MangaseeInstance from "./mangasee";
export const Mangasee = MangaseeInstance;

// Import MangaDex
import MangadexInstance from "./mangadex";
export const Mangadex = MangadexInstance;