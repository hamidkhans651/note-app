CREATE TABLE "archived_notes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"archived_at" timestamp DEFAULT now(),
	"group_id" text,
	"is_url" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "group_urls" ADD COLUMN "is_archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "is_archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "archived_notes" ADD CONSTRAINT "archived_notes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;