import express from "express";
const router = express.Router();

import db from "../db";
import updateManga from "../util/updateManga";
import { Progress, StoredData, List } from "../types";
import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import { getLists } from "../util/lists";
import getProgressData from "../util/getProgressData";
import chalk from "chalk";
import fetch from "node-fetch-extra";
import { Provider, ProviderId } from "../scrapers/types";
import { removeData } from "./lists";
import { getDataFromURL } from "../scrapers";

interface NewList {
	slug: string;
	name: string;
}

const scrapersMapped = {
	mangasee: "Mangasee",
	mangadex: "Mangadex",
	rco: "RCO",
	nhentai: "nhentai",
	manganelo: "Manganelo",
	comicextra: "ComicExtra",
	mangahere: "Mangahere",
	mangadex5: "Mangadex5",
	nhentainet: "nhentainet",
	guya: "Guya",
	gmanga: "Gmanga",
};
const scrapersMappedReversed = Object.fromEntries(
	Object.entries(scrapersMapped).map((v) => v.reverse())
);
export function getProviderName(slug: string): ProviderId | string {
	return scrapersMapped[slug?.toLowerCase()] ?? null;
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
	const param = req.params.slug;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		next();
		return;
	}
	const data = await updateManga(provider, param, true);

	if (data && data.success) {
		const { lists, allLists, mangaProgress } = await handleData(data, param);

		// Render
		res.render("manga", {
			data,
			currentSlug: param,
			lists,
			allLists,
			mangaProgress,
		});
	} else {
		console.error("No data found for", param);
		next();
	}
});

router.get("/:provider/:slug/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");

	const param = req.params.slug;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		res.json({
			status: 404,
			error: "Not a provider",
			data: null,
		});
		return;
	}
	const data = await updateManga(provider, param, true);

	if (data && data.success) {
		const newData = await handleData(data, param);

		// Render
		res.json({
			data: newData,
		});
	}
});

async function handleData(data, param) {
	// Set progress
	await setMangaProgress(data);

	// See if chapter is same as "last read" chapter
	await setColors(data, param);

	// Get lists for manga
	const allLists = await getLists();
	const lists = allLists.filter((l) => l.entries.find((m) => m.slug === param));

	// Convert lists to front-end format
	const convert = (l: List) => ({
		slug: l.slug,
		name: l.name,
	});

	// Get progress for manga total
	const totalChapterCount = data.data.chapters.length;
	const doneChapterCount = data.data.chapters.reduce(
		(acc, current) => acc + (current?.progress?.percentage ?? 0) / 100,
		0
	);

	const mangaProgress = {
		total: totalChapterCount,
		done: Math.round(doneChapterCount),
		percentage: Math.round((doneChapterCount / totalChapterCount) * 100),
	};

	return {
		lists: lists.filter((l) => !l.byCreator).map(convert),
		allLists: allLists.filter((l) => !l.byCreator).map(convert),
		totalChapterCount,
		doneChapterCount,
		mangaProgress,
	};
}

router.get("/:provider/:slug/:chapter", async (req, res, next) => {
	const chapterId = req.params.chapter;
	const slug = req.params.slug;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		next();
		return;
	}

	const data = await updateManga(provider, slug);

	if (data && data.success) {
		// Stuff
		await setMangaProgress(data);

		// Find current, last, and next chapter
		const chapters = data.data.chapters;
		const currentChapter = chapters.find((c) => c.hrefString == chapterId);
		const nextChapter = chapters[chapters.indexOf(currentChapter) + 1] ?? null;
		const previousChapter =
			chapters[chapters.indexOf(currentChapter) - 1] ?? null;

		// See if chapter is same as last chapter
		await setColors(data, slug);

		res.render("manga-chapter", {
			data,
			navigation: {
				nextChapter,
				previousChapter,
				currentChapter,
			},
			isMangaPage: true,
			readerSettings: true,
			currentSlug: slug,
		});
	} else {
		console.error("No data found for", slug);
		next();
	}
});

