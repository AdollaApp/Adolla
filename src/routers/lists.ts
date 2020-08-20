
import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import updateManga from "../util/updateManga";


const lists = [
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
];


router.get("/", async (req, res) => {
	
	// Set lists
	let updatedLists = Object.assign([], lists);
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