
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";

router.get("/:slug", async (req, res) => {

	let param = req.params.slug;

	// DEBUGGING:
	// await updateManga("Fire-Brigade-Of-Flames");
	// await updateManga("Yokohama-Kaidashi-Kikou");
	// await updateManga("Tower-Of-God");

	await updateManga(param);

	let data = db.get(`manga_cache.${param}`).value();
	console.log(data);

	res.render("manga", {
		data
	});
});

export default router;