import express from "express";
const router = express.Router();

import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";
import { doSearch } from "../util/doSearch";
import secretConfig from "../util/secretConfig";
import { SearchError } from "../scrapers/types";
import { ScraperResponse } from "../types";
import { getAnnouncements } from "../util/getAnnouncements";
import { doMangadexMigration } from "../util/migrateMangadex";

router.get("/", async (req, res) => {
	// Set host
	const url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	// Ensure MangaDex migration and do so if not done yet
	await doMangadexMigration();

	// Get all data neccesary
	const { popular, reading, lists } = await getData();

	const announcements = await getAnnouncements();

	res.render("home", {
		popular,
		reading,
		lists,
		announcements,
		isHome: true,
		publicVapidKey: db.get("vapidPublic"),
	});
});

router.post("/dismiss-announcement", (req, res) => {
	const dismissedAnnouncements = db.get("other.announcements-dismissed") || [];
	const { id } = req.body;

	if (!dismissedAnnouncements.includes(id)) dismissedAnnouncements.push(id);

	db.set("other.announcements-dismissed", dismissedAnnouncements);

	res.json({
		status: 200,
	});
});

router.get("/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	const data = await getData();
	res.json({ data });
});

async function getData() {
	// Get lists
	let lists = await getLists(true);

	// Get reading
	let reading = await getReading();
	if (db.get("settings.show-completed") === "no") {
		reading = (
			await Promise.all(
				reading.map(async (series) => {
					if (series.success) {
						series.isInProgress = true;
						const lastChapter = await getMangaProgress(
							series.provider,
							series.constant.slug
						);

						const l = series.data.chapters.find(
							(c) =>
								c?.progress?.chapterId === lastChapter.chapterId &&
								c.progress?.percentage > 90
						);
						if (l && !series.data.chapters[series.data.chapters.indexOf(l) + 1])
							series.isInProgress = false;
					}
					return series;
				})
			)
		).filter((v) => {
			return v.success && v.isInProgress;
		});
	}

	// Get popular manga
	const maxReading = Number(
		process.env.MAXREADINGTOSHOWPOPULAR ??
			secretConfig.max_reading_to_show_popular ??
			10
	);

	let popular: ScraperResponse[] | SearchError = [];
	if (reading.length < maxReading) {
		popular = await doSearch("mangasee", "", {
			resultCount: 20,
		}); // Empty search sorts by popular
	}

	// Set progress for popular manga
	if (Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}

	return { lists, reading, popular };
}

export default router;
