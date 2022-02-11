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
		console.info("—".repeat(10));
		console.info(
			chalk.green("[ANALTICS]") +
				` Adolla has non-invasive analytics for Jip. These analytics include the platform Adolla is running on, your username, and whether you have configured Discord webhooks and the Telegram bots for notifications.`
		);
		console.info(
			chalk.green("[ANALTICS]") +
				` These analytics only run on once, on every start-up. Instructions to disable them can be found in the README.`
		);
		console.info("—".repeat(10));

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
			}`
		);
	}
})();

// Start all
app.listen(process.env.PORT ?? secretConfig.port ?? cfg.http.port ?? 80, () => {
	console.info(
		chalk.green("[SERVER]") +
			` Web server is live on localhost:${process.env.PORT ?? cfg.http.port}`
	);
	backup.start();
	updatePopularCache.start();
});
