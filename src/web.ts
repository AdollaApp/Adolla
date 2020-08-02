import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";
import routers from "./routers"


import { StoredData, Progress } from "./types";

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
		genLink(manga: StoredData, toChapter: boolean, progress: Progress | null = null, href: string | null = null) {

			// @ts-ignore Handlebars sucks.
			if(!href || href.hash) href = `/${manga.constant.slug}${toChapter ? `/${manga.progress.season}-${manga.progress.chapter}` : ""}`
			let suffix = progress ? `#${progress.current}` : "";
			return `${href}${suffix}`;

		},
		genLink2(slug: string, season: number = null, episode: number = null, page: number = null) {
			let href = `/${slug}/`;
			let seasonLink = season && episode ? `${season}-${episode}/` : "";
			let pageLink = page ? `#${page}` : "";
			return `${href}${seasonLink}${pageLink}`;
		},
		isCurrentChapter(season1: number, season2: number, chapter1: number, chapter2: number) {
			return season1 === season2 && chapter1 === chapter2 ? "current-chapter badge-background" : "";
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