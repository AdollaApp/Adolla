
import chalk from "chalk";
import fetch from "node-fetch";

import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import updateManga from "../util/updateManga";

import db from "../db";

// Get "recommended" list
let recommendedLists = [];
async function updateRecommended() {
	console.info(chalk.yellowBright("[RECOMMENDATIONS]") + ` Updating recommendations at ${new Date().toLocaleString()}`);

	const suggestionsUrl = "https://gist.githubusercontent.com/JipFr/17fabda0f0515965cbe1c73b75b7ed71/raw";
	let recommended = await (await fetch(suggestionsUrl)).json();
	recommendedLists = recommended;

	console.info(chalk.green("[RECOMMENDATIONS]") + ` Updated recommendations`);

}
updateRecommended();
setInterval(updateRecommended, 1e3 * 60 * 60 * 12); // Update every 12 hours

// Set default lists. This is temporary
db.set("lists", [
	{
		"slug": "good",
		"name": "Good",
		"entries": [
			{
				"slug": "Fire-Brigade-Of-Flames"
			},
			{
				"slug": "Tower-Of-God"
			},
			{
				"slug": "Shingeki-No-Kyojin"
			},
			{
				"slug": "Yokohama-Kaidashi-Kikou"
			},
			{
				"slug": "The-God-Of-High-School"
			}
		]
	},
	{
		"slug": "bad",
		"name": "Kinda lame",
		"entries": [
			{
				"slug": "Dr-Stone"
			}
		]
	},
	{
		"slug": "might-read",
		"name": "Might read",
		"entries": [
			{
				"slug": "The-God-Of-High-School"
			}
		]
	},
	{
		"slug": "empty-list", 
		"name": "This is an empty lists",
		"entries": []
	}
]);


router.get("/", async (req, res) => {
	
	// Set lists
	let lists = db.get("lists");
	let updatedLists = Object.assign([], [...recommendedLists, ...lists]);
	for(let list of updatedLists) {

		// Add data for each item
		for(let entry of list.entries) {
			entry.data = await updateManga(entry.slug);
		}

	}
	
	// Get reading 
	let reading = await getReading();

	res.render("lists", {
		reading,
		lists: updatedLists,
		isLists: true
	});
});

export default router;