router.get("/:provider/:slug/:chapter/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");

	const chapterId = req.params.chapter;
	const slug = req.params.slug;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		return res.json({
			status: 404,
			error: "Provider not found",
			data: null,
		});
	}

	const data = await updateManga(provider, slug);

	if (data && data.success) {
		// Stuff
		await setMangaProgress(data);

		// Find current, last, and next chapter
		const chapters = data.data.chapters;
		const currentChapter = chapters.find((c) => c.hrefString == chapterId);
		const nextChapter = chapters[chapters.indexOf(currentChapter) + 1] ?? null;
		const previousChapter =
			chapters[chapters.indexOf(currentChapter) - 1] ?? null;

		// See if chapter is same as last chapter
		await setColors(data, slug);

		res.json({
			data: {
				data,
				navigation: {
					nextChapter,
					previousChapter,
					currentChapter,
				},
				currentSlug: slug,
			},
		});
	} else {
		return res.json({
			status: 404,
			error: "Manga not found",
			data: null,
		});
	}
});

const imageRouter = async (req, res, next) => {
	const chapterId = req.params.chapter;
	const slug = req.params.slug;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		next();
		return;
	}

	try {
		const data = await updateManga(provider, slug, true, chapterId);
		if (data && data.success) {
			// Return images
			res.json(data.data.chapterImages);
		} else if (data.success === false) {
			// Something went wrong for some reason
			res.status(404);
			res.json({
				status: 404,
				err: data.err,
			});
		}
	} catch (err) {
		// Something went wrong for some reason
		console.error(err);
		console.error("Throwing get-images error for", provider, slug);
		res.status(404);
		res.json({
			status: 404,
			err,
		});
	}
};

