import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";
import routers from "./routers"


import { StoredData } from "./types";

const app = express();

// Set up view engine
app.engine("handlebars", handlebars({
	helpers: {
		stringify: (v: any) => JSON.stringify(v),
		getProgressString(manga: StoredData) {
			if(manga.progress && manga.success) {
				// let progressString = 
				let curChapter = manga.data.chapters.find(c => c.chapter === manga.progress.chapter && c.season === manga.progress.season);
				return curChapter?.label + (manga.progress.percentage ? ` (${manga.progress.percentage}%)` : "") ?? "Chapter not found";
			};
			return "Not started yet";
		},
		genLink(manga: StoredData, toChapter: boolean) {
			return `/${manga.constant.slug}${toChapter ? `/${manga.progress.season}-${manga.progress.chapter}` : ""}/${manga.progress ? `#${manga.progress.current}` : ""}`;
		},
		isCurrentChapter(season1: number, season2: number, chapter1: number, chapter2: number) {
			return season1 === season2 && chapter1 === chapter2 ? "currentChapter badge-background" : "";
		},
		checkSmallHighlight(mangaSlug: string, currentPage: string) {
			return mangaSlug === currentPage ? "currentManga badge-background" : "";
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

// Static assets
app.use(express.static("public"));

// More routers
app.use("/", routers.mangaPage);


export default app;