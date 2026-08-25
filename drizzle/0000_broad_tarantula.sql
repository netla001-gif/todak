CREATE TABLE `place_feedback` (
	`place_id` text PRIMARY KEY NOT NULL,
	`rating` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
