
import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import updateManga from "../util/updateManga";
import { List } from "../types";
import { setMangaProgress } from "../util/getMangaProgress";

const lists: List[] = [
	{
		"name": "Done / up-to-date",
		"slug": "done",
		"entries": [
			{
				"slug": "Yokohama-Kaidashi-Kikou"
			},
			{
				"slug": "Fire-Brigade-Of-Flames"
			}
		]
	},
	{
		"name": "Decent",
		"slug": "decent",
		"entries": [
			{
				"slug": "Tower-Of-God"
			}
		]
	},
	{
		"name": "Want to read",
		"slug": "later",
		"entries": [
			{
				"slug": "Dr-Stone"
			},
			{
				"slug": "Soul-Eater"
			},
			{
				"slug": "Shingeki-No-Kyojin"
			},
			{
				"slug": "Shingeki-Kyojin-Chuugakkou"
			}
		]
	}
];

router.get("/", async (req, res) => {

	let reading = await getReading();

	let sortedLists = await Promise.all(lists.map(async list => {

		for(let entry of list.entries) {
			entry.data = await updateManga(entry.slug);
			entry.data = await setMangaProgress(entry.data);
		}
		return list;
		
	}));

	sortedLists = lists.sort((a, b) => b.entries.length - a.entries.length);

	res.render("lists", {
		reading,
		isList: true,
		lists: sortedLists
	});
});


export default router;