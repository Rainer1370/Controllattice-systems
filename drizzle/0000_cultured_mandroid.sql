CREATE TABLE `exchange_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_moderation_log` (
	`id` text PRIMARY KEY NOT NULL,
	`moderator_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`moderator_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exchange_oauth` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`verifier` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_reactions` (
	`user_id` text NOT NULL,
	`thread_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `thread_id`),
	FOREIGN KEY (`user_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`thread_id`) REFERENCES `exchange_threads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exchange_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`parent_id` text,
	`author_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `exchange_threads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchange_replies_feed` ON `exchange_replies` (`thread_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `exchange_reply_author` ON `exchange_replies` (`author_id`);--> statement-breakpoint
CREATE TABLE `exchange_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchange_reports_queue` ON `exchange_reports` (`status`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `exchange_report_once` ON `exchange_reports` (`user_id`,`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `exchange_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`csrf` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchange_session_user` ON `exchange_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `exchange_session_expiry` ON `exchange_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `exchange_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`pinned` integer DEFAULT 0 NOT NULL,
	`locked` integer DEFAULT 0 NOT NULL,
	`starter` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `exchange_topics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `exchange_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchange_feed` ON `exchange_threads` (`status`,`pinned`,`created_at`);--> statement-breakpoint
CREATE INDEX `exchange_category` ON `exchange_threads` (`topic_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `exchange_thread_author` ON `exchange_threads` (`author_id`);--> statement-breakpoint
CREATE TABLE `exchange_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_sub` text,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`trusted` integer DEFAULT 0 NOT NULL,
	`banned` integer DEFAULT 0 NOT NULL,
	`organization` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exchange_users_google_sub_unique` ON `exchange_users` (`google_sub`);