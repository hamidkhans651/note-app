CREATE TABLE "groups" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "url_to_groups" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" text NOT NULL,
	"group_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "group_urls" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "url_to_groups" ADD CONSTRAINT "url_to_groups_url_id_group_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."group_urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "url_to_groups" ADD CONSTRAINT "url_to_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_urls" ADD CONSTRAINT "group_urls_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;