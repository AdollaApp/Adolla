
import fs from "fs";
import chalk from "chalk";
import db from "./db";

class Backup {

	/**
	 * Start checking for backups.
	 * Running `.start()` will make it so a backup is made every 24 hours.
	 */
	public start() {
		this.checkTime();
	}

	public async createBackup() {
		console.info(chalk.yellowBright("[BACKUP]") + ` Making backup at ${new Date().toLocaleString("it")}`);
		// let reading = JSON.parse(fs.readFileSync("data.json", "utf-8")).reading;
		// let lists = JSON.parse(fs.readFileSync("data.json", "utf-8")).lists;
		let reading = db.get("reading").value();
		let lists = db.get("lists").value();
		
		let now = Date.now();

		let backupJson = {
			backupAt: now,
			reading,
			lists
		};

		if(!fs.existsSync("backups/")) fs.mkdirSync("backups");
		fs.writeFileSync(`backups/${now}.json`, JSON.stringify(backupJson));

		console.info(chalk.green("[BACKUP]") + ` Saved backup at ${new Date().toLocaleString("it")}`);

	}

	private async checkTime() {

		let offset = 1e3 * 60 * 60 * 12;

		let lastBackupTime = await this.getLastBackupTime();
		let difference = Date.now() - lastBackupTime;
		console.info(chalk.yellowBright("[BACKUP]") + " Running backup check");
		if(difference > offset) {
			this.createBackup();
			setTimeout(() => {
				this.checkTime();
			}, offset);
		} else {
			let timeoutValue = offset - difference;
			setTimeout(() => {
				this.checkTime();
			}, timeoutValue);
		}
	}

	private async getLastBackupTime() {
		if(!fs.existsSync("backups/")) fs.mkdirSync("backups");
		let files = fs.readdirSync("backups/").map(fileName => Number(fileName.slice(0, -5)));
		let last = files.sort((a, b) => b - a)[0] ?? 0;
		return last;
	}
}

let backup = new Backup();
export default backup;