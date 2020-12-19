// Import modules
import chalk from "chalk";

// Log facts
console.info(
	chalk.green("[SERVER]") + ` Starting up at ${new Date().toLocaleString("it")}`
);

// Configure environment
import { config } from "dotenv";
config();

// Require important things
import app from "./web";
import backup from "./backup";

// Import method to update all cache
import updatePopularCache from "./util/updatePopularCache";

// Import config
import cfg from "./config.json";

// Start all
app.listen(process.env.PORT ?? cfg.http.port ?? 80, () => {
	console.info(
		chalk.green("[SERVER]") +
			` Web server is live on localhost:${process.env.PORT ?? cfg.http.port}`
	);
	backup.start();
	updatePopularCache.start();
});
