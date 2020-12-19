
import express from "express";
const router = express.Router();

import { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";
import { doSearch } from "../util/doSearch";

router.get("/", async (req, res) => {

	const url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	// Get popular manga
	const popular = await doSearch("mangasee", "", {
		resultCount: 20
	}); // Empty search sorts by popular

	// Set progress for popular manga
	if(Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}
	// Get lists
	let lists = await getLists();
	lists = lists.filter(list => list.showOnHome);
	
	// Get reading
	const reading = await getReading();

	res.render("home", {
		popular,
		reading,
		lists,
		isHome: true
	});
});

export default router;