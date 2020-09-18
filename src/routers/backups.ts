
import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import fs from "fs";
import db from "../db";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

router.get("/", async (req, res) => {

	let reading = await getReading();

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

	res.render("backups", {
		reading,
		backups,
		isBackups: true
	});
});

router.get("/restore/:filename", async (req, res) => {
	try {
		
		let filename = req.params.filename;
		let backup = JSON.parse(fs.readFileSync(`backups/${filename}`, "utf-8"));
		
		let reading = backup.reading ?? {};
		let lists = backup.lists ?? [];

		// Merge reading
		let r = db.get("reading")
		for(let slug of Object.keys(reading)) {
			if(!r[slug]) r[slug] = {}
			r[slug] = {
				...r[slug],
				...reading[slug]
			};
		}
		db.set("reading", r);

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

export default router;