import express from "express";
const router = express.Router();

import { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";
import { doSearch } from "../util/doSearch";
import secretConfig from "../util/secretConfig";
import { SearchError } from "../scrapers/types";
import { ScraperResponse } from "../types";
import { getAnnouncements } from "../util/getAnnouncements";

router.get("/", async (req, res) => {
	const url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	const { popular, reading, lists } = await getData();

	const announcements = await getAnnouncements();

	res.render("home", {
		popular,
		reading,
		lists,
		announcements,
		isHome: true,
	});
});

router.get("/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	const data = await getData();
	res.json({ data });
});

async function getData() {
	// Get lists
	let lists = await getLists(true);

	// Get reading
	const reading = await getReading();

	// Get popular manga
	const maxReading = secretConfig.max_reading_to_show_popular ?? 10;

	let popular: ScraperResponse[] | SearchError = [];
	if (reading.length < maxReading) {
		popular = await doSearch("mangasee", "", {
			resultCount: 20,
		}); // Empty search sorts by popular
	}

	// Set progress for popular manga
	if (Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}

	return { lists, reading, popular };
}

export default router;
