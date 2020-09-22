
import express from "express";
const router = express.Router();

import { ScraperResponse } from "../types";
import { doSearch } from "../util/doSearch";
import { setMangaProgress } from "../util/getMangaProgress";
import { SearchError } from "../scrapers/types";
import getReading from "../util/getReading";

router.get("/", async (req, res) => {
	let query = ((req.query.q ?? "") as string).trim();
	
	let searchResults: ScraperResponse[] | SearchError = [];
	searchResults = await doSearch("mangasee", query);
	
	if(Array.isArray(searchResults)) {
		await Promise.all(searchResults.map(setMangaProgress));
	}

	let reading = await getReading(4);

	res.render("search", {
		reading,
		query,
		searchResults,
		isSearch: true
	});
});

export default router;