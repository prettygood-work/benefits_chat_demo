CREATE TABLE IF NOT EXISTS "AnalyticsEvents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionId" varchar(255) NOT NULL,
	"clientId" uuid,
	"eventType" varchar NOT NULL,
	"metadata" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BenefitsPlans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar NOT NULL,
	"description" text,
	"monthlyPremium" json NOT NULL,
	"deductible" json NOT NULL,
	"outOfPocketMax" json NOT NULL,
	"copays" json NOT NULL,
	"prescriptionCoverage" json NOT NULL,
	"features" json DEFAULT '[]'::json,
	"networkName" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ClientConfigs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"theme" json NOT NULL,
	"messaging" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserProfiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionId" varchar(255) NOT NULL,
	"familySize" integer DEFAULT 1,
	"age" integer,
	"location" varchar(255),
	"medicalConditions" json DEFAULT '[]'::json,
	"currentMedications" json DEFAULT '[]'::json,
	"preferredDoctors" json DEFAULT '[]'::json,
	"budgetPriority" varchar,
	"riskTolerance" varchar,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserProfiles_sessionId_unique" UNIQUE("sessionId")
);
