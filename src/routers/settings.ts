import express from "express";
import db from "../db";
import fs from "fs";
import getReading from "../util/getReading";
import getIconSrc, { iconNames, iconNamesReversed } from "../util/getIconSrc";

const router = express.Router();

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


router.get("/settings/", async (req, res) => {

	let reading = await getReading();

	// Get icons
	let currentIcon = getIconSrc();
	let icons = fs.readdirSync("./public/icons/").filter(n => !n.includes("DS_Store")).map(fileName => {
		let src = `/icons/${fileName}`;
		return {
			file: fileName,
			src,
			name: getIconName(fileName),
			isSelected: src === currentIcon
		}
	});

	// Get backups
	let backupFiles = fs.readdirSync("./backups/");
	let backups = backupFiles.map(fileName => {
		let d = new Date(Number(fileName.slice(0, -5)));
		let label = `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
		return {
			fileName,
			label,
			date: d
		};
	}).sort((a, b) => b.date.getTime() - a.date.getTime());

	res.render("settings", {
		isSettings: true,
		icons,
		reading,
		backups
	});
});

router.get("/settings/restore-backup/:filename", async (req, res) => {
	try {
		
		let filename = req.params.filename;
		let backup = JSON.parse(fs.readFileSync(`backups/${filename}`, "utf-8"));
		
		let reading = backup.reading ?? {};
		let lists = backup.lists ?? [];

		// Merge reading
		let r = db.get("reading_new") || {};
		if(reading.mangasee) {
			for(let provider of Object.keys(reading)) {
				if(!r[provider]) r[provider] = {}
				for(let slug of Object.keys(reading[provider])) {
					r[provider][slug] = {
						...r[provider][slug],
						...reading[provider][slug]
					};
				}
			}
		} else {
			r.mangasee = {
				...r.mangasee,
				...reading
			}
		}
		db.set("reading_new", r);

		// Set lists
		db.set("lists", lists);

		res.json({
			status: 200
		});
	} catch(err) {
		res.json({
			status: 500,
			err
		});
	}
});

router.post("/settings/set-icon/", async (req, res) => {

	let newName = req.body.name;
	if(iconNamesReversed[newName]) {
		db.set("settings.icon", newName);

		res.json({
			status: 200
		});

	} else {

		res.status(404);
		res.json({
			status: 404,
			error: "No icon with that name was found"
		});

	}

});

// Intercept manifest.json
router.get("/manifest.json", (req, res) => {

	let icons = fs.readdirSync("public/icons").filter(name => !name.includes("DS_Store")).map(fileName => {
		return {
			size: "200x200",
			src: `/icons/${fileName}`
		}
	});

	res.json({
		"name": `${!!process.env.dev ? "DEV " : ""}Adolla`,
		"short_name": `${!!process.env.dev ? "DEV " : ""}Adolla`,
		"lang": "EN",
		"start_url": "/",
		"display": "standalone",
		"theme_color": "#4babce",
		"background_color": "#ffffff",
		"icons": [
			{
				"sizes": "200x200",
				"src": "/icon.png"
			},
			...icons
		]
	});
});

function getIconName(fileName: string) {
	// Get array with each "section" of file name
	let str = fileName.split(/-|\./).slice(0, -1).join("-");

	return iconNames[str] ?? "Unknown";
}

export default router;