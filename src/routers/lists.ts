import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";
import { List } from "../types";

// Main page!
router.get("/", async (req, res) => {
	// Get lists
	const lists = await getLists();

	// Get reading
	const reading = await getReading();

	res.render("lists", {
		reading,
		lists,
		isLists: true,
	});
});

router.get("/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	const data = await getLists();
	res.json({
		data: {
			lists: data,
		},
	});
});

router.post("/set-home", async (req, res) => {
	const listId = req.body.listId;
	let value = req.body.value;
	value = !!value; // Make sure it's a boolean.

	// Get all lists
	const lists: List[] = await getLists();

	// Find list and set home value
	const list = lists.find((l) => l.slug === listId);
	if (list) list.showOnHome = value;

	// Store lists in database
	db.set("lists", lists.filter((l) => !l.byCreator).map(removeData));

	res.json({
		status: 200,
	});
});

export function removeData(list: List) {
	let l = Object.assign({}, list);

	// Remove "data" from objects so the db is smaller
	if (!list.byCreator) {
		l.entries = l.entries.map((entry) => {
			return {
				provider: entry.provider,
				slug: entry.slug,
			};
		});
	}
	return list;
}

export default router;
