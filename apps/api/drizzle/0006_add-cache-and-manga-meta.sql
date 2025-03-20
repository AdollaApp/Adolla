CREATE TABLE "cache_items" (
	"key" varchar PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"data" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga_metas" (
	"id" varchar PRIMARY KEY NOT NULL,
	"data" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_items" ADD COLUMN "manga_meta_id" varchar;--> statement-breakpoint
ALTER TABLE "progress_items" ADD COLUMN "manga_meta_id" varchar;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_manga_meta_id_manga_metas_id_fk" FOREIGN KEY ("manga_meta_id") REFERENCES "public"."manga_metas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_items" ADD CONSTRAINT "progress_items_manga_meta_id_manga_metas_id_fk" FOREIGN KEY ("manga_meta_id") REFERENCES "public"."manga_metas"("id") ON DELETE restrict ON UPDATE no action;