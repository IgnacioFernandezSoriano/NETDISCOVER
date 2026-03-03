CREATE TABLE `actionProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`userId` int NOT NULL,
	`actionId` varchar(64) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actionProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`questionId` int NOT NULL,
	`value` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
	`currentPhaseIndex` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`scores` json,
	`gaps` json,
	`actionPlan` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `benchmarkSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(100) NOT NULL DEFAULT 'global',
	`entityType` varchar(64) NOT NULL DEFAULT 'all',
	`data` json NOT NULL,
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `benchmarkSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEs` varchar(200) NOT NULL,
	`nameEn` varchar(200) NOT NULL,
	`descriptionEs` text,
	`descriptionEn` text,
	`category` enum('technology','consulting','training','measurement','rfid','platform','other') NOT NULL,
	`relevantPhases` json,
	`website` varchar(500),
	`contactEmail` varchar(320),
	`logoUrl` varchar(500),
	`caseStudies` json,
	`featured` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketProviders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`orderIndex` int NOT NULL,
	`titleEs` varchar(200) NOT NULL,
	`titleEn` varchar(200) NOT NULL,
	`descriptionEs` text,
	`descriptionEn` text,
	`icon` varchar(50),
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phases_id` PRIMARY KEY(`id`),
	CONSTRAINT `phases_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `providerContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`userId` int NOT NULL,
	`assessmentId` int,
	`message` text,
	`leadProfile` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `providerContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phaseId` int NOT NULL,
	`orderIndex` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`textEs` text NOT NULL,
	`textEn` text NOT NULL,
	`helpEs` text,
	`helpEn` text,
	`questionType` enum('yes_no','scale','multiple_choice') NOT NULL DEFAULT 'yes_no',
	`weight` decimal(4,2) NOT NULL DEFAULT '1.00',
	`options` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `questions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `entityType` enum('regulator','public_operator','private_operator','consultant','other');--> statement-breakpoint
ALTER TABLE `users` ADD `jobTitle` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `organization` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLang` enum('es','en') DEFAULT 'es' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);