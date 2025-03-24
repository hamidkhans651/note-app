CREATE TABLE "notes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"pinned" timestamp,
	"group_id" text,
	"is_url" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "trash" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp DEFAULT now(),
	"group_id" text,
	"is_url" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "group_urls" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trash" ADD CONSTRAINT "trash_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;