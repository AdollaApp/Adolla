import chalk from "chalk";
import fetch from "node-fetch-extra";

import cfg from "../config.json";
import updateManga from "./updateManga";
import * as scrapers from "../scrapers";
import db from "../db";
import getReading from "./getReading";
import Bot from "./bot";
import cache from "../util/cache";
import secretConfig from "../util/secretConfig";

import { Progress } from "../types";
import { getProviderId } from "../routers/manga-page";

class Updater {
	start() {
		this.updateCache();
		setInterval(() => {
			this.updateCache();
		}, cfg.cache.duration);
	}

	private async updateCache() {
		/**
		 * UPDATE "POPULAR" CACHE
		 */
		console.info(
			chalk.yellowBright("[CACHE]") +
				` Updating popular cache at ${new Date().toLocaleString()}`
		);
		const popular = await scrapers.Mangasee.search("");

		await Promise.all(
			popular
				.map((obj) => (obj.success ? obj : null))
				.filter(Boolean)
				.map(async (obj) => {
					// Update manga and store new value in cache
					await updateManga(
						obj.provider ?? "mangasee",
						obj.constant.slug,
						true
					);
				})
		);

		console.info(chalk.green("[CACHE]") + " Updated cache for popular manga");

		/**
		 * UPDATE "READING" CACHE
		 */
		console.info(
			chalk.yellowBright("[NOTIFS]") +
				` Looking for new chapters at ${new Date().toLocaleString()}`
		);
		const reading = await getReading();

		await Promise.all(
			reading
				.map((obj) => (obj.success ? obj : null))
				.filter(Boolean)
				.map(async (obj) => {
					// Update manga and store new value in cache + variable

					const data = await updateManga(obj.provider, obj.constant.slug, true);

					// Check for new chapters and notify user
					if (data.success) {
						// Now get a potential next chapter
						let chapters = data.data.chapters;

						// Add "combined" value for sorting
						chapters.forEach((ch) => {
							ch.combined = ch.season * 1e3 + ch.chapter;
						});

						// Sort chapters on location
						chapters = chapters.sort((a, b) => a.combined - b.combined);

						// Get reading
						const dbString = `reading_new.${getProviderId(data.provider)}.${
							data.constant.slug
						}.last`;
						const reading: Progress = db.get(dbString);
						if (!reading) return null;
						const currentChapter = chapters.find(
							(c) => c.hrefString === reading.chapterId
						);

						const nextChapter = chapters[chapters.indexOf(currentChapter) + 1];

						if (nextChapter) {
							// There is a next chapter!

							// Compare chapter release dates
							const chapterReleaseDate = new Date(nextChapter.date).getTime();
							if (chapterReleaseDate > reading.at) {
								// A new chapter is out!

								// Check if user hasn't been notified already
								const dbString = `notified.${
									data.constant.slug
								}.${nextChapter.season
									.toString()
									.replace(
										/\./g,
										"_"
									)}-${nextChapter.chapter.toString().replace(/\./g, "_")}`;
								const hasNotified = db.get(dbString);

								if (hasNotified) {
									console.info(
										chalk.red("[NOTIFS]") +
											` New chapter was found for ${data.constant.title}, user has already been notified`
									);
									return;
								}

								// Generate message
								const host = db.get("other.host");
								const msg = `New chapter for **${data.constant.title}**!`;
								const url = `${host.replace("localhost", "127.0.0.1")}${
									data.provider
								}/${data.constant.slug}/${nextChapter.season}-${
									nextChapter.chapter
								}`;
								const urlMsg = host ? `Check it out at ${url}/` : "";
								const msgFull = `${msg}\n${urlMsg}`;

								// Get bot account
								let doSet = false;
								const bot = Bot.get();
								if (bot) {
									// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
									console.info(
										chalk.green("[NOTIFS]") +
											` New chapter found for ${data.constant.title}, notifying user with Telegram bot`
									);

									Bot.send(msgFull);
									doSet = true;
								} else {
									// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
									console.info(
										chalk.red("[NOTIFS]") +
											` New chapter found for ${data.constant.title} but Telegram Bot is not configured`
									);
								}

								// Discord webhook
								if (secretConfig.discord_webhook) {
									console.info(
										chalk.green("[NOTIFS]") +
											` New chapter found for ${data.constant.title}, notifying user over Discord Webhook`
									);
									const webhookNotif = await fetch(
										secretConfig.discord_webhook,
										{
											method: "POST",
											headers: {
												"content-type": "application/json",
											},
											body: JSON.stringify({
												avatar_url:
													"https://raw.githubusercontent.com/JipFr/Adolla/dev/public/icons/white-on-blue.png",
												username: "Adolla",
												embeds: [
													{
														title: `${msg} (${nextChapter.label})`,
														description: "Click title to open the chapter",
														url,
														color: 4959182,
														author: {
															name: "Adolla",
															url: "https://jipfr.nl/adolla",
															icon_url:
																"https://raw.githubusercontent.com/JipFr/Adolla/dev/public/icons/white-on-blue.png",
														},
													},
												],
											}),
										}
									);
									console.info(
										chalk.green("[NOTIFS]") +
											` New chapter found for ${data.constant.title}, attempted to notify user over Discord Webhook. HTTP status ${webhookNotif.status}`
									);
									doSet = true;
								} else {
									console.info(
										chalk.red("[NOTIFS]") +
											` New chapter found for ${data.constant.title} but Discord webhook is not configured`
									);
								}

								if (doSet) db.set(dbString, true);
							}
						}
					}
				})
		);

		console.info(
			chalk.green("[NOTIFS]") + " Checked for new chapters, now done"
		);

		/**
		 * Remove old items from cache
		 */

		// Get data

		console.info(
			chalk.yellowBright("[CLEANUP]") +
				" Checking each cache entry for old data"
		);

		// Check each entry and
		for (const provider of Object.keys(cache)) {
			for (const slug of Object.keys(cache[provider])) {
				// Get difference from saved time in MS
				const diff = Date.now() - (cache[provider]?.[slug]?.savedAt ?? 9e9);

				// Check if cache is old. How old should be fairly obvious
				if (diff > 1e3 * 60 * 60 * 24) {
					cache[provider][slug] = undefined;
					console.info(
						chalk.green("[CLEANUP]") +
							` Deleting cache for ${slug} since it's ${Math.floor(
								diff / (60 * 1e3)
							)} minutes old`
					);
				}
			}
		}

		// Write to db
		console.info(chalk.green("[CLEANUP]") + " Done cleaning up");
	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;
