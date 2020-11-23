
import chalk from "chalk";

console.info(chalk.green("[SERVER]") + ` Starting up at ${new Date().toLocaleString("it")}`);

import { config } from "dotenv";
config();

import app from "./web";
import backup from "./backup";

import updatePopularCache from "./util/updatePopularCache";

import cfg from "./config.json";

app.listen(process.env.PORT ?? cfg.http.port ?? 80, () => {
	console.info(chalk.green("[SERVER]") + ` Web server is live on localhost:${process.env.PORT ?? cfg.http.port}`);
	backup.start();
	updatePopularCache.start();
});