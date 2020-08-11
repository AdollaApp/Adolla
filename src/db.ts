
import { Database } from "./types";

// Basic database setup
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync"

const adapter = new FileSync("data.json");
const db = low(adapter);

// Defaults
const defaults: Database = {
	manga_cache: {},
	reading: {},
	other: {},
	notified: {},
	lists: []
}
db.defaults(defaults).write();

export default db;