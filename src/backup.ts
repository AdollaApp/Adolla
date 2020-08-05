
import fs from "fs";

class Backup {

	/**
	 * Start checking for backups.
	 * Running `.start()` will make it so a backup is made every 24 hours.
	 */
	public start() {
		this.checkTime();
	}

	public async createBackup() {
		console.info("Making backup at", new Date().toLocaleString("it-it"));
		let reading = JSON.parse(fs.readFileSync("data.json", "utf-8")).reading;
		
		let now = Date.now();

		let backupJson = {
			backupAt: now,
			reading
		};

		if(!fs.existsSync("backups/")) fs.mkdirSync("backups");
		fs.writeFileSync(`backups/${now}.json`, JSON.stringify(backupJson));

	}

	private async checkTime() {

		let day = 1e3 * 60 * 60 * 24;

		let lastBackupTime = await this.getLastBackupTime();
		let difference = Date.now() - lastBackupTime;
		console.info("Running backup check");
		if(difference > day) { // TODO proper checks
			this.createBackup();
			setTimeout(() => {
				this.checkTime();
			}, day);
		} else {
			let timeoutValue = day - difference;
			setTimeout(() => {
				this.checkTime();
			}, timeoutValue);
		}
	}

	private async getLastBackupTime() {
		let files = fs.readdirSync("backups/").map(fileName => Number(fileName.slice(0, -5)));
		let last = files.sort((a, b) => b - a)[0] ?? 0;
		return last;
	}
}

let backup = new Backup();
export default backup;