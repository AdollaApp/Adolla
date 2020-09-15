
import { Database } from "./types";
import Db from "jipdb";

const defaults: Database = {
	manga_cache: {},
	reading: {},
	other: {},
	notified: {},
	lists: [],
	settings: {
		icon: "White"
	}
}

const db = new Db("data.json", defaults);

export default db;