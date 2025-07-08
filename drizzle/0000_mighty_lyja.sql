CREATE TABLE `cn_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`good_category` text,
	`description` text,
	`see_direct` real,
	`see_indirect` real
);
--> statement-breakpoint
CREATE TABLE `goods` (
	`id` integer PRIMARY KEY NOT NULL,
	`supplier_id` integer,
	`cn_code_id` integer,
	`quantity` integer,
	`production_method_code` text,
	`production_method_desc` text,
	`customer_proc_code` text,
	`customer_proc_desc` text,
	`remarks` text,
	`date` text,
	`see_direct` real,
	`see_indirect` real
);
--> statement-breakpoint
CREATE TABLE `goods_imports` (
	`id` integer PRIMARY KEY NOT NULL,
	`supplier_id` integer,
	`cn_code` text,
	`goods_description` text,
	`quarter` text,
	`imported_amount` real,
	`unit` text,
	`imported_value` real,
	`currency` text
);
--> statement-breakpoint
CREATE TABLE `persons` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `supplier_cn_code_mappings` (
	`supplier_id` integer NOT NULL,
	`cn_code_id` integer NOT NULL,
	PRIMARY KEY(`supplier_id`, `cn_code_id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`supplier_id` integer NOT NULL,
	`filename` text NOT NULL,
	`date_received` text NOT NULL,
	`document_type` text NOT NULL,
	`filesize` integer NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`country` text,
	`city` text,
	`street` text,
	`street_num` text,
	`addr_additional_line` text,
	`post_code` text,
	`contact_person_id` integer,
	`company_mail` text,
	`latitude` real,
	`longitude` real,
	`remarks` text,
	`emission_data_status` text,
	`emission_data_valid_until` integer,
	`consulting` integer,
	`consulting_hours` integer,
	`last_update` text
);
