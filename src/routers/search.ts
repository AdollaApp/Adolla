
import express from "express";
const router = express.Router();

import Mangasee from "../scrapers/mangasee";
import { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";

router.get("/", async (req, res) => {
	let query = req.query.q as string;
	
	let searchResults = await Mangasee.search(query);
	
	await Promise.all(searchResults.map(setMangaProgress));

	let reading = await getReading();

	res.render("search", {
		reading,
		query,
		searchResults
	});
});

export default router;