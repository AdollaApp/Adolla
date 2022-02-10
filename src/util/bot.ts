import chalk from "chalk";
import Telebot from "telebot";
import secretConfig from "../util/secretConfig";

export const botToken =
	process.env.TELEGRAMTOKEN ?? secretConfig?.telegram?.bot;
export const telegramUser =
	process.env.TELEGRAMUSER ?? secretConfig?.telegram?.user;

let bot: Telebot | null = null;
if (botToken) {
	bot = new Telebot(botToken);
	bot.start();
	bot.on("text", (message) => {
		console.info(
			`The Telegram bot has received a message from ID: ${message.from.id} (@${message.from.username})`
		);
	});
} else {
	console.error(
		chalk.red("[SECRET]") +
			" There is no Telegram bot token in the secret-config. As a result of that, you won't be notified of new chapters through Telegram."
	);
}

class Bot {
	get() {
		return bot ?? null;
	}
	send(message: string) {
		const bot = this.get();
		if (bot && telegramUser) {
			bot.sendMessage(telegramUser, message).catch((err) => console.log(err));
		} else {
			console.error(
				telegramUser
					? "[TELEGRAM] No bot token found"
					: "[TELEGRAM] No user ID found"
			);
		}
	}
}

export default new Bot();
