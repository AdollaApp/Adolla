import chalk from "chalk";
import fetch from "node-fetch-extra";

import updateManga from "../util/updateManga";
import db from "../db";
import { List } from "../types";

// Get "recommended" list
let recommendedLists = [];
async function updateRecommended() {
	console.info(
		chalk.yellowBright("[RECOMMENDATIONS]") +
			` Updating recommendations at ${new Date().toLocaleString()}`
	);

	const suggestionsUrl =
		"https://gist.githubusercontent.com/JipFr/17fabda0f0515965cbe1c73b75b7ed71/raw";
	const recommended: List[] = await (await fetch(suggestionsUrl)).json();
	recommendedLists = recommended.map((recommendedItem) => {
		recommendedItem.byCreator = true;
		return recommendedItem;
	});

	console.info(chalk.green("[RECOMMENDATIONS]") + " Updated recommendations");
}
updateRecommended();
setInterval(updateRecommended, 1e3 * 60 * 60 * 12); // Update every 12 hours

export async function getLists(justHome: boolean = false): Promise<List[]> {
	// Get lists from database
	let lists: List[] = db.get("lists");

	// Remove creator items from db results. There shouldn't be any, but I hope that this is what fixes Destruc7i0n's bug.
	lists = lists.filter((l) => !l.byCreator);
	lists = lists.filter((l) => (justHome && l.showOnHome) || !justHome);

	// Now combine the lists
	let updatedLists: List[] = Object.assign([], [...recommendedLists, ...lists]);
	updatedLists = updatedLists.filter((l) => (justHome ? l.showOnHome : true));

	// Add data to each and every entry
	updatedLists = await Promise.all(
		updatedLists.map(async (list) => {
			// Add data to all fields
			list.entries = await Promise.all(
				list.entries.map(async (entry) => {
					entry.data = await updateManga(
						entry.provider ?? "mangasee",
						entry.slug
					);
					return entry;
				})
			);

			// Check for failed requests
			// list.entries = list.entries.filter((entry) => {
			// 	if (!(entry.data.success || !filterUndefineds)) {
			// 		console.info(
			// 			chalk.red("[LISTS]") +
			// 				` ${entry.slug} (${entry.provider}) has failed to load in ${
			// 					list.name
			// 				} (${list.slug}) at ${new Date().toLocaleString("it")}`
			// 		);
			// 	}
			// 	return entry.data.success || !filterUndefineds;
			// });
			return list;
		})
	);

	// Return both database items and creator's suggestions
	return updatedLists;
}
