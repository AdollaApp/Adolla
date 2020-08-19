import Telebot from "telebot";
import fs from "fs";
import chalk from "chalk";

interface SecretConfig {
	telegram?: {
		bot: string | null;
		user: string | null;
	}
}

let secretConfig: SecretConfig;
let path = __dirname.split("/").slice(0, -1).join("/") + "/secret-config.json";
if(fs.existsSync(path)) {
	secretConfig = JSON.parse(fs.readFileSync(path, "utf-8"));
} else {
	console.error(chalk.red("[TELEGRAM]") + ` No secret-config provided. The bot will not prompt you with new chapters.`);
}

let bot = null;
if(secretConfig?.telegram?.bot) {
	bot = new Telebot(secretConfig.telegram.bot);
	bot.start();
	bot.on("text", message => {
		console.info(`The Telegram bot has received a message from ID: ${message.from.id} (@${message.from.username})`)
	});
}

class Bot {
	get() {
		return bot ?? null;
	}
	send(message: string) {
		let bot = this.get();
		if(bot && secretConfig?.telegram?.user) {
			bot.sendMessage(secretConfig.telegram.user, message, {
				parseMode: "markdown"
			});
		} else {
			console.error(secretConfig.telegram.user ? "[TELEGRAM] No bot token found" : "[TELEGRAM] No user ID found");
		}
	}
}

export default new Bot();
