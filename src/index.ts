// Import modules
import chalk from "chalk";
import fetch from "node-fetch-extra";
import os from "os";
import { botToken, telegramUser } from "./util/bot";

// Log facts
console.info(
	chalk.green("[SERVER]") + ` Starting up at ${new Date().toLocaleString("it")}`
);

// Configure environment
import { config } from "dotenv";
config();

// Require important things
import app from "./web";
import backup from "./backup";
import db from "./db";

// Import method to update all cache
import updatePopularCache from "./util/updatePopularCache";

// Import config
import cfg from "./config.json";
import secretConfig from "./util/secretConfig";

// Analytics for Jip — non invasive and opt-out!
(async () => {
	if (!process.env.DISABLE_ANALYTICS) {
		// Inform user about analytics
		console.info("—".repeat(10));
		console.info(
			chalk.green("[ANALYTICS]") +
				` Adolla has non-invasive analytics for Jip. These analytics include the platform Adolla is running on, your username, and whether you have configured Discord webhooks and the Telegram bots for notifications.`
		);
		console.info(
			chalk.green("[ANALYTICS]") +
				` These analytics only run on once, on every start-up. Instructions to disable them can be found in the README.`
		);
		console.info("—".repeat(10));

		// Generate unique ID
		if (!db.get("adolla-uid")) {
			const words = await fetch(
				"https://raw.githubusercontent.com/xyfir/rword/master/words/small.json"
			).then((d) => d.json());

			let uidArr = [];
			for (let i = 0; i < 3; i++) {
				uidArr.push(words[Math.floor(Math.random() * words.length)]);
			}
			const uid = uidArr.join("-");
			db.set("adolla-uid", uid);
		}

		// Get "reading" count
		const reading = db.get("reading_new");
		const allReading = Object.values(reading)
			.map((v) => Object.values(v))
			.flat();
		const readingCount = allReading.length;
		let totalChapterCount = 0;
		for (let series of allReading) {
			for (let key in series) {
				if (key === "last") continue;
				totalChapterCount += series[key]?.percentage / 100 || 0;
			}
		}
		totalChapterCount = Math.round(totalChapterCount);

		// Submit
		fetch(
			`https://adolla.jip-fr.workers.dev/?username=${
				os.userInfo().username
			}&platform=${os.platform}&uid=${db.get(
				"adolla-uid"
			)}&telegram%20notifications=${
				botToken && telegramUser ? "Configured" : "No"
			}&discord%20notifications=${
				process.env.DISCORDWEBHOOK ?? secretConfig.discord_webhook
					? "Configured"
					: "No"
			}&total%20chapters%20=${totalChapterCount}&reading%20series=${readingCount}`
		);
	}
})();

// Start all
app.listen(process.env.PORT ?? secretConfig.port ?? cfg.http.port ?? 80, () => {
	console.info(
		chalk.green("[SERVER]") +
			` Web server is live on http://localhost:${process.env.PORT ?? cfg.http.port}`
	);
	backup.start();
	updatePopularCache.start();
});
