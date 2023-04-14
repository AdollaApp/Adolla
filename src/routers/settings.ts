import express from "express";
import db from "../db";
import fs from "fs";
import os from "os";
import getReading from "../util/getReading";
import getIconSrc, { iconNames, iconNamesReversed } from "../util/getIconSrc";
import path from "path";
import { removeData } from "./lists";
import { List } from "../types";

const homePath = path.join(os.homedir(), ".adolla");
const backupsPath = path.join(homePath, "backups", "");

const router = express.Router();

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
export const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

router.get("/settings/", async (req, res) => {
	const reading = await getReading();

	// Get icons
	const currentIcon = getIconSrc();
	const icons = fs
		.readdirSync("./public/icons/")
		.filter((n) => !n.includes("DS_Store"))
		.map((fileName) => {
			const src = `/icons/${fileName}`;
			return {
				file: fileName,
				src,
				name: getIconName(fileName),
				isSelected: src === currentIcon,
			};
		});

	// Get backups
	const backupFiles = fs.readdirSync(backupsPath);
	const backups = backupFiles
		.map((fileName) => {
			// Make label
			const d = new Date(Number(fileName.slice(0, -5)));

			const day = days[d.getDay()];
			const month = d.getDate().toString().padStart(2, "0");
			const monthName = months[d.getMonth()];
			const year = d.getFullYear();

			const hours = d.getHours().toString().padStart(2, "0");
			const minutes = d.getMinutes().toString().padStart(2, "0");
			const time = `${hours}:${minutes}`;

			const label = `${day}, ${month} ${monthName} ${year}, ${time}`;

			// Get list count
			const backup = JSON.parse(
				fs.readFileSync(path.join(backupsPath, fileName), "utf-8")
			);
			const listCount: List[] = (backup.lists || []).length;
			const listEntryCount = (backup.lists || []).reduce(
				(acc: number, list: List) => {
					return acc + list.entries.length;
				},
				0
			);

			// Get "reading" count
			const allReading = Object.values(backup.reading)
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

			// Return full object
			return {
				fileName,
				label,
				date: d,
				listCount,
				listEntryCount,
				readingCount,
				totalChapterCount,
				size: JSON.stringify(backup).length,
			};
		})
		.sort((a, b) => b.date.getTime() - a.date.getTime());

	res.render("settings", {
		isSettings: true,
		icons,
		reading,
		backups,
		showNsfw: db.get("settings.show-nsfw") === "yes",
		storeNsfw: db.get("settings.store-nsfw") === "yes",
		showCompleted: db.get("settings.show-completed") !== "no",
		showUnreads: db.get("settings.show-unread-chapter-count") === "yes",
	});
});

router.get("/settings/restore-backup/:filename", async (req, res) => {
	try {
		const filename = req.params.filename;
		const backup = JSON.parse(
			fs.readFileSync(path.join(backupsPath, filename), "utf-8")
		);

		const reading = backup.reading ?? {};
		const lists = backup.lists ?? [];
		const hide_read = backup.hide_read || {};

		// Merge reading
		const r = db.get("reading_new") || {};
		if (reading.mangasee) {
			for (const provider of Object.keys(reading)) {
				if (!r[provider]) r[provider] = {};
				for (const slug of Object.keys(reading[provider])) {
					r[provider][slug] = {
						...r[provider][slug],
						...reading[provider][slug],
					};
				}
			}
		} else {
			r.mangasee = {
				...(r.mangasee || {}),
				...reading,
			};
		}
		db.set("reading_new", r);

		// Merge hide_read
		const hide = db.get("hide_read") || {};
		for (let provider of Object.keys(hide_read)) {
			if (!hide[provider]) hide[provider] = {};
			for (let slug of Object.keys(hide_read[provider])) {
				hide[provider][slug] = hide_read[provider][slug];
			}
		}
		db.set("hide_read", hide);

		// Set lists
		db.set("lists", lists.map(removeData));

		res.json({
			status: 200,
		});
	} catch (err) {
		res.json({
			status: 500,
			err,
		});
	}
});

router.post("/settings/set-icon/", async (req, res) => {
	const newName = req.body.name;
	if (iconNamesReversed[newName]) {
		db.set("settings.icon", newName);

		res.json({
			status: 200,
		});
	} else {
		res.status(404);
		res.json({
			status: 404,
			error: "No icon with that name was found",
		});
	}
});

router.post("/settings/set-app-settings", async (req, res) => {
	// Set all settings
	for (let key of Object.keys(req.body)) {
		db.set(`settings.${key}`, req.body[key] ?? false);
	}

	res.json({
		status: 200,
	});
});

router.post("/settings/set-app-theme", async (req, res) => {
	// Set all settings
	db.set(`settings.theme`, req.body ?? {});

	res.json({
		status: 200,
	});
});

// Intercept manifest.json
router.get("/manifest.json", (req, res) => {
	const icons = fs
		.readdirSync("public/icons")
		.filter((name) => !name.includes("DS_Store"))
		.map((fileName) => {
			return {
				size: "200x200",
				src: `/icons/${fileName}`,
			};
		});

	res.json({
		name: `${process.env.dev ? "DEV " : ""}Adolla`,
		short_name: `${process.env.dev ? "DEV " : ""}Adolla`,
		id: "Adolla",
		lang: "EN",
		start_url: "/",
		display: "standalone",
		theme_color: "#4babce",
		background_color: "#ffffff",
		icons: [
			{
				sizes: "200x200",
				src: "/icon.png",
			},
			...icons,
		],
	});
});

router.get("/osdd.xml", (req, res) => {
	res.setHeader("content-type", "application/xml");
	res.send(`<?xml version="1.0"?>
	<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
		<ShortName>Adolla</ShortName>
		<Description>Search Adolla</Description>
		<Url type="text/html" method="get" template="${db.get(
			"other.host"
		)}search/mangasee/?q={searchTerms}" />
	</OpenSearchDescription>`);
});

function getIconName(fileName: string) {
	// Get array with each "section" of file name
	const str = fileName.split(/-|\./).slice(0, -1).join("-");

	return iconNames[str] ?? "Unknown";
}

export default router;
