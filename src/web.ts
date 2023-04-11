// Import modules
import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";

// Import custom modules
import routers from "./routers";
import { StoredData, Chapter, Progress, List } from "./types";
import getIconSrc from "./util/getIconSrc";
import { getProviderId } from "./routers/manga-page";
import db from "./db";

const app = express();

// Set up view engine
app.engine(
	"handlebars",
	handlebars({
		helpers: {
			stringify(v: Record<string, unknown>) {
				return JSON.stringify(v);
			},
			/**
			 * Get progress string to show on page, like 23%
			 */
			getProgressString(manga: StoredData) {
				if (manga.progress && manga.success) {
					const curChapter = manga.data.chapters.find(
						(c) => c.hrefString === manga.progress.chapterId
					);
					return (
						curChapter?.label +
							(typeof manga?.progress?.percentage !== "undefined"
								? ` (${manga.progress.percentage}%)`
								: "") ?? "Chapter not found"
					);
				}
				return "Not started yet";
			},
			/**
			 * Get icon for each scraper
			 */
			getScraperIcon(provider: string): string | null {
				const icons = {
					mangasee: "https://mangasee123.com/media/favicon.png",
					mangadex: "https://mangadex.org/images/misc/navbar.svg",
					mangadex5:
						"https://mangadex.siteunblocked.info/images/misc/navbar.svg?3",
					rco: "/provider/rco.png",
					nhentai: "https://nhentai.to/img/logo.650c98bbb08e.svg",
					nhentainet: "https://nhentai.net/favicon.ico",
					manganelo: "https://manganato.com/favicon-96x96.png",
					comicextra: "https://www.comicextra.com/images/site/front/logo.png",
					mangahere: "/proxy-image?url=https://www.mangahere.cc/favicon.ico",
					guya: "https://guya.moe/static/logo_small.png",
					gmanga: "https://gmanga.org/assets/product/gmanga/logo.png",
				};
				return icons[provider] ?? "/icons/main-on-white.png";
			},
			/**
			 * Generate HREF for links in-app
			 */
			genLink2(
				provider = "mangasee",
				slug: string,
				hrefString: string | null = null,
				chapter = -1
			) {
				const href = `/${getProviderId(provider)}/${slug}/`;
				let seasonLink =
					typeof hrefString === "string" || typeof hrefString === "number"
						? hrefString
						: "";
				if (typeof chapter === "number" && chapter !== -1)
					seasonLink = `${hrefString}-${chapter}`; // Fallback stuff // TODO: Figure this out. This is related to reading at manga-card.handlebars, line 31
				return `${href}${seasonLink}`;
			},
			/**
			 * Compare season/chapter to other season/chapter and get relevant classes
			 */
			isCurrentChapter(
				season1: number,
				season2: number,
				chapter1: number,
				chapter2: number
			) {
				return season1 === season2 && chapter1 === chapter2
					? "current-chapter badge-background"
					: "";
			},
			/**
			 * Used for small-manga in the sidebar
			 * Returns relevant classes to maybe make it blue
			 */
			checkSmallHighlight(mangaSlug: string, currentPage: string) {
				return mangaSlug === currentPage ? "currentManga badge-background" : "";
			},
			/**
			 * Get dd-mm-yyyy format for chapter's date
			 * Used in chapter list
			 */
			getChapterDate(chapter: Chapter) {
				function pad(v: number, amount = 2) {
					return v.toString().padStart(amount, "0");
				}
				const d = new Date(chapter.date);
				return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${pad(
					d.getFullYear(),
					4
				)}`;
			},
			/**
			 * Get chapter's existing progress
			 * If it's over 90%, return page number 1 so that people can start the chapter over again
			 */
			getPageProgress(progress: Progress | void) {
				if (!progress) return false;
				return progress.percentage < 90 ? progress.current : 1;
			},
			/**
			 * If statement, used for development
			 * AFAIK this is just for the label in the bottom left
			 */
			ifDev(options) {
				return process.env.dev ? options.fn(this) : options.inverse(this);
			},
			/**
			 * Get chapter's name, or label
			 * Used in the main cards
			 */
			getChapterName(progress: Progress, manga: StoredData) {
				if (!progress) return "shrug";
				const current = manga.data.chapters.find(
					(v) => v.hrefString === progress.chapterId
				);
				return current ? current.label : "Unknown chapter";
			},
			/**
			 * If statement for checking if the list is by the creator
			 */
			ifNotByCreator(list: List, options) {
				return list.byCreator ? options.inverse() : options.fn();
			},
			getIconSrc,
			/**
			 * Get app theme options
			 */
			getThemeOptions() {
				const colors = db.get("settings.theme") || {};

				const colorArray = Object.entries(colors)
					.map(([key, value]) => {
						return `--${key}: ${value}`;
					})
					.join(";");

				return colorArray;
			},
			getThemeColor() {
				return db.get("settings.theme")?.badge || "#4babce";
			},
		},
	})
);

app.set("view engine", "handlebars");
app.set("view options", {
	layout: "main",
});

// Bodyparser
app.use(bodyParser.json());

// Routers
app.use("/", routers.home);
app.use("/search", routers.search);
app.use("/lists", routers.lists);
app.use("/subscribe", routers.notifs);
app.use("/", routers.settings);

// Static assets
app.use(express.static("public"));

// More routers
app.use("/", routers.mangaPage);
app.use("*", routers.notFound);

export default app;