router.get("/:provider/:slug/:chapter/get-images/json", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

router.get("/:provider/:slug/:chapter/get-images", imageRouter);
router.get("/:provider/:slug/:chapter/get-images/json", imageRouter);

/**
 * Proxy pages
 */
router.get("/proxy-image", (req, res) => {
	const url = decodeURIComponent(req.query.url.toString());

	if (process.env.IMAGE_PROXY_URL)
		return res.redirect(`${process.env.IMAGE_PROXY_URL}${url}`);

	res.setHeader(
		"content-type",
		`image/${url.includes(".png") ? "png" : "jpg"}` // Oh well
	);

	let headers: { [key: string]: string } = {};
	if (req.query.referer === "mangasee") {
		headers.referer = "https://mangasee123.com";
	} else if (req.query.referer === "manganelo") {
		headers.referer = "https://readmanganato.com/";
	} else if (req.query.referer === "mangahere") {
		headers.referer = "https://www.mangahere.cc/";
	}
	headers["user-agent"] = "Adolla";

	fetch(url, {
		headers,
	})
		.then(async (response) => {
			response.body.pipe(res);
		})
		.catch((err) => {
			res.status(500);
			res.json({
				status: 500,
				err,
			});
		});
});

router.get("/mangadex-cover/:slug/:id", async (req, res) => {
	const posterId = decodeURIComponent(req.params.id.toString());
	const slug = decodeURIComponent(req.params.slug.toString());

	let url = "https://i.imgur.com/6TrIues.jpg";

	const posterData = await getDataFromURL(
		`https://api.mangadex.org/cover?ids[]=${posterId}`
	);
	const posterEntry = posterData?.results?.[0]?.data;

	if (posterEntry) {
		url = `https://uploads.mangadex.org/covers/${slug}/${posterEntry.attributes.fileName}.512.jpg`;
	}

	res.redirect(url);
});

// Mark as read
router.post("/:provider/:slug/mark-chapters-as/", async (req, res, next) => {
	// Get relevant values
	const slug = req.params.slug;
	const updateValues: (string | number)[] = req.body.values;

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		next();
		return;
	}

	// Get data
	const data = await updateManga(provider, slug);

	if (data.success === true) {
		// Get relevant chapters
		const chapters = data.data.chapters;
		const markChapters = updateValues.map((markingChapter) =>
			chapters.find((c) => c.hrefString === markingChapter)
		);

		let lastProgressData: Progress | null = null;
		for (const chapter of markChapters) {
			// Generate query string, this will be used twice
			const queryString = `reading_new.${getProviderId(
				data.provider
			)}.${slug}.${chapter.hrefString.replace(/\./g, "_")}`;

			// Get existing data
			const existingData = db.get(queryString);

			if (
				!existingData ||
				(existingData && existingData.percentage !== 100) ||
				req.body.action === "remove-read-status"
			) {
				// Check if existing data doesn't already have 100%. We don't want to override existing data

				let progressData = getProgressData({
					current: 500,
					total: 500,
					chapterId: chapter.hrefString,
				}); // 500 is just a really high number. It has no meaning.

				// If the action is to remove the read status, override progressData
				if (req.body.action === "remove-read-status") {
					progressData = undefined;
				} else {
					// Update last
					lastProgressData = progressData;
				}

				// Update db
				db.set(queryString, progressData);
			}

			const progressDataNew = db.get(queryString);
			if (queryString) lastProgressData = progressDataNew;
		}

		// Set last progress data if it's not found
		const lastReadChapter = db.get(
			`reading_new.${getProviderId(data.provider)}.${slug}.last`
		);
		if (lastReadChapter) {
			const lastReadChapterInRead = db.get(
				`reading_new.${getProviderId(data.provider)}.${slug}.${
					lastReadChapter.chapterId
				}`
			);

			// The "last" chapter's read data was removed
			if (!lastReadChapterInRead) {
				let allReading: Progress[] = Object.values(
					db.get(`reading_new.${getProviderId(data.provider)}.${slug}`)
				);
				allReading = allReading.sort((a, b) => b.at - a.at);

				const newLast = allReading.find(
					(item) => item && item.chapterId !== lastReadChapter.chapterId
				);

				db.set(
					`reading_new.${getProviderId(data.provider)}.${slug}.last`,
					newLast
				);
			}
		}

		// Set last progress data
		if (lastProgressData)
			db.set(
				`reading_new.${getProviderId(data.provider)}.${slug}.last`,
				lastProgressData
			);

		// ! Remove `reading` object if nothing is left

		// Get data
		const readingData = db.get(
			`reading_new.${getProviderId(data.provider)}.${slug}`
		);

		// Get keys with proper values
		const remainingData = Object.entries(readingData)
			.filter((v) => v[1])
			.map((v) => v[0]);

		// If the only entry is "last" (and not "1-1" or whatever), remove it
		if (
			(remainingData[0] === "last" && remainingData.length <= 1) ||
			remainingData.length <= 0
		) {
			// Remove entry
			db.set(`reading_new.${getProviderId(data.provider)}.${slug}`, undefined);
			console.info(
				chalk.green("[DB]") +
					` Removing ${data.provider}'s ${slug} from reading`
			);
		}

		res.json({
			status: 200,
		});
		return;
	}

	res.status(404);
	res.json({
		status: 404,
		err: "Something went wrong while fetching information about this manga",
	});
});

