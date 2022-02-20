import os from "os";
import path from "path";
import chalk from "chalk";
import fs from "fs";
import exampleConfig from "../example.secret-config.json";

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
	max_reading_to_show_popular: number | null;
	port?: number | null;
}

let secretConfig: SecretConfig | null;

const homePath = path.join(os.homedir(), ".adolla");
if (!fs.existsSync(homePath)) {
	fs.mkdirSync(homePath);
}

const configPath = path.join(os.homedir(), ".adolla", "secret-config.json");
const oldPath =
	__dirname.split("/").slice(0, -1).join("/") + "/secret-config.json"; // Ew

if (!fs.existsSync(configPath)) {
	// Set default secret config
	let newConfig;
	// Find new config to set. Either the existing one inside this directory or the example file

	if (fs.existsSync(oldPath)) {
		console.error(
			chalk.red("[SECRET]") +
				` Found secret-config.json in the \`src\` folder. This location is deprecated and is moved to \`~/.adolla/secret-config.json\`.`
		);
		newConfig = fs.readFileSync(oldPath, "utf-8");
		fs.renameSync(oldPath, "src/secret-config-archived.json");
	} else {
		newConfig = JSON.stringify(exampleConfig);
	}

	fs.writeFileSync(configPath, newConfig);
} else if (fs.existsSync(oldPath)) {
	console.error(
		chalk.red("[SECRET]") +
			` Found secret-config.json in the \`src\` folder. This location is deprecated and is moved to \`~/.adolla/secret-config.json\`.`
	);
	fs.renameSync(oldPath, "secret-config-archived.json");
}

if (fs.existsSync(configPath)) {
	secretConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
	console.error(chalk.red("[SECRET]") + " No secret-config provided.");
}

export default secretConfig || null;
