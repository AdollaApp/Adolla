import path from "path";
import os from "os";
import fs from "fs";
import chalk from "chalk";
import db from "./db";
import { List } from "./types";

const homePath = path.join(os.homedir(), ".adolla");
const backupsPath = path.join(homePath, "backups", "");

class Backup {
	/**
	 * Start checking for backups.
	 * Running `.start()` will make it so a backup is made every 24 hours.
	 */
	public start() {
		this.checkTime();
	}

	public async createBackup() {
		console.info(
			chalk.yellowBright("[BACKUP]") +
				` Making backup at ${new Date().toLocaleString("it")}`
		);
		const reading = db.get("reading_new");
		const hide_read = db.get("hide_read");
		const lists: List[] = db.get("lists");

		const now = Date.now();

		// Remove stuff
		lists.forEach((l) => {
			for (const entry of l.entries) {
				delete entry.data;
			}
		});

		const backupJson = {
			backupAt: now,
			reading,
			lists,
			hide_read,
		};

		if (!fs.existsSync(backupsPath)) fs.mkdirSync(backupsPath);
		fs.writeFileSync(
			path.join(backupsPath, `${now}.json`),
			JSON.stringify(backupJson)
		);

		console.info(
			chalk.green("[BACKUP]") +
				` Saved backup at ${new Date().toLocaleString("it")}`
		);
	}

	private async checkTime() {
		const offset = 1e3 * 60 * 60 * 12;

		const lastBackupTime = await this.getLastBackupTime();
		const difference = Date.now() - (lastBackupTime || Date.now());

		console.info(chalk.yellowBright("[BACKUP]") + " Running backup check");

		if (difference > offset) {
			this.createBackup();
			setTimeout(() => {
				this.checkTime();
			}, offset);
		} else {
			const timeoutValue = offset - difference;
			setTimeout(() => {
				this.checkTime();
			}, timeoutValue);
		}
	}

	private async getLastBackupTime() {
		if (!fs.existsSync(backupsPath)) fs.mkdirSync(backupsPath);
		const files = fs
			.readdirSync(backupsPath)
			.map((fileName) => Number(fileName.slice(0, -5)));
		const last = files.sort((a, b) => b - a)[0] ?? 0;
		return last;
	}
}

const backup = new Backup();
export default backup;
