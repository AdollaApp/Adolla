
// Import modules
import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";

// Import custom modules
import routers from "./routers"
import { StoredData, Chapter, Progress, ScraperResponse, List } from "./types";
import getIconSrc from "./util/getIconSrc";
import { getProviderId } from "./routers/manga-page";

const app = express();

// Set up view engine
app.engine("handlebars", handlebars({
	helpers: {
		stringify: (v: any) => JSON.stringify(v),
		getProgressString(manga: StoredData) {
			if(manga.progress && manga.success) {
				
				let curChapter = manga.data.chapters.find(c => c.hrefString === manga.progress.chapterId);
				return curChapter?.label + (typeof manga?.progress?.percentage !== "undefined" ? ` (${manga.progress.percentage}%)` : "") ?? "Chapter not found";
			
			};
			return "Not started yet";
		},
		getScraperIcon(provider: string): string | null {
			let icons = {
				"mangasee": "https://mangasee123.com/media/favicon.png",
				"mangadex": "https://mangadex.org/images/misc/navbar.svg",
				"rco": "https://readcomiconline.to/Content/images/favicon.ico"
			}
			return icons[provider] ?? "/icons/main-on-white.png";
		},
		genLink2(provider: string = "mangasee", slug: string, hrefString: string | null = null, chapter: number = -1) {
			let href = `/${getProviderId(provider)}/${slug}/`;
			let seasonLink = typeof hrefString === "string" || typeof hrefString === "number" ? hrefString : "";
			if(typeof chapter === "number" && chapter !== -1) seasonLink = `${hrefString}-${chapter}`; // Fallback stuff // TODO: Figure this out. This is related to reading at manga-card.handlebars, line 31
			return `${href}${seasonLink}`;
		},
		isCurrentChapter(season1: number, season2: number, chapter1: number, chapter2: number) {
			return season1 === season2 && chapter1 === chapter2 ? "current-chapter badge-background" : "";
		},
		checkSmallHighlight(mangaSlug: string, currentPage: string) {
			return mangaSlug === currentPage ? "currentManga badge-background" : "";
		},
		getChapterDate(chapter: Chapter) {
			function pad(v: number, amount: number = 2) {
				return v.toString().padStart(amount, "0");
			}
			let d = new Date(chapter.date);
			return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${pad(d.getFullYear(), 4)}`
		},
		getPageProgress(progress: Progress | void) {
			if(!progress) return false;
			return progress.percentage < 90 ? progress.current : 1;
		},
		ifDev(options) {
			return !!process.env.dev ? options.fn(this) : options.inverse(this);
		},
		getChapterName(progress: Progress, manga: StoredData) {
			if(!progress) return "shrug";
			let current = manga.data.chapters.find(v => v.hrefString === progress.chapterId);
			return current ? current.label : "Unknown chapter";
		},
		ifNotByCreator(list: List, options) {
			return list.byCreator ? options.inverse() : options.fn();
		},
		addOne(num: number) {
			return (num + 1);
		},
		getIconSrc
	}
}));
app.set("view engine", "handlebars");
app.set("view options", {
	layout: "main"
});

// Bodyparser
app.use(bodyParser.json());

// Routers
app.use("/", routers.home);
app.use("/search", routers.search);
app.use("/lists", routers.lists);
app.use("/", routers.settings);

// Static assets
app.use(express.static("public"));

// More routers
app.use("/", routers.mangaPage);
app.use("*", routers.notFound);

export default app;