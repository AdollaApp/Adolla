CREATE TABLE "sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" varchar NOT NULL,
	"security_stamp" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"security_stamp" varchar NOT NULL,
	"discord_id" varchar,
	"roles" varchar[],
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "discord_id" UNIQUE NULLS NOT DISTINCT("discord_id")
);
