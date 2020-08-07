import Telebot from "telebot";
import fs from "fs";

interface SecretConfig {
	telegram?: {
		bot: string | null;
		user: string | null;
	}
}

let secretConfig: SecretConfig;
if(fs.existsSync("./secret-config.json")) {
	secretConfig = JSON.parse(fs.readFileSync("secret-config.json", "utf-8"));
} else {
	console.error("[TELEGRAM] No secret-config provided. The bot will not prompt you with new chapters.");
}

let bot = null;
if(secretConfig?.telegram?.bot) {
	bot = new Telebot(secretConfig.telegram.bot);
	bot.start();
	bot.on("text", message => {
		console.log(`The Telegram bot has received a message from ID: ${message.from.id} (@${message.from.username})`)
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
