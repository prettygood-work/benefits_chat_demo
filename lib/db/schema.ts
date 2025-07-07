import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
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
  index,
  uniqueIndex,
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

// Multi-tenant support tables
export const tenant = pgTable('Tenant', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 63 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  status: varchar('status', { length: 20, enum: ['active', 'inactive'] }).notNull().default('active'),
  settings: json('settings').$type<TenantSettings>().notNull().default({
    theme: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#64748b',
        accent: '#f97316',
        background: '#ffffff',
        foreground: '#0f172a',
        muted: '#f8fafc',
        mutedForeground: '#64748b',
        card: '#ffffff',
        cardForeground: '#0f172a',
        border: '#e2e8f0',
      },
      fonts: {
        sans: 'Inter',
        mono: 'JetBrains Mono',
      },
      radius: '0.5rem',
    },
    features: {
      voiceEnabled: false,
      fileUploadsEnabled: true,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['pdf', 'docx', 'txt', 'csv'],
      publicAccess: false,
      requireAuth: true,
    },
    branding: {
      logo: '/logo.svg',
      favicon: '/favicon.ico',
      companyName: 'Benefits Assistant',
      tagline: 'Your AI-powered benefits assistant',
    },
    ai: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful benefits advisor for employees. Be friendly, knowledgeable, and professional.',
      tone: 'professional',
      personality: 'knowledgeable and supportive',
    },
  }),
  metadata: json('metadata').$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('tenant_slug_idx').on(table.slug),
  statusIdx: index('tenant_status_idx').on(table.status),
}));

export const tenantUser = pgTable('TenantUser', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  tenantId: uuid('tenantId').notNull().references(() => tenant.id, { onDelete: 'cascade' }),
  userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20, enum: ['owner', 'admin', 'member'] }).notNull().default('member'),
  permissions: json('permissions').$type<string[]>().notNull().default([]),
  joinedAt: timestamp('joinedAt').notNull().defaultNow(),
}, (table) => ({
  tenantUserIdx: uniqueIndex('tenant_user_idx').on(table.tenantId, table.userId),
  userIdx: index('tenant_user_user_idx').on(table.userId),
}));

export const tenantChat = pgTable('TenantChat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  tenantId: uuid('tenantId').notNull().references(() => tenant.id, { onDelete: 'cascade' }),
  chatId: uuid('chatId').notNull().references(() => chat.id, { onDelete: 'cascade' }),
  metadata: json('metadata').$type<{
    department?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>().notNull().default({}),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
  tenantChatIdx: uniqueIndex('tenant_chat_idx').on(table.tenantId, table.chatId),
  chatIdx: index('tenant_chat_chat_idx').on(table.chatId),
}));

// Type exports
export type TenantSettings = InferSelectModel<typeof tenant>['settings'];
export type Tenant = InferSelectModel<typeof tenant>;
export type NewTenant = InferInsertModel<typeof tenant>;
export type TenantUser = InferSelectModel<typeof tenantUser>;
export type NewTenantUser = InferInsertModel<typeof tenantUser>;
export type TenantChat = InferSelectModel<typeof tenantChat>;
export type NewTenantChat = InferInsertModel<typeof tenantChat>;

// Add UserProfile and BenefitsPlan if they don't exist
export const userProfile = pgTable('UserProfile', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  familySize: integer('familySize').notNull().default(1),
  budgetPriority: varchar('budgetPriority', { length: 50 }).notNull().default('low_premium'),
  medicalConditions: json('medicalConditions').$type<string[]>().notNull().default([]),
  riskTolerance: varchar('riskTolerance', { length: 50 }).notNull().default('medium'),
});

export const benefitsPlan = pgTable('BenefitsPlan', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50, enum: ['HMO', 'PPO', 'HDHP'] }).notNull(),
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
  features: json('features').$type<string[]>().notNull().default([]),
});

export type UserProfile = InferSelectModel<typeof userProfile>;
export type BenefitsPlan = InferSelectModel<typeof benefitsPlan>;
