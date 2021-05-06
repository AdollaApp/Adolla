import chalk from "chalk";
import fetch from "node-fetch-extra";
import db from "../db";
import fs from "fs";

export async function doMangadexMigration() {
	console.log(1);
	const reading = db.get("reading_new");

	console.log(Object.keys(reading));

	// The soon-to-be new reading object
	const mangadex5 = {};

	try {
		if (reading.mangadex) {
			const md = reading.mangadex;
			const mdSeriesIds = Object.keys(md).map((n) => Number(n));
			console.log(mdSeriesIds);

			// Get new IDs
			const newIds = await fetch("https://api.mangadex.org/legacy/mapping", {
				method: "POST",
				body: JSON.stringify({
					type: "manga",
					ids: mdSeriesIds,
				}),
			}).then((d) => d.json());

			const mappedIds = {};

			for (let newIdObj of newIds) {
				if (newIdObj.result === "ok") {
					// Get legacy chapter IDs

					mappedIds[newIdObj.data.attributes.legacyId] = newIdObj.data.id;
					const legacyChapterIds = Object.keys(
						reading.mangadex[newIdObj.data.attributes.legacyId]
					)
						.map(Number)
						.filter(Boolean);

					let newChapterIds = await fetch(
						"https://api.mangadex.org/legacy/mapping",
						{
							method: "POST",
							body: JSON.stringify({
								type: "chapter",
								ids: legacyChapterIds,
							}),
						}
					).then((d) => d.text());

					if (!newChapterIds.startsWith("<")) {
						// HTML... Yay....
						newChapterIds = JSON.parse(newChapterIds);
					} else {
						console.log(newChapterIds);
						newChapterIds = await fetch(
							"https://api.mangadex.org/legacy/mapping",
							{
								method: "POST",
								body: JSON.stringify({
									type: "chapter",
									ids: legacyChapterIds,
								}),
							}
						).then((d) => d.json());
					}

					const seriesId = newIdObj.data.id;
					const oldSeriesId = newIdObj.data.attributes.legacyId;
					mangadex5[seriesId] = {}; // Prepare series object
					const chapterIds = {};

					// We have received the updated IDs for chapters
					// Now reassign the old data
					for (let newChapterData of newChapterIds) {
						if (newChapterData.result === "ok") {
							const chapterId = newChapterData.data.id;
							const oldChapterId = newChapterData.data.attributes.legacyId;

							console.info(
								chalk.green("[MANGADEX]") +
									` Migrating chapter ${oldChapterId} -> ${chapterId}`
							);

							chapterIds[oldChapterId] = chapterId;

							mangadex5[seriesId][chapterId] =
								reading.mangadex[oldSeriesId][oldChapterId];
							mangadex5[seriesId][chapterId].chapterId = chapterId;
						}
					}

					mangadex5[seriesId].last = reading.mangadex[oldSeriesId].last;
					mangadex5[seriesId].last.chapterId =
						chapterIds[reading.mangadex[oldSeriesId].last.chapterId];

					// console.log(123, legacyChapterIds, newChapterIds);
					// console.log("—".repeat(200));
					await sleep(500);
				}
			}

			// console.log(mangadex5);
			// fs.writeFileSync("md5.json", JSON.stringify(mangadex5, null, "\t"));
			db.set("reading_new.mangadex5", mangadex5);
			// console.log(convertChapters);
		}
	} catch (e) {
		console.error(e);
		// ¯\_(ツ)_/¯
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
