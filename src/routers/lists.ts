
import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import db from "../db";
import { getLists } from "../util/lists";
import { List } from "../types";

// Main page!
router.get("/", async (req, res) => {
	
	// Get lists
	let lists = await getLists();
	
	// Get reading 
	let reading = await getReading();

	res.render("lists", {
		reading,
		lists,
		isLists: true
	});
});

router.post("/set-home", async (req, res) => {

	let { listId, value } = req.body;
	value = !!value; // Make sure it's a boolean.

	// Get all lists
	let lists: List[] = await getLists();

	// Find list and set home value
	let list = lists.find(l => l.slug === listId);
	if(list) list.showOnHome = value;
	
	// Store lists in database
	db.set("lists", lists);

	res.json({
		status: 200
	});
});

export default router;