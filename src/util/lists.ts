
import chalk from "chalk";
import fetch from "node-fetch";

import updateManga from "../util/updateManga";
import db from "../db";
import { List } from "../types";

// TODO: PROPERLY IMPLEMENT PROVIDERS IN LISTS

// Get "recommended" list
let recommendedLists = [];
async function updateRecommended() {
	console.info(chalk.yellowBright("[RECOMMENDATIONS]") + ` Updating recommendations at ${new Date().toLocaleString()}`);

	const suggestionsUrl = "https://gist.githubusercontent.com/JipFr/17fabda0f0515965cbe1c73b75b7ed71/raw";
	let recommended: List[] = await (await fetch(suggestionsUrl)).json();
	recommendedLists = recommended.map(recommendedItem => {
		recommendedItem.byCreator = true;
		return recommendedItem;
	});

	console.info(chalk.green("[RECOMMENDATIONS]") + ` Updated recommendations`);

}
updateRecommended();
setInterval(updateRecommended, 1e3 * 60 * 60 * 12); // Update every 12 hours


export async function getLists(): Promise<List[]> {
	
	// Get lists from database
	let lists: List[] = db.get("lists");

	// Remove creator items from db results. There shouldn't be any, but I hope that this is what fixes Destruc7i0n's bug.
	lists = lists.filter(l => !l.byCreator);

	// Now combine the lists
	let updatedLists: List[] = Object.assign([], [...recommendedLists, ...lists]);
	for(let list of updatedLists) {

		// Add data for each item
		for(let entry of list.entries) {
			entry.data = await updateManga(entry.provider ?? "Mangasee", entry.slug);
		}

	}
	
	// Return both database items and creator's suggestions
	return updatedLists;
}