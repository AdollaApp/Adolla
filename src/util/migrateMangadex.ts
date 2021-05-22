import chalk from "chalk";
import fetch from "node-fetch-extra";
import db from "../db";

export async function doMangadexMigration() {
	const reading = db.get("reading_new");

	// The soon-to-be new reading object
	const mangadex5 = db.get("reading_new.mangadex5") ?? {};

	try {
		if (reading.mangadex) {
			const md = reading.mangadex;
			const mdSeriesIds = Object.keys(md).map((n) => Number(n));

			console.info(
				chalk.green("[MANGADEX]") + ` Migrating series:`,
				mdSeriesIds
			);

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

					const seriesId = newIdObj.data.attributes.newId;
					const oldSeriesId = newIdObj.data.attributes.legacyId;

					console.info(
						chalk.green("[MANGADEX]") +
							` Migrating manga series ${oldSeriesId} -> ${seriesId}`
					);

					mangadex5[seriesId] = {}; // Prepare series object
					const chapterIds = {};

					// We have received the updated IDs for chapters
					// Now reassign the old data
					for (let newChapterData of newChapterIds) {
						if (newChapterData.result === "ok") {
							const chapterId = newChapterData.data.attributes.newId;
							const oldChapterId = newChapterData.data.attributes.legacyId;

							// console.info(
							// 	chalk.green("[MANGADEX]") +
							// 		` Migrating chapter ${oldChapterId} -> ${chapterId}`
							// );

							chapterIds[oldChapterId] = chapterId;

							mangadex5[seriesId][chapterId] =
								reading.mangadex[oldSeriesId][oldChapterId];
							mangadex5[seriesId][chapterId].chapterId = chapterId;
						}
					}

					// Update last to fit with new IDs
					mangadex5[seriesId].last = reading.mangadex[oldSeriesId].last;
					mangadex5[seriesId].last.chapterId =
						chapterIds[reading.mangadex[oldSeriesId].last.chapterId] ||
						reading.mangadex[oldSeriesId].last.chapterId;

					console.info(
						chalk.green("[MANGADEX]") +
							` Series (${oldSeriesId} -> ${seriesId}) "last": from ${reading.mangadex[oldSeriesId].last.chapterId} -> ${mangadex5[seriesId].last.chapterId}.`
					);

					await sleep(500);
				}
			}

			// Store new mangadex object
			db.set("reading_new.mangadex5", mangadex5);

			// Now store the old one in a place it will never hurt anyone ever again
			const legacyMd = db.get("reading_new.mangadex");
			db.set("other.legacy-md", legacyMd);
			db.set("reading_new.mangadex", undefined);
		}
	} catch (e) {
		console.error(chalk.red("[MANGADEX]"), e);
		// ¯\_(ツ)_/¯
	}
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
