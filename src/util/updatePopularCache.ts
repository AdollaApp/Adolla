
import cfg from "../config.json";
import updateManga from "./updateManga";
import Mangasee from "../scrapers/mangasee";
import db from "../db";
import getReading from "./getReading";
import { Reading, Progress } from "../types";
import Bot from "./bot";

class Updater {

	start() {
		this.updateCache();
		setInterval(() => {
			this.updateCache();
		}, cfg.cache.duration);
	}

	private async updateCache() {
		console.info("Updating 'popular' cache");
		let popular = await Mangasee.search("");
		
		await Promise.all(popular.map(obj => obj.success ? obj.constant.slug : null).filter(Boolean).map(async slug => {
			// Update manga and store new value in cache
			await updateManga(slug, true);
		}));

		console.info("Updated 'popular' cache");

		console.info("Looking for new chapters");
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
				let reading: Progress = db.get(`reading.${data.constant.slug}.last`).value();
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
						let hasNotified = db.get(dbString).value();

						if(hasNotified) {
							console.log(`New chapter for ${data.constant.title}, user has been notified already`);
							return;
						}

						// Send notification, and do some stuff to make sure it doesn't send it every 30 minutes
						console.info(`New chapter for ${data.constant.title}`);

						let bot = Bot.get();
						if(bot) {
							let msg = `New chapter for *${data.constant.title}*!`;
							
							let host = db.get("other.host").value();
							let urlMsg = host ? `Check it out at ${host.replace("localhost", "127.0.0.1")}${data.constant.slug}/${nextChapter.season}-${nextChapter.chapter}/` : ""; 
							
							Bot.send(`${msg}\n${urlMsg}`);
							db.set(dbString, true).write();
						} 

					}
				}

			}
		}));

		console.info("Checked for new chapters, done");

		

	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;