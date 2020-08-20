
import express from "express";
const router = express.Router();

import getReading from "../util/getReading";
import { getLists } from "../util/lists";

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

export default router;