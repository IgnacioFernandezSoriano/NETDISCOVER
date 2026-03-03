ALTER TABLE `questions` MODIFY COLUMN `questionType` enum('yes_no','scale','multiple_choice','barrier') NOT NULL DEFAULT 'scale';--> statement-breakpoint
ALTER TABLE `answers` ADD `barrierValue` varchar(200);--> statement-breakpoint
ALTER TABLE `phases` ADD `scoringExcluded` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `phases` ADD `titleFr` varchar(200);--> statement-breakpoint
ALTER TABLE `phases` ADD `descriptionFr` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `textFr` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `helpFr` text;