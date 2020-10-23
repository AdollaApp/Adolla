
import chalk from "chalk";

import cfg from "../config.json";
import updateManga from "./updateManga";
import * as scrapers from "../scrapers";
import db from "../db";
import getReading from "./getReading";
import Bot from "./bot";
import cache from "../util/cache";

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
		console.info(chalk.yellowBright("[CACHE]") + ` Updating popular cache at ${new Date().toLocaleString()}`);
		let popular = await scrapers.Mangasee.search("");
		
		await Promise.all(popular.map(obj => obj.success ? obj : null).filter(Boolean).map(async obj => {
			// Update manga and store new value in cache
			await updateManga(obj.provider ?? "mangasee", obj.constant.slug, true);
		}));

		console.info(chalk.green("[CACHE]") + " Updated cache for popular manga");


		/**
		 * UPDATE "READING" CACHE
		 */
		console.info(chalk.yellowBright("[NOTIFS]") + ` Looking for new chapters at ${new Date().toLocaleString()}`);
		let reading = await getReading();
		
		await Promise.all(reading.map(obj => obj.success ? obj : null).filter(Boolean).map(async obj => {
			
			// Update manga and store new value in cache + variable
	
			let data = await updateManga(obj.provider, obj.constant.slug, true);
			
			// Check for new chapters and notify user
			if(data.success) {
				// Now get a potential next chapter
				let chapters = data.data.chapters;

				// Add "combined" value for sorting
				chapters.forEach(ch => {
					ch.combined = ch.season * 1e3 + ch.chapter;
				});
				
				// Sort chapters on location
				chapters = chapters.sort((a, b) => a.combined - b.combined);	

				// Get reading
				let dbString = `reading_new.${getProviderId(data.provider)}.${data.constant.slug}.last`;
				let reading: Progress = db.get(dbString);
				if(!reading) return null;
				let currentChapter = chapters.find(c => c.hrefString === reading.chapterId);
				
				let nextChapter = chapters[chapters.indexOf(currentChapter) + 1];

				if(nextChapter) {
					// There is a next chapter!

					// Compare chapter release dates
					let chapterReleaseDate = new Date(nextChapter.date).getTime();
					if(chapterReleaseDate > reading.at) {
						// A new chapter is out! 

						// Check if user hasn't been notified already
						let dbString = `notified.${data.constant.slug}.${nextChapter.season}-${nextChapter.chapter}`;
						let hasNotified = db.get(dbString);

						if(hasNotified) {
							console.info(chalk.red("[NOTIFS]") + ` New chapter was found for ${data.constant.title}, user has already been notified`);
							return;
						}

						let bot = Bot.get();
						if(bot) {

							// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
							console.info(chalk.green("[NOTIFS]") + ` New chapter found for ${data.constant.title}, notifying user`);

							let msg = `New chapter for *${data.constant.title}*!`;
							
							let host = db.get("other.host");
							let urlMsg = host ? `Check it out at ${host.replace("localhost", "127.0.0.1")}${data.constant.slug}/${nextChapter.season}-${nextChapter.chapter}/` : ""; 
							
							Bot.send(`${msg}\n${urlMsg}`);
							db.set(dbString, true);
						} else {
							// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
							console.info(chalk.red("[NOTIFS]") + ` New chapter found for ${data.constant.title}, not notifying user since bot wasn't configured`);
						}

					}
				}

			}
		}));

		console.info(chalk.green("[NOTIFS]") + ` Checked for new chapters, now done`);

		/**
		 * Remove old items from cache
		 */


		// Get data
		
		console.info(chalk.yellowBright("[CLEANUP]") + ` Checking each cache entry for old data`);

		// Check each entry and
		for(let provider of Object.keys(cache)) {
			
			for(let slug of Object.keys(cache[provider])) {
				
				// Get difference from saved time in MS
				let diff = Date.now() - (cache[provider]?.[slug]?.savedAt ?? 9e9);
				
				// Check if cache is old. How old should be fairly obvious
				if(diff > (1e3 * 60 * 60) * 24) {
					cache[provider][slug] = undefined;
					console.info(chalk.green("[CLEANUP]") + ` Deleting cache for ${slug} since it's ${Math.floor(diff / (60 * 1e3))} minutes old`);
				}

			}

		}

		// Write to db
		console.info(chalk.green("[CLEANUP]") + ` Done cleaning up`);

	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;