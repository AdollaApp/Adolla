
import chalk from "chalk";
import fetch from "node-fetch";

import updateManga from "../util/updateManga";
import db from "../db";

// Get "recommended" list
let recommendedLists = [];
async function updateRecommended() {
	console.info(chalk.yellowBright("[RECOMMENDATIONS]") + ` Updating recommendations at ${new Date().toLocaleString()}`);

	const suggestionsUrl = "https://gist.githubusercontent.com/JipFr/17fabda0f0515965cbe1c73b75b7ed71/raw";
	let recommended = await (await fetch(suggestionsUrl)).json();
	recommendedLists = recommended.map(recommendedItem => {
		recommendedItem.byCreator = true;
		return recommendedItem;
	});

	console.info(chalk.green("[RECOMMENDATIONS]") + ` Updated recommendations`);

}
updateRecommended();
setInterval(updateRecommended, 1e3 * 60 * 60 * 12); // Update every 12 hours


export async function getLists() {
	let lists = db.get("lists");
	let updatedLists = Object.assign([], [...recommendedLists, ...lists]);
	for(let list of updatedLists) {

		// Add data for each item
		for(let entry of list.entries) {
			entry.data = await updateManga(entry.slug);
		}

	}
	return updatedLists;
}