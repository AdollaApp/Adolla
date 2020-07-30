
import express from "express";
const router = express.Router();

import Mangasee from "../scrapers/mangasee";

router.get("/", async (req, res) => {
	let query = req.query.q as string;
	
	let searchResults = await Mangasee.search(query, {
		resultCount: 1
	});

	res.render("search", {
		query,
		searchResults
	});
});

export default router;