
// Import modules
import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";

// Import custom modules
import routers from "./routers"
import { StoredData, Chapter, Progress } from "./types";

const app = express();

// Set up view engine
app.engine("handlebars", handlebars({
	helpers: {
		stringify: (v: any) => JSON.stringify(v),
		getProgressString(manga: StoredData) {
			if(manga.progress && manga.success) {
				// let progressString = 
				let curChapter = manga.data.chapters.find(c => c.chapter === manga.progress.chapter && c.season === manga.progress.season);
				return curChapter?.label + (typeof manga?.progress?.percentage !== "undefined" ? ` (${manga.progress.percentage}%)` : "") ?? "Chapter not found";
			};
			return "Not started yet";
		},
		genLink2(slug: string, season: number = null, episode: number = null, page: number = null) {
			let href = `/${slug}/`;
			let seasonLink = season !== null && episode !== null ? `${season}-${episode}/` : "";
			// let pageLink = page ? `#${page}` : "";
			let pageLink = ""; // I'm going to try replacing the # with an on-page attribute to fix some issues
			return `${href}${seasonLink}${pageLink}`;
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
		}
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
app.use("/backups", routers.backups);
app.use("/lists", routers.lists);

// Static assets
app.use(express.static("public"));

// More routers
app.use("/", routers.mangaPage);
app.use("*", routers.notFound);

export default app;