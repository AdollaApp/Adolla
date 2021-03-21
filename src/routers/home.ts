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

router.get("/", async (req, res) => {
	const url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	const { popular, reading, lists } = await getData();

	res.render("home", {
		popular,
		reading,
		lists,
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
	console.time("lists");
	let lists = await getLists(true);
	console.timeEnd("lists");

	// Get reading
	console.time("reading");
	const reading = await getReading();
	console.timeEnd("reading");

	// Get popular manga
	const maxReading = secretConfig.max_reading_to_show_popular ?? 10;
	console.time("popular");

	let popular: ScraperResponse[] | SearchError = [];
	if (reading.length < maxReading) {
		popular = await doSearch("mangasee", "", {
			resultCount: 20,
		}); // Empty search sorts by popular
	}
	console.timeEnd("popular");

	// Set progress for popular manga
	console.time("popular2");
	if (Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}
	console.timeEnd("popular2");

	return { lists, reading, popular };
}

export default router;
