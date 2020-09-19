
import express from "express";
const router = express.Router();

import * as scrapers from "../scrapers";
import { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";

router.get("/", async (req, res) => {

	let url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	// Get popular manga
	let popular = await scrapers.Mangasee.search("", {
		resultCount: 20
	}); // Empty search sorts by popular

	// Set progress for popular manga
	await Promise.all(popular.map(setMangaProgress));

	// Get lists
	let lists = await getLists();
	lists = lists.filter(list => list.showOnHome);
	
	// Get reading
	let reading = await getReading();

	res.render("home", {
		popular,
		reading,
		lists,
		isHome: true
	});
});

export default router;