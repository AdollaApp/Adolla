
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";
import Mangasee from "../scrapers/mangasee";
import { Progress, StoredData } from "../types";
import getMangaProgress from "../util/getMangaProgress";
import getReading from "../util/getReading";

router.get("/:slug", async (req, res, next) => {

	let param = req.params.slug;

	let data = await updateManga(param, true);

	if(data && data.success) {

		// See if chapter is same as last chapter
		await setColors(data, param);

		let reading = await getReading(4);

		res.render("manga", {
			data,
			reading,
			currentSlug: param
		});
	} else {
		console.error("No data found for", param);
		next();
	}
});

router.get("/:slug/:chapter", async (req, res, next) => {
	let chapterIndicator = req.params.chapter;
	let slug = req.params.slug;
	
	let chapterMatch = chapterIndicator.match(/(\d*\.?\d+)-(\d*\.?\d+)/);
	if(!chapterMatch) {
		next();
		return;
	}

	let [_null, season, chapter]: number[] = chapterMatch.map(v => Number(v)); // Bit of a hack...

	let data = await updateManga(slug, true);

	if(data && data.success) {

		// Stuff
		let manga = await Mangasee.scrape(slug, chapter, season);

		if(!manga.success) {
			next();
			return;
		}

		// Find current, last, and next chapter
		let chapters = manga.data.chapters;
		let currentChapter = chapters.find(c => c.season === season && c.chapter === chapter);
		let nextChapter = chapters[chapters.indexOf(currentChapter) + 1] ?? null;
		let previousChapter = chapters[chapters.indexOf(currentChapter) - 1] ?? null;

		// Add progress from `data` chapters to `manga` chapters
		for(let i = 0; i < data.data.chapters.length; i++) {
			manga.data.chapters[i].progress = data.data.chapters[i].progress;
		}

		// See if chapter is same as last chapter
		await setColors(manga, slug);

		// Get reading
		let reading = await getReading(4);

		res.render("manga-chapter", {
			data: manga,
			navigation: {
				nextChapter,
				previousChapter,
				currentChapter
			},
			readerSettings: true,
			currentSlug: slug,
			reading
		});
	} else {
		console.error("No data found for", slug);
		next();
	}

});

router.post("/:slug/:chapter/set-progress", async (req, res, next) => {
	let chapterIndicator = req.params.chapter;
	let slug = req.params.slug;
	
	let chapterMatch = chapterIndicator.match(/(\d*\.?\d+)-(\d*\.?\d+)/);
	if(!chapterMatch) {
		next();
		return;
	}

	let [_null, season, chapter]: number[] = chapterMatch.map(v => Number(v)); // Bit of a hack...

	if(!req.body.current || !req.body.total) {
		res.status(403);
		res.json({
			status: 401,
			err: "Missing current or total"
		});
		return;
	}

	let progressData = {
		current: req.body.current,
		total: req.body.total,
		at: Date.now(),
		season,
		chapter
	};
	// Update db
	db.set(`reading.${slug}.${season}-${chapter}`, progressData).write();
	db.set(`reading.${slug}.last`, progressData).write();

	res.send("ok elol");
});

export default router;

async function setColors(data: StoredData, slug: string) {
	let lastChapter: Progress = await getMangaProgress(slug);
	data.data.chapters.forEach(ch => {
		if(ch.progress) ch.progress.percentageColor = (ch.progress && ch.progress.season === lastChapter.season && ch.progress.chapter === lastChapter.chapter) ? "recent" : "neutral";
	});
}