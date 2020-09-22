
import express from "express";
const router = express.Router();

import { ScraperResponse } from "../types";
import { doSearch } from "../util/doSearch";
import { setMangaProgress } from "../util/getMangaProgress";
import { ProviderId, SearchError } from "../scrapers/types";
import { getScraperName, isScraperId } from "./manga-page";
import getReading from "../util/getReading";

router.get("/", (req, res) => {
	let query = ((req.query.q ?? "") as string).trim();
	res.redirect(`/search/mangasee/${query ? `?q=${encodeURIComponent(query)}` : ""}`);
});

router.get("/:provider", async (req, res, next) => {
	let query = ((req.query.q ?? "") as string).trim();

	// Get scraper name
	let param = req.params.provider;
	const provider: ProviderId | null = isScraperId(param) ? param : null;
	let scraperName = getScraperName(provider);
	if(!scraperName) {
		next();
		return;
	}	

	// Get search results
	let searchResults: ScraperResponse[] | SearchError = [];
	searchResults = await doSearch(provider, query);
	
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