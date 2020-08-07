
import cfg from "../config.json";
import updateManga from "./updateManga";
import Mangasee from "../scrapers/mangasee";

class Updater {

	start() {
		this.updateCache();
		setInterval(() => {
			this.updateCache();
		}, cfg.cache.duration);
	}

	private async updateCache() {
		console.info("Updating 'popular' cache");
		let popular = await Mangasee.search("");
		
		await Promise.all(popular.map(obj => obj.success ? obj.constant.slug : null).filter(Boolean).map(async slug => {
			await updateManga(slug, true);
		}));
		console.info("Updated 'popular' cache");
	}
}

const updatePopularCache = new Updater();
export default updatePopularCache;