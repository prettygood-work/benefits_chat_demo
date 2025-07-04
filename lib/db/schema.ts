import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const benefitsPlans = pgTable('BenefitsPlans', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('clientId').notNull(), // For multi-tenant support
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { enum: ['HMO', 'PPO', 'HDHP', 'EPO'] }).notNull(),
  description: text('description'),
  monthlyPremium: json('monthlyPremium').$type<{
    individual: number;
    employeeSpouse: number;
    employeeChild: number;
    family: number;
  }>().notNull(),
  deductible: json('deductible').$type<{
    individual: number;
    family: number;
  }>().notNull(),
  outOfPocketMax: json('outOfPocketMax').$type<{
    individual: number;
    family: number;
  }>().notNull(),
  copays: json('copays').$type<{
    primaryCare: number;
    specialist: number;
    urgentCare: number;
    emergencyRoom: number;
  }>().notNull(),
  prescriptionCoverage: json('prescriptionCoverage').$type<{
    generic: number;
    brand: number;
    specialty: number;
  }>().notNull(),
  features: json('features').$type<string[]>().default([]),
  networkName: varchar('networkName', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const userProfiles = pgTable('UserProfiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('sessionId', { length: 255 }).notNull().unique(),
  familySize: integer('familySize').default(1),
  age: integer('age'),
  location: varchar('location', { length: 255 }),
  medicalConditions: json('medicalConditions').$type<string[]>().default([]),
  currentMedications: json('currentMedications').$type<string[]>().default([]),
  preferredDoctors: json('preferredDoctors').$type<string[]>().default([]),
  budgetPriority: varchar('budgetPriority', { 
    enum: ['low_premium', 'low_deductible', 'comprehensive', 'flexibility'] 
  }),
  riskTolerance: varchar('riskTolerance', { enum: ['low', 'medium', 'high'] }),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const clientConfigs = pgTable('ClientConfigs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  theme: json('theme').$type<{
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      fontFamily: string;
      fontSize: Record<string, string>;
    };
    branding: {
      logo?: string;
      companyName: string;
      tagline?: string;
    };
    personality: {
      tone: 'professional' | 'friendly' | 'technical';
      formality: 'formal' | 'conversational';
    };
  }>().notNull(),
  messaging: json('messaging').$type<{
    welcomeMessage: string;
    fallbackResponses: string[];
    specialtyPrompts: Record<string, string>;
  }>().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const analyticsEvents = pgTable('AnalyticsEvents', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('sessionId', { length: 255 }).notNull(),
  clientId: uuid('clientId'),
  eventType: varchar('eventType', {
    enum: ['conversation_start', 'plan_compared', 'cost_calculated', 'recommendation_viewed', 'satisfaction_rated']
  }).notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type BenefitsPlan = InferSelectModel<typeof benefitsPlans>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type ClientConfig = InferSelectModel<typeof clientConfigs>;
export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
