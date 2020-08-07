
console.clear();

import { config } from "dotenv";
config();

import app from "./web";
import backup from "./backup";

import updatePopularCache from "./util/updatePopularCache";

import cfg from "./config.json";

app.listen(cfg.http.port, () => {
	console.info(`Web server is live on localhost:${cfg.http.port}`);
	backup.start();
	updatePopularCache.start();
});