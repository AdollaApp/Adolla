
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";
import Mangasee from "../scrapers/mangasee";

// DEBUGGING:
// await updateManga("Fire-Brigade-Of-Flames");
// await updateManga("Yokohama-Kaidashi-Kikou");
// await updateManga("Tower-Of-God");

router.get("/:slug", async (req, res, next) => {

	let param = req.params.slug;

	await updateManga(param, true);

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

router.get("/:slug/:chapter", async (req, res, next) => {
	let chapterIndicator = req.params.chapter;
	let slug = req.params.slug;
	
	let chapterMatch = chapterIndicator.match(/(\d+)-(\d+)/);
	if(!chapterMatch) {
		next();
		return;
	}

	let [_null, season, chapter]: number[] = chapterMatch.map(v => Number(v)); // Bit of a hack...
	
	await updateManga(slug, true);

	let data = db.get(`manga_cache.${slug}`).value();
	if(data) {

		// Stuff
		console.log(chapter, season, chapterMatch);
		let manga = await Mangasee.scrape(slug, chapter, season);

		if(!manga.success) {
			next();
			return;
		}

		console.log(manga);

		// Find current, last, and next chapter
		let chapters = manga.data.chapters;
		let nextChapter = chapters.find(c => c.season === season && c.chapter === chapter + 1) ?? chapters.find(c => c.season === season + 1 && (c.chapter === 0 || c.chapter === 1));
		let previousChapter = chapters.find(c => c.season === season && c.chapter === chapter - 1) ?? chapters.find(c => c.season === season - 1 && c.chapter === chapters.filter(ch => ch.season === season - 1).length - 1);
		let currentChapter = chapters.find(c => c.season === season && c.chapter === chapter);

		console.log(nextChapter, previousChapter);

		res.render("manga-chapter", {
			data: manga,
			navigation: {
				nextChapter,
				previousChapter,
				currentChapter
			},
			readerSettings: true
		});
	} else {
		console.log("No data found for", slug);
		next();
	}

});

export default router;