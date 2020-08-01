
import express from "express";
const router = express.Router();

import Mangasee from "../scrapers/mangasee";
import db from "../db";
import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import updateManga from "../util/updateManga";
import { StoredData } from "../types";

router.get("/", async (req, res) => {

	// Get popular manga
	let popular = await Mangasee.search("", {
		resultCount: 20
	}); // Empty search sorts by popular

	// Set progress for popular manga
	await Promise.all(popular.map(setMangaProgress));
	
	// Get manga that is being read
	let readingManga = db.get("reading").value();
	let readingKeys = Object.keys(readingManga).sort((b, a) => readingManga[a].last.at - readingManga[b].last.at);

	let reading = await Promise.all(readingKeys.map(async slug => {
		let manga: StoredData = await updateManga(slug);
		manga = await setMangaProgress(manga);
		return manga;
	}));

	res.render("home", {
		popular,
		reading
	});
});

export default router;