// Set the lists
router.post("/:provider/:slug/set-lists", async (req, res, next) => {
	const newLists: NewList[] = req.body.lists;

	let currentLists: List[] = await getLists();

	const provider = getProviderName(req.params.provider.toLowerCase());
	if (!provider) {
		next();
		return;
	}

	console.info(
		chalk.yellowBright("[LISTS]") +
			` Setting lists for ${
				req.params.slug
			} (${provider}) at ${new Date().toLocaleString(
				"it"
			)}. New lists: ${newLists.map((v) => v.slug).join(", ")}`
	);

	for (const n of newLists) {
		// Verify the list we're adding to exists
		if (!currentLists.find((l) => l.slug === n.slug)) {
			// Add new list
			currentLists.push({
				slug: n.slug,
				name: n.name,
				entries: [],
				showOnHome: false,
			});
		}

		// Add to list
		const list = currentLists.find((l) => l.slug === n.slug);
		if (
			!list.entries.find((entry) => entry.slug === req.params.slug) &&
			!list.byCreator
		) {
			list.entries.push({
				slug: req.params.slug,
				provider: getProviderId(provider),
			});
			list.last = Date.now();
			console.info(
				chalk.green("[LISTS]") +
					` Adding ${req.params.slug} (${provider}) to ${list.name} (${
						list.slug
					}) at ${new Date().toLocaleString("it")}`
			);
		}
	}

	// The body sends an array of all the lsits the manga should be in
	// Find ALL LISTS not mentioned in said array, and remove the series from that
	const otherLists = currentLists.filter(
		(l) => !newLists.find((newList) => newList.slug === l.slug) && !l.byCreator
	);
	for (const deleteFrom of otherLists) {
		// Remove every entry from this list since it wasn't mentioned in the updated list
		let isChanged = false;
		deleteFrom.entries = deleteFrom.entries.filter((l) => {
			const isRemoveableEntry = l.slug === req.params.slug;
			if (isRemoveableEntry) {
				// When it's the same slug, that means it's getting removed
				isChanged = true;
				console.info(
					chalk.red("[LISTS]") +
						` Removing ${req.params.slug} (${provider}) from ${
							deleteFrom.name
						} (${deleteFrom.slug}) at ${new Date().toLocaleString("it")}`
				);
				return false;
			}
			return true;
		});
		if (isChanged) deleteFrom.last = Date.now();
	}

	// Remove empty lists
	currentLists = currentLists.filter((list) => list.entries.length > 0);

	// Sort lists
	currentLists = currentLists.sort((a, b) => (b.last ?? -1) - (a.last ?? -1));

	// Store new value
	db.set("lists", currentLists.filter((l) => !l.byCreator).map(removeData));

	res.json({
		status: 200,
	});
});

router.post("/:provider/:slug/hide-series", async (req, res) => {
	db.set(
		`hide_read.${getProviderId(req.params.provider)}.${req.params.slug}`,
		true
	);

	res.json({
		status: 200,
	});
});

router.post(
	"/:provider/:slug/:chapter/set-progress",
	async (req, res, next) => {
		const chapterId = req.params.chapter;
		const slug = req.params.slug;

		if (!req.body.current || !req.body.total) {
			res.status(403);
			res.json({
				status: 401,
				err: "Missing current or total",
			});
			return;
		}

		const provider = getProviderName(req.params.provider.toLowerCase());
		if (!provider) {
			next();
			return;
		}

		const progressData = getProgressData({
			...req.body,
			chapterId,
		});

		// Get manga data to see if it's hentai or not
		const data = await updateManga(provider, req.params.slug);
		if (data.success) {
			const storeNsfw = db.get("settings.store-nsfw") === "yes";
			if (
				((storeNsfw && data.constant.nsfw) || !data.constant.nsfw) &&
				!process.env.IGNOREREADING
			) {
				// Update db
				db.set(`hide_read.${getProviderId(provider)}.${slug}`, false);
				db.set(
					`reading_new.${getProviderId(
						provider
					)}.${slug}.${chapterId.toString().replace(/\./g, "_")}`,
					progressData
				);
				db.set(
					`reading_new.${getProviderId(provider)}.${slug}.last`,
					progressData
				);
			}
		}

		res.json({
			status: 200,
		});
	}
);

export default router;

async function setColors(data: StoredData, slug: string) {
	const lastChapter = await getMangaProgress(data.provider, slug);
	data.data.chapters.forEach((ch) => {
		if (ch.progress)
			ch.progress.percentageColor =
				ch.progress && ch.progress?.chapterId === lastChapter?.chapterId
					? "recent"
					: "neutral";
	});
}
