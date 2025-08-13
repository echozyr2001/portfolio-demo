CREATE TABLE `project_tags` (
	`project_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content_storage_type` text DEFAULT 'database' NOT NULL,
	`mdx_content` text,
	`s3_bucket` text,
	`s3_key` text,
	`s3_url` text,
	`github_url` text,
	`live_url` text,
	`image_url` text,
	`technologies` text,
	`status` text DEFAULT 'draft',
	`featured` integer DEFAULT false,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`author_name` text NOT NULL,
	`author_email` text NOT NULL,
	`post_id` text NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "content", "status", "created_at", "updated_at", "author_name", "author_email", "post_id", "parent_id") SELECT "id", "content", "status", "created_at", "updated_at", "author_name", "author_email", "post_id", "parent_id" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `media` ADD `storage_type` text DEFAULT 'base64' NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `base64_data` text;--> statement-breakpoint
ALTER TABLE `media` ADD `thumbnail_base64` text;--> statement-breakpoint
ALTER TABLE `media` ADD `s3_bucket` text;--> statement-breakpoint
ALTER TABLE `media` ADD `s3_key` text;--> statement-breakpoint
ALTER TABLE `media` ADD `s3_url` text;--> statement-breakpoint
ALTER TABLE `media` ADD `width` integer;--> statement-breakpoint
ALTER TABLE `media` ADD `height` integer;--> statement-breakpoint
ALTER TABLE `media` ADD `blurhash` text;--> statement-breakpoint
ALTER TABLE `media` ADD `compression_ratio` real;--> statement-breakpoint
ALTER TABLE `media` ADD `optimized_size` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `content_storage_type` text DEFAULT 'database' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `mdx_content` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `s3_bucket` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `s3_key` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `s3_url` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `reading_time` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `word_count` integer;