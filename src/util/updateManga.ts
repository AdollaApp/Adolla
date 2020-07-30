
import Mangasee from "../scrapers/mangasee";
import db from "../db";

const minute = 1e3 * 60;

export default async function updateManga(slug: string, ignoreExisting: boolean = false) {

	let existing = db.get(`manga_cache.${slug}`).value();
	if(existing && existing.savedAt > Date.now() - 30 * minute) return existing; // TODO check for time

	let data = await Mangasee.scrape(slug);
	if(data.success) {
		data.savedAt = Date.now(); 
		db.set(`manga_cache.${slug}`, data).write();
	} 
	return data;
}