
import { Database } from "./types";
import fs from "fs";

// Basic database setup
// import low from "lowdb";
// import FileSync from "lowdb/adapters/FileSync"

// const adapter = new FileSync("data.json");
// const db = low(adapter);

// // Defaults
// const defaults: Database = {
// 	manga_cache: {},
// 	reading: {},
// 	other: {},
// 	notified: {},
// 	lists: []
// }
// db.defaults(defaults);

class Db {
	
	private db: Db;
	private file: string;
	public data: any;

	constructor() {
		this.db = this;

		this.file = `./data.json`;

		if(!fs.existsSync(this.file)) fs.writeFileSync(this.file, "{}");
		this.data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

		const defaults: Database = {
			manga_cache: {},
			reading: {},
			other: {},
			notified: {},
			lists: []
		}
		for(let key of Object.keys(defaults)) {
			if(!this.data[key]) this.data[key] = defaults[key];
		}

		setInterval(() => {
			this.store();
		}, 30e3);
		this.store();

	}

	public store() {
		fs.writeFileSync(this.file, JSON.stringify(this.data));
	}

	public get(str: string, setFields = false) {
		let value = str.split(".").reduce((p, c)=> {
			if(p && !p[c] && setFields) p[c] = {};
			return (p && p[c]) ?? null;
		}, this.data);
		return value;
	}

	public set(str: string, value: any) {
		let field = this.get(str.split(".").slice(0, -1).join("."), true);
		field[str.split(".").pop()] = value;
		// field[] = value;
	}
}

const db = new Db();

export default db;