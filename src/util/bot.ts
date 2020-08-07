import Telebot from "telebot";
import { telegram } from "../secret-config.json";

let bot = null;
if(telegram.bot) {
	bot = new Telebot(telegram.bot);
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
		if(bot && telegram.user) {
			bot.sendMessage(telegram.user, message, {
				parseMode: "markdown"
			});
		} else {
			console.error(telegram.user ? "[TELEGRAM] No bot token found" : "[TELEGRAM] No user ID found");
		}
	}
}

export default new Bot();
