
import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";
import { Progress, StoredData, List, Reading } from "../types";
import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import { getLists } from "../util/lists";
import getProgressData from "../util/getProgressData";
import chalk from "chalk";
import { Provider, ProviderId } from "../scrapers/types";

interface NewList {
	slug: string;
	name: string;
}

let scrapersMapped = {
	"mangasee": "Mangasee",
	"mangadex": "Mangadex",
	"rco": "RCO"
};
let scrapersMappedReversed = Object.fromEntries(Object.entries(scrapersMapped).map(v => v.reverse()));
export function getProviderName(slug: string): ProviderId | string {
	return scrapersMapped[slug.toLowerCase()] ?? null;
}
export function isProviderName(slug: string): slug is Provider {
	return !!scrapersMappedReversed[slug];
}
export function getProviderId(slug: string): Provider | string {
	return scrapersMappedReversed[slug] ?? slug;
}
export function isProviderId(slug: string): slug is ProviderId {
	return !!scrapersMapped[slug];
}

router.get("/:provider/:slug", async (req, res, next) => {

	let param = req.params.slug;

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}
	let data = await updateManga(provider, param, true);

	if(data && data.success) {

		// Set progress
		await setMangaProgress(data);

		// See if chapter is same as "last read" chapter
		await setColors(data, param);

		// Get reading
		let reading = await getReading(4);

		// Get lists for manga
		let allLists = await getLists();
		let lists = allLists.filter(l => l.entries.find(m => m.slug === param));

		  // Convert lists to front-end format
		const convert = ((l: List) => ({
			slug: l.slug,
			name: l.name
		}));

		// Get progress for manga total
		let totalChapterCount = data.data.chapters.length;
		let doneChapterCount = data.data.chapters.reduce((acc, current) => acc + ((current?.progress?.percentage ?? 0) / 100), 0);

		
		// Render
		res.render("manga", {
			data,
			reading,
			currentSlug: param,
			lists: lists.filter(l => !l.byCreator).map(convert),
			allLists: allLists.filter(l => !l.byCreator).map(convert),
			mangaProgress: {
				total: totalChapterCount,
				done: Math.round(doneChapterCount),
				percentage: Math.round((doneChapterCount / totalChapterCount) * 100)
			}
		});

	} else {
		console.error("No data found for", param);
		next();
	}
});

router.get("/:provider/:slug/:chapter", async (req, res, next) => {
	let chapterId = req.params.chapter;
	let slug = req.params.slug;

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}

	let data = await updateManga(provider, slug);

	if(data && data.success) {

		// Stuff
		let manga = await setMangaProgress(data);

		if(!manga.success) {
			next();
			return;
		}

		// Find current, last, and next chapter
		let chapters = manga.data.chapters;
		let currentChapter = chapters.find(c => c.hrefString == chapterId);
		let nextChapter = chapters[chapters.indexOf(currentChapter) + 1] ?? null;
		let previousChapter = chapters[chapters.indexOf(currentChapter) - 1] ?? null;

		// Add progress from `data` chapters to `manga` chapters
		for(let i = 0; i < data.data.chapters.length; i++) {
			manga.data.chapters[i].progress = data.data.chapters[i].progress;
		}

		// § reading
		let reading = await getReading(4);

		// See if chapter is same as last chapter
		await setColors(manga, slug);

		res.render("manga-chapter", {
			data: manga,
			navigation: {
				nextChapter,
				previousChapter,
				currentChapter
			},
			isMangaPage: true,
			readerSettings: true,
			currentSlug: slug,
			reading
		});
	} else {
		console.error("No data found for", slug);
		next();
	}

});

router.get("/:provider/:slug/:chapter/get-images", async (req, res, next) => {
	let chapterId = req.params.chapter;
	let slug = req.params.slug;

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}

	let data = await updateManga(provider, slug, true, chapterId);
	if(data && data.success) {
		// Return images
		res.json(data.data.chapterImages);
	} else if(data.success === false) {

		// Something went wrong for some reason
		res.status(404);
		res.json({
			status: 404,
			err: data.err
		});

	}
});


