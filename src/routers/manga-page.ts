
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";

router.get("/:slug", async (req, res, next) => {

	let param = req.params.slug;

	// DEBUGGING:
	// await updateManga("Fire-Brigade-Of-Flames");
	// await updateManga("Yokohama-Kaidashi-Kikou");
	// await updateManga("Tower-Of-God");

	await updateManga(param);

	let data = db.get(`manga_cache.${param}`).value();
	if(data) {
		res.render("manga", {
			data
		});
	} else {
		console.log("No data found for", param);
		next();
	}

	
});

export default router;