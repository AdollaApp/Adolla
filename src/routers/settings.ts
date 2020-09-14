import express from "express";
const router = express.Router();

import db from "../db";
import fs from "fs";
import getReading from "../util/getReading";
import getIconSrc, { iconNames, iconNamesReversed } from "../util/getIconSrc";

router.get("/", async (req, res) => {

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
		icons
	});
});

router.post("/set-icon/", async (req, res) => {

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

function getIconName(fileName: string) {
	// Get array with each "section" of file name
	let str = fileName.split(/-|\./).slice(0, -1).join("-");

	return iconNames[str] ?? "Unknown";
}

export default router;