// Mark as read
router.post("/:provider/:slug/mark-chapters-as/", async (req, res, next) => {

	// Get relevant values
	let slug = req.params.slug;
	let updateValues: (string | number)[] = req.body.values;

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}

	// Get data
	let data = await updateManga(provider, slug);

	if(data.success === true) { 

		// Get relevant chapters
		let chapters = data.data.chapters;
		let markChapters = updateValues.map(markingChapter => chapters.find(c => c.hrefString === markingChapter));

		let lastProgressData: Progress | null = null;
		for(let chapter of markChapters) {

			// Generate query string, this will be used twice
			let queryString = `reading_new.${getProviderId(data.provider)}.${slug}.${chapter.hrefString.replace(/\./g, "_")}`;
			
			// Get existing data
			let existingData = db.get(queryString);
			
			if(!existingData || (existingData && existingData.percentage !== 100) || req.body.action === "remove-read-status") { // Check if existing data doesn't already have 100%. We don't want to override existing data
				
				let progressData = getProgressData({
					current: 500,
					total: 500,
					chapterId: chapter.hrefString
				}); // 500 is just a really high number. It has no meaning.
				
				// If the action is to remove the read status, override progressData
				if(req.body.action === "remove-read-status") {
					progressData = undefined;
				} else {
					// Update last
					lastProgressData = progressData;
				}
	
				// Update db
				db.set(queryString, progressData);
			}

			let progressDataNew = db.get(queryString);
			if(queryString) lastProgressData = progressDataNew;

		}

		// Set last progress data if it's not found
		let lastReadChapter = db.get(`reading_new.${getProviderId(data.provider)}.${slug}.last`);
		let lastReadChapterInRead = db.get(`reading_new.${getProviderId(data.provider)}.${slug}.${lastReadChapter.chapterId}`);

		  // The "last" chapter's read data was removed
		if(!lastReadChapterInRead) {
			let allReading: Progress[] = Object.values(db.get(`reading_new.${getProviderId(data.provider)}.${slug}`));
			allReading = allReading.sort((a, b) => b.at - a.at);
			
			let newLast = allReading.find(item => item.chapterId !== lastReadChapter.chapterId);
			
			db.set(`reading_new.${getProviderId(data.provider)}.${slug}.last`, newLast);
		}

		// Set last progress data
		if(lastProgressData) db.set(`reading_new.${getProviderId(data.provider)}.${slug}.last`, lastProgressData);

		// Remove `reading` object if nothing is left
		
		  // Get data
		let readingData = db.get(`reading_new.${getProviderId(data.provider)}.${slug}`);
		
		  // Get keys with proper values
		let remainingData = Object.entries(readingData).filter(v => v[1]).map(v => v[0]);
		 
		  // If the only entry is "last" (and not "1-1" or whatever), remove it
		if((remainingData[0] === "last" && remainingData.length <= 1) || remainingData.length <= 0) {
			// Remove entry
			db.set(`reading_new.${getProviderId(data.provider)}.${slug}`, undefined);
			console.info(chalk.green("[DB]") + ` Removing ${data.provider}'s ${slug} from reading`);
		}

		res.json({
			status: 200
		});
		return;

	}
	
	res.status(404);
	res.json({
		status: 404,
		err: "Something went wrong while fetching information about this manga"
	});

});

// Set the lists
router.post("/:provider/:slug/set-lists", async (req, res, next) => {

	let newLists: NewList[] = req.body.lists;

	let currentLists: List[] = await getLists();

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}

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
				slug: req.params.slug,
				provider: getProviderId(provider)
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

router.post("/:provider/:slug/hide-series", async (req, res) => {

	db.set(`hide_read.${getProviderId(req.params.provider)}.${req.params.slug}`, true);

	res.json({
		status: 200
	});
});

router.post("/:provider/:slug/:chapter/set-progress", async (req, res, next) => {
	let chapterId = req.params.chapter;
	let slug = req.params.slug;

	if(!req.body.current || !req.body.total) {
		res.status(403);
		res.json({
			status: 401,
			err: "Missing current or total"
		});
		return;
	}

	let provider = getProviderName(req.params.provider.toLowerCase());
	if(!provider) {
		next();
		return;
	}

	let progressData = getProgressData({
		...req.body,
		chapterId
	});

	// Update db
	db.set(`hide_read.${getProviderId(provider)}.${slug}`, false);
	db.set(`reading_new.${getProviderId(provider)}.${slug}.${chapterId.toString().replace(/\./g, "_")}`, progressData);
	db.set(`reading_new.${getProviderId(provider)}.${slug}.last`, progressData);

	res.json({
		status: 200
	});
});

export default router;

async function setColors(data: StoredData, slug: string) {
	let lastChapter = await getMangaProgress(data.provider, slug);
	data.data.chapters.forEach(ch => {
		if(ch.progress) ch.progress.percentageColor = (ch.progress && ch.progress?.chapterId === lastChapter.chapterId) ? "recent" : "neutral";
	});
}
