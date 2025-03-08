CREATE TABLE "list_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"list_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"manga_id" varchar NOT NULL,
	"chapter_id" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" varchar NOT NULL,
	"current_page" integer NOT NULL,
	"total_pages" integer NOT NULL,
	CONSTRAINT "progress_items_user_id_chapter_id_manga_id_unique" UNIQUE("user_id","chapter_id","manga_id")
);
