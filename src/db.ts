import path from "path";
import os from "os";
import fs from "fs";
import { Database, Progress } from "./types";
import Db from "jipdb";
import chalk from "chalk";

// Configure DB's default values
const defaults: Database = {
	reading_new: {},
	other: {},
	notified: {},
	lists: [],
	settings: {
		icon: "White",
		"show-nsfw": "no",
		"store-nsfw": "no",
	},
};

// Iniate new DB
const homePath = path.join(os.homedir(), ".adolla");
const dbPath = path.join(homePath, "data.json");
if (!fs.existsSync(homePath)) {
	fs.mkdirSync(homePath);
}

// Move db
if (fs.existsSync("./data.json")) {
	const data = fs.readFileSync("./data.json", "utf-8");
	fs.writeFileSync(dbPath, data);
	fs.renameSync("data.json", "data-archived.json");
	console.log("MOVED! data.json");
}

// Make db
const db = new Db(dbPath, defaults);

db.set("data_cache", undefined);

// Update reading format
const oldReading = db.get("reading");
if (oldReading) {
	console.info(chalk.green("[DB]") + " Storing old reading data");

	// Store old data
	fs.writeFileSync(
		"./old-reading.json",
		JSON.stringify(oldReading, null, "\t")
	);

	// Get new format for reading
	const newReading: {
		// Provider level
		[key: string]: {
			// Manga level
			[key: string]: {
				// Chapter level
				[key: string]: Progress;
			};
		};
	} = {
		mangasee: {}, // Mangasee was the default befor ethis update
	};

	console.info(
		chalk.yellowBright("[DB]") + " Start converting old reading to new"
	);

	// Generate new objects
	for (const slug of Object.keys(oldReading)) {
		newReading.mangasee[slug] = {
			...(newReading.mangasee[slug] ?? {}),
		};
		for (const chapter of Object.keys(oldReading[slug])) {
			const d = oldReading[slug][chapter];

			console.info(
				chalk.green("[DB]") +
					` Converting old reading to new: ${slug}'s ${chapter}`
			);

			newReading.mangasee[slug][chapter] = {
				current: d.current,
				total: d.total,
				at: d.at,
				chapterId: `${d.season}-${d.chapter}`,
			};
		}
	}

	console.info(chalk.green("[DB]") + " Converted old reading to new");

	// Store new object, get rid of old
	db.set("reading", undefined);
	db.set("reading_new", newReading);

	// Since this is the old data format, also clear the old data
	db.set("manga_cache", undefined);
	console.info(chalk.green("[DB]") + " Removed old manga cache");
}

// Export database for the entire app's use
export default db;
