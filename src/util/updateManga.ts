
import Mangasee from "../scrapers/mangasee";
import db from "../db";

export default async function updateManga(slug: string) {
	let data = await Mangasee.scrape(slug);
	if(data.success) db.set(`manga_cache.${slug}`, data).write();
}