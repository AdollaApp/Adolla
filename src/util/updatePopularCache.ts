
import cfg from "../config.json";
import updateManga from "./updateManga";
import Mangasee from "../scrapers/mangasee";
import db from "../db";
import getReading from "./getReading";
import { Reading, Progress } from "../types";
import Bot from "./bot";
import chalk from "chalk";

class Updater {

	start() {
		this.updateCache();
		setInterval(() => {
			this.updateCache();
		}, cfg.cache.duration);
	}

	private async updateCache() {
		console.info(chalk.yellowBright("[CACHE]") + ` Updating popular cache at ${new Date().toLocaleString()}`);
		let popular = await Mangasee.search("");
		
		await Promise.all(popular.map(obj => obj.success ? obj.constant.slug : null).filter(Boolean).map(async slug => {
			// Update manga and store new value in cache
			await updateManga(slug, true);
		}));

		console.info(chalk.green("[CACHE]") + " Updated cache for popular manga");

		console.info(chalk.yellowBright("[NOTIFS]") + ` Looking for new chapters at ${new Date().toLocaleString()}`);
		let reading = await getReading();
		
		await Promise.all(reading.map(obj => obj.success ? obj.constant.slug : null).filter(Boolean).map(async slug => {
			// Update manga and store new value in cache + variable
			let data = await updateManga(slug, true);
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
				let reading: Progress = db.get(`reading.${data.constant.slug}.last`);
				let currentChapter = chapters.find(c => c.season === reading.season && c.chapter === reading.chapter);
				
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

						// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
						console.info(chalk.green("[NOTIFS]") + ` New chapter found for ${data.constant.title}, notifying user`);

						let bot = Bot.get();
						if(bot) {
							let msg = `New chapter for *${data.constant.title}*!`;
							
							let host = db.get("other.host");
							let urlMsg = host ? `Check it out at ${host.replace("localhost", "127.0.0.1")}${data.constant.slug}/${nextChapter.season}-${nextChapter.chapter}/` : ""; 
							
							Bot.send(`${msg}\n${urlMsg}`);
							db.set(dbString, true);
						} 

					}
				}

			}
		}));

		console.info(chalk.green("[NOTIFS]") + ` Checked for new chapters, now done`);

		

	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;