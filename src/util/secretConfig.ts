import chalk from "chalk";
import fs from "fs";

interface SecretConfig {
	telegram?: {
		bot: string | null;
		user: string | null;
	};
	mangadex?: {
		username: string | null;
		password: string | null;
	};
	discord_webhook: string | null;
}

let secretConfig: SecretConfig | null;

const path =
	__dirname.split("/").slice(0, -1).join("/") + "/secret-config.json";
if (fs.existsSync(path)) {
	secretConfig = JSON.parse(fs.readFileSync(path, "utf-8"));
} else {
	console.error(chalk.red("[SECRET]") + " No secret-config provided.");
}

export default secretConfig || null;
