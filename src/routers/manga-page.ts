
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";
import Mangasee from "../scrapers/mangasee";
import { Progress, StoredData, List } from "../types";
import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import { getLists } from "../util/lists";
import getProgressData from "../util/getProgressData";

interface NewList {
	slug: string;
	name: string;
}

router.get("/:slug", async (req, res, next) => {

	let param = req.params.slug;

	let data = await updateManga(param, true);

	if(data && data.success) {

		// See if chapter is same as "last read" chapter
		await setColors(data, param);

		// Set progress
		await setMangaProgress(data);

		// Get reading
		let reading = await getReading(4);

		// Get lists for manga
		let allLists = await getLists();
		let lists = allLists.filter(l => l.entries.find(m => m.slug === param));

		const convert = ((l: List) => ({
			slug: l.slug,
			name: l.name
		}));

		res.render("manga", {
			data,
			reading,
			currentSlug: param,
			lists: lists.filter(l => !l.byCreator).map(convert),
			allLists: allLists.filter(l => !l.byCreator).map(convert)
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
		manga = await setMangaProgress(manga);

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

// Mark as read
router.post("/:slug/mark-chapters-as/", async (req, res) => {

	// Get relevant values
	let slug = req.params.slug;
	let updateValues: {season: number, chapter: number}[] = req.body.values;

	// Get data
	let data = await updateManga(slug);

	if(data.success === true) { 

		// Get relevant chapters
		let chapters = data.data.chapters;
		let markChapters = updateValues.map(markingChapter => chapters.find(c => c.season === markingChapter.season && c.chapter === markingChapter.chapter));

		let lastProgressData;
		for(let chapter of markChapters) {

			// Generate query string, this will be used twice
			let queryString = `reading.${slug}.${chapter.season}-${chapter.chapter.toString().replace(/\./g, "_")}`;
			
			// Get existing data
			let existingData = db.get(queryString);
			
			if(!existingData || (existingData && existingData.percentage !== 100) || req.body.action === "remove-read-status") { // Check if existing data doesn't already have 100%. We don't want to override existing data
				
				let progressData = getProgressData({
					current: 500,
					total: 500,
					season: chapter.season,
					chapter: chapter.chapter
				}); // 500 is just a really high number. It has no meaning.
				
				// If the action is to remove the read status, override progressData
				if(req.body.action === "remove-read-status") progressData = undefined;
	
				// Update last
				lastProgressData = progressData;
	
				// Update db
				db.set(queryString, progressData);
			}

		}

		// Set last progress data
		if(lastProgressData) db.set(`reading.${slug}.last`, lastProgressData);

		// Remove `reading object if nothing is left`
		
		  // Get data
		let readingData = db.get(`reading.${slug}`);
		
		  // Get keys with proper values
		let remainingData = Object.entries(readingData).filter(v => v[1]).map(v => v[0]);
		 
		  // If the only entry is "last" (and not "1-1" or whatever), remove it
		if(remainingData[0] === "last" && remainingData.length <= 1) {
			db.set(`reading.${slug}`, undefined)
		}

		res.json({
			status: 200
		});

	} else {
		res.status(404);
		res.json({
			status: 404,
			err: "Something went wrong while fetching information about this manga"
		});
	}

});

// Set the lists
router.post("/:slug/set-lists", async (req, res) => {

	let newLists: NewList[] = req.body.lists;

	let currentLists: List[] = await getLists();

	for(let n of newLists) {
		// Verify existing list
		if(!currentLists.find(l => l.slug === n.slug)) {
			// Add new list
			currentLists.push({
				slug: n.slug,
				name: n.name,
				entries: [],
				showOnHome: false
			});
		}

		// Add to list
		let list = currentLists.find(l => l.slug === n.slug);
		if(!list.entries.find(entry => entry.slug === req.params.slug) && !list.byCreator) {
			list.entries.push({
				slug: req.params.slug
			});
			list.last = Date.now();
		}

	}

	// Remove from other list
	let otherLists = currentLists.filter(l => !newLists.find(newList => newList.slug === l.slug) && !l.byCreator);
	for(let deleteFrom of otherLists) {
		// Remove every entry from this list since it wasn't mentioned in the updated list
		while(deleteFrom.entries.find(v => v.slug === req.params.slug)) {
			deleteFrom.entries.splice(deleteFrom.entries.indexOf(deleteFrom.entries.find(v => v.slug === req.params.slug)), 1);
			deleteFrom.last = Date.now();
		}
	}

	// Remove empty lists
	currentLists = currentLists.filter(list => list.entries.length > 0);

	// Sort lists
	currentLists = currentLists.sort((a, b) => (b.last ?? -1) - (a.last ?? -1));
	
	// Store new value
	db.set("lists", currentLists.filter(l => !l.byCreator));

	res.json({
		status: 200
	});
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

	let progressData = getProgressData({
		...req.body,
		season,
		chapter
	});

	// Update db
	db.set(`reading.${slug}.${season}-${chapter.toString().replace(/\./g, "_")}`, progressData);
	db.set(`reading.${slug}.last`, progressData);

	res.json({
		status: 200
	});
});

export default router;

async function setColors(data: StoredData, slug: string) {
	let lastChapter: Progress = await getMangaProgress(slug);
	data.data.chapters.forEach(ch => {
		if(ch.progress) ch.progress.percentageColor = (ch.progress && ch.progress.season === lastChapter.season && ch.progress.chapter === lastChapter.chapter) ? "recent" : "neutral";
	});
}