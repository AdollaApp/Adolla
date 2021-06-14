import express from "express";
const router = express.Router();

import * as scrapers from "../scrapers";
import { ScraperResponse } from "../types";
import { doSearch } from "../util/doSearch";
import { setMangaProgress } from "../util/getMangaProgress";
import { ProviderId, Scraper, SearchError } from "../scrapers/types";
import { getProviderId, getProviderName, isProviderId } from "./manga-page";
import getReading from "../util/getReading";
import db from "../db";

router.get("/", (req, res) => {
	const query = ((req.query.q ?? "") as string).trim();
	res.redirect(
		`/search/mangasee/${query ? `?q=${encodeURIComponent(query)}` : ""}`
	);
});

router.get("/:provider", async (req, res, next) => {
	const query = ((req.query.q ?? "") as string).trim();

	// Get scraper name
	const param = req.params.provider.toLowerCase();
	const provider: ProviderId | null = isProviderId(param) ? param : null;
	const scraperName = getProviderName(provider);
	if (!scraperName) {
		next();
		return;
	}

	// !Get search results
	// Get search results
	let searchResults: ScraperResponse[] | SearchError = [];
	searchResults = await doSearch(provider, query);
	if (Array.isArray(searchResults)) {
		searchResults = searchResults.filter((v) => v.success);
	}

	// Verify search results
	if (Array.isArray(searchResults)) {
		await Promise.all(searchResults.map(setMangaProgress));
	}

	// ! Get all scrapers and names

	// Get all scrapers
	const scrapersArray: Scraper[] = Object.values(scrapers.scrapers);

	// Get name, id, href, and if whether or not the current scraper
	const scraperMap = scrapersArray
		.map((scraper) => {
			const id = getProviderId(scraper.provider);
			const name = getProviderName(id);

			if (db.get("settings.show-nsfw") === "no" && scraper.nsfw) return null;
			if (!scraper.canSearch) return null;

			return {
				id,
				name: scraper.searchDisplay ?? name,
				href: `/search/${id}/${query ? `?q=${encodeURIComponent(query)}` : ""}`,
				isCurrent: id === param,
			};
		})
		.filter(Boolean);

	res.render("search", {
		query,
		searchResults,
		isSearch: true,
		scrapers: scraperMap,
	});
});

router.get("/:provider/json", async (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	const query = ((req.query.q ?? "") as string).trim();

	// Get scraper name
	const param = req.params.provider.toLowerCase();
	const provider: ProviderId | null = isProviderId(param) ? param : null;
	const scraperName = getProviderName(provider);
	if (!scraperName) {
		next();
		return;
	}

	// !Get search results
	// Get search results
	let searchResults: ScraperResponse[] | SearchError = [];
	searchResults = await doSearch(provider, query);

	// Verify search results
	if (Array.isArray(searchResults)) {
		await Promise.all(searchResults.map(setMangaProgress));
	}

	// ! Get reading
	const reading = await getReading(4);

	// ! Get all scrapers and names

	// Get all scrapers
	const scrapersArray: Scraper[] = Object.values(scrapers.scrapers);

	// Get name, id, href, and if whether or not the current scraper
	const scraperMap = scrapersArray.map((scraper) => {
		const id = getProviderId(scraper.provider);
		const name = getProviderName(id);
		return {
			id,
			name,
			href: `/search/${id}/${query ? `?q=${encodeURIComponent(query)}` : ""}`,
			isCurrent: id === param,
		};
	});

	res.json({
		data: {
			reading,
			query,
			searchResults,
			scrapers: scraperMap,
		},
	});
});

export default router;
