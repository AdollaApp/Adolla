
import express from "express";
const router = express.Router();

import Mangasee from "../scrapers/mangasee";

router.get("/", async (req, res) => {

	let popular = await Mangasee.search("", {
		resultCount: 20
	}); // Empty search sorts by popular

	res.render("home", {
		popular
	});
});

export default router;