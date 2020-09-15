import express from "express";
const router = express.Router();

import db from "../db";
import fs from "fs";
import getReading from "../util/getReading";
import getIconSrc, { iconNames, iconNamesReversed } from "../util/getIconSrc";

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

	res.render("settings", {
		isSettings: true,
		icons,
		reading
	});
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