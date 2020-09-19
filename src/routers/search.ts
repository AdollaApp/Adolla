
import express from "express";
const router = express.Router();

import Mangasee from "../scrapers/mangasee";
import { ScraperResponse } from "../types";
import { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";

router.get("/", async (req, res) => {
	let query = ((req.query.q ?? "") as string).trim();
	
	let searchResults: ScraperResponse[] = [];
	searchResults = await Mangasee.search(query);
	
	await Promise.all(searchResults.map(setMangaProgress));

	let reading = await getReading(4);

	res.render("search", {
		reading,
		query,
		searchResults,
		isSearch: true
	});
});

export default router;