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
	// Get popular manga
	const popular = await doSearch("mangasee", "", {
		resultCount: 20,
	}); // Empty search sorts by popular

	// Set progress for popular manga
	if (Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}
	// Get lists
	let lists = await getLists();
	lists = lists.filter((list) => list.showOnHome);

	// Get reading
	const reading = await getReading();

	return { lists, reading, popular };
}

export default router;
