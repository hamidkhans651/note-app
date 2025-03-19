CREATE TABLE "group_urls" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "group_urls_url_unique" UNIQUE("url")
);
