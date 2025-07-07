# Phase 1: Multi-Tenant Foundation - Implementation Status

## 🎯 PHASE 1 COMPLETION STATUS: 85% Complete

### ✅ COMPLETED FEATURES
1. **Multi-tenant database schema** - Tenant, TenantUser, TenantChat tables with proper isolation
2. **Subdomain routing** - Middleware redirects `tenant.domain.com` to `/t/[tenant]`
3. **Tenant authentication** - Role-based access control (owner/admin/member)
4. **Admin dashboard** - Complete tenant management interface at `/admin`
5. **Tenant theming** - Dynamic CSS variables for tenant-specific branding
6. **Basic chat integration** - Tenant-aware chat API with access control
7. **Provider components** - TenantProvider and TenantThemeProvider for React context
8. **API routes** - Tenant CRUD operations at `/api/admin/tenants`
9. **Linting & formatting** - Standardized with Biome, removed npm references
10. **Component architecture** - Admin components, tenant components, UI components

### 🔄 IN PROGRESS (15% remaining)
1. **Complete chat persistence** - Save tenant chats to database
2. **Guest authentication** - Allow public tenant access
3. **Error boundaries** - Tenant-specific error handling
4. **Loading states** - Better UX during tenant operations

### 📋 REMAINING PHASE 1 TASKS

#### Task 1: Complete Chat Persistence (2-3 hours)
**Purpose**: Ensure all tenant chats are properly saved to database
**Files to modify**:
- `app/api/chat/route.ts` - Add proper chat saving logic
- `lib/db/queries.ts` - Import and use existing chat functions
**Status**: 🔄 In Progress

#### Task 2: Implement Guest Access (1-2 hours)  
**Purpose**: Allow public tenant access without authentication
**Files to modify**:
- `app/t/[tenant]/page.tsx` - Handle guest users properly
- `components/tenant/tenant-chat.tsx` - Guest chat experience
**Status**: 📋 Pending

#### Task 3: Add Error Boundaries (1 hour)
**Purpose**: Graceful error handling for tenant operations
**Files to create**:
- `components/error-boundary.tsx` - React error boundary
- `app/t/[tenant]/error.tsx` - Tenant-specific error page
**Status**: 📋 Pending

#### Task 4: Loading States (1 hour)
**Purpose**: Better UX during tenant operations
**Files to modify**:
- `components/ui/loading-screen.tsx` - Enhanced loading component
- `app/t/[tenant]/loading.tsx` - Tenant loading page
**Status**: 📋 Pending

#### Task 5: Production Deployment Setup (30 mins)
**Purpose**: Configure for Vercel deployment
**Files to modify**:
- `vercel.json` - Deployment configuration
- Environment variables documentation
**Status**: 📋 Pending

---

## 🏗️ MULTI-TENANT ARCHITECTURE AUDIT

### ✅ Core Multi-Tenant Files (Completed)

#### Database Layer
- **`lib/db/schema.ts`** - Multi-tenant tables with proper foreign keys and isolation
- **`lib/db/queries/tenants.ts`** - Tenant CRUD operations with access control
- **`lib/db/migrate.ts`** - Database migration support
- **`migrations/create_default_tenant.sql`** - SQL migration for existing installations

#### Authentication & Authorization  
- **`app/(auth)/auth.ts`** - Enhanced with tenant context and role-based permissions
- **`middleware.ts`** - Subdomain routing with tenant isolation
- **`lib/cache.ts`** - Caching layer for tenant data

#### API Routes
- **`app/api/admin/tenants/route.ts`** - Tenant management endpoints
- **`app/api/chat/route.ts`** - Tenant-aware chat processing
- **`app/t/[tenant]/layout.tsx`** - Tenant route wrapper with theme application

#### React Components
- **`components/providers/tenant-provider.tsx`** - Tenant context provider
- **`components/providers/tenant-theme-provider.tsx`** - Dynamic theme application  
- **`components/tenant/tenant-chat.tsx`** - Tenant-specific chat interface
- **`components/tenant/tenant-chat-header.tsx`** - Tenant branding header
- **`components/tenant/tenant-welcome-message.tsx`** - Tenant welcome screen

#### Admin Interface
- **`app/admin/layout.tsx`** - Admin dashboard layout
- **`app/admin/page.tsx`** - Admin dashboard overview
- **`components/admin/admin-sidebar.tsx`** - Admin navigation
- **`components/admin/admin-header.tsx`** - Admin header with user actions
- **`components/admin/tenant-list.tsx`** - Tenant management cards
- **`components/admin/tenant-stats.tsx`** - Tenant analytics display
- **`components/admin/quick-actions.tsx`** - Admin quick actions
- **`components/admin/create-tenant-form.tsx`** - Tenant creation form

#### UI Components
- **`components/ui/loading-screen.tsx`** - Loading state component
- **`components/ui/loading-card.tsx`** - Card loading skeleton
- **`components/ui/avatar.tsx`** - User avatar component
- **`components/ui/badge.tsx`** - Status badges

#### Configuration & Styling
- **`app/globals.css`** - Tenant-specific CSS variables and theming
- **`package.json`** - Updated scripts, standardized pnpm usage
- **`biome.jsonc`** - Code formatting and linting configuration

---

## 🔧 STANDARDIZED TOOLING

### Linting & Formatting
- **Primary**: Biome for fast formatting and linting
- **Secondary**: ESLint for Next.js specific rules
- **Commands**: 
  - `pnpm lint` - Run linting
  - `pnpm format` - Format code
  - `pnpm type-check` - TypeScript checking

### Package Management
- **Tool**: pnpm (npm references removed)
- **Scripts**: All use pnpm commands
- **Installation**: `pnpm add <package>`

### Development Workflow
- **Build**: `pnpm build` - Includes migration + Next.js build
- **Dev**: `pnpm dev` - Development server with Turbo
- **Test**: `pnpm test` - Playwright testing
- **Database**: `pnpm db:*` commands for all DB operations

---

## 🚀 DEPLOYMENT READINESS

### Environment Variables Required
```env
# Database
POSTGRES_URL=postgresql://...

# Authentication  
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

# Tenant Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ROOT_DOMAIN=your-domain.com

# AI Configuration (Optional)
OPENAI_API_KEY=sk-...
```

### Vercel Configuration
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Node Version**: 18.x
- **Environment**: Production variables set

### DNS Configuration
- **Wildcard DNS**: `*.your-domain.com` → Vercel
- **Root Domain**: `your-domain.com` → Main app
- **Admin Subdomain**: `admin.your-domain.com` → Admin dashboard

---

## Phase 1: Multi-Tenant Foundation - Complete Implementation

## System Architecture Overview

### Current Repository Structure Analysis

- **Authentication**: Custom auth system at `app/(auth)/auth.ts`
- **Database**: PostgreSQL with Drizzle ORM
- **Existing Tables**: user, chat, message_v2, document, suggestion, vote_v2, stream
- **UI Framework**: Next.js 15.3.0 with App Router
- **Component Library**: shadcn/ui
- **Error Handling**: ChatSDKError pattern

### Phase 1 Objective

Transform the single-tenant chat application into a multi-tenant platform while preserving ALL existing functionality.

---

## File 1: Database Schema Extension

**Location**: `lib/db/schema.ts`  
**Interactions**:

- Imports from `drizzle-orm/pg-core`
- Referenced by `lib/db/queries.ts` and new `lib/db/queries/tenants.ts`
- Used by migration system

**Implementation**:

```typescript
// ADD to existing imports at the top of the file
import { integer, index, uniqueIndex } from 'drizzle-orm/pg-core';

// ADD these tables at the END of the file, after the 'stream' table

// Multi-tenant support tables
export const tenant = pgTable('Tenant', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 63 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  settings: json('settings').$type<{
    theme: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        card: string;
        cardForeground: string;
        border: string;
      };
      fonts: {
        sans: string;
        mono: string;
      };
      radius: string;
    };
    features: {
      voiceEnabled: boolean;
      fileUploadsEnabled: boolean;
      maxFileSize: number;
      allowedFileTypes: string[];
      publicAccess: boolean;
      requireAuth: boolean;
    };
    branding: {
      logo: string;
      favicon: string;
      companyName: string;
      tagline?: string;
    };
    ai: {
      model: string;
      temperature: number;
      maxTokens: number;
      systemPrompt: string;
      tone: 'professional' | 'friendly' | 'casual' | 'technical';
      personality: string;
    };
  }>().notNull().default({
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
    },
    ai: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful benefits advisor...',
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
export type Tenant = InferSelectModel<typeof tenant>;
export type TenantUser = InferSelectModel<typeof tenantUser>;
export type TenantChat = InferSelectModel<typeof tenantChat>;
```

**GitHub Copilot Prompt**:

```
In lib/db/schema.ts, add the integer, index, and uniqueIndex imports from drizzle-orm/pg-core to the existing imports. Then, at the end of the file after the stream table, add three new tables: tenant, tenantUser, and tenantChat. These tables enable multi-tenant support. Include proper indexes and foreign key relationships. Export TypeScript types for each new table.
```

---

## File 2: Tenant Database Queries

**Location**: `lib/db/queries/tenants.ts` (NEW FILE)  
**Interactions**:

- Imports from `lib/db/schema.ts`
- Imports from `lib/errors.ts` for ChatSDKError
- Used by API routes and server components

**Implementation**:

```typescript
import 'server-only';

import { and, eq, inArray, desc, asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { tenant, tenantUser, tenantChat, user, chat } from '../schema';
import type { Tenant, TenantUser } from '../schema';
import { ChatSDKError } from '../../errors';

// Use the same client pattern as queries.ts
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// Get tenant by slug (for subdomain routing)
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    const [result] = await db
      .select()
      .from(tenant)
      .where(and(
        eq(tenant.slug, slug.toLowerCase()),
        eq(tenant.status, 'active')
      ))
      .limit(1);
    
    return result || null;
  } catch (error) {
    console.error('Failed to get tenant by slug:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to retrieve tenant');
  }
}

// Get tenant by ID
export async function getTenantById(id: string): Promise<Tenant | null> {
  try {
    const [result] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, id))
      .limit(1);
    
    return result || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to retrieve tenant by ID');
  }
}

// Create new tenant
export async function createTenant(data: {
  name: string;
  slug: string;
  ownerId: string;
  settings?: Partial<Tenant['settings']>;
}): Promise<Tenant> {
  try {
    // Start transaction
    const [newTenant] = await db.transaction(async (tx) => {
      // Create tenant
      const [createdTenant] = await tx
        .insert(tenant)
        .values({
          name: data.name,
          slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          settings: data.settings as Tenant['settings'] || undefined,
          updatedAt: new Date(),
        })
        .returning();
      
      // Add owner as admin
      await tx.insert(tenantUser).values({
        tenantId: createdTenant.id,
        userId: data.ownerId,
        role: 'owner',
        permissions: ['*'], // All permissions
      });
      
      return [createdTenant];
    });
    
    return newTenant;
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw new ChatSDKError('bad_request:validation', 'A tenant with this slug already exists');
    }
    throw new ChatSDKError('bad_request:database', 'Failed to create tenant');
  }
}

// Update tenant
export async function updateTenant(
  id: string, 
  data: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Tenant> {
  try {
    const [updated] = await db
      .update(tenant)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, id))
      .returning();
    
    if (!updated) {
      throw new ChatSDKError('not_found', 'Tenant not found');
    }
    
    return updated;
  } catch (error) {
    if (error instanceof ChatSDKError) throw error;
    throw new ChatSDKError('bad_request:database', 'Failed to update tenant');
  }
}

// Get user's tenants
export async function getUserTenants(userId: string): Promise<Array<{
  tenant: Tenant;
  role: string;
  permissions: string[];
}>> {
  try {
    const results = await db
      .select({
        tenant: tenant,
        role: tenantUser.role,
        permissions: tenantUser.permissions,
      })
      .from(tenantUser)
      .innerJoin(tenant, eq(tenantUser.tenantId, tenant.id))
      .where(and(
        eq(tenantUser.userId, userId),
        eq(tenant.status, 'active')
      ))
      .orderBy(desc(tenantUser.joinedAt));
    
    return results;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to retrieve user tenants');
  }
}

// Check if user has access to tenant
export async function userCanAccessTenant(
  userId: string, 
  tenantId: string,
  requiredRole?: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  try {
    const [access] = await db
      .select({
        role: tenantUser.role,
      })
      .from(tenantUser)
      .where(and(
        eq(tenantUser.userId, userId),
        eq(tenantUser.tenantId, tenantId)
      ))
      .limit(1);
    
    if (!access) return false;
    
    if (!requiredRole) return true;
    
    // Role hierarchy: owner > admin > member
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    return roleHierarchy[access.role] >= roleHierarchy[requiredRole];
  } catch (error) {
    console.error('Access check failed:', error);
    return false;
  }
}

// Add user to tenant
export async function addUserToTenant(
  tenantId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member',
  addedBy?: string
): Promise<TenantUser> {
  try {
    // Verify the user exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    if (!existingUser) {
      throw new ChatSDKError('not_found', 'User not found');
    }
    
    // Check if already a member
    const existing = await db
      .select()
      .from(tenantUser)
      .where(and(
        eq(tenantUser.tenantId, tenantId),
        eq(tenantUser.userId, userId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      throw new ChatSDKError('bad_request:validation', 'User is already a member of this tenant');
    }
    
    const [newMember] = await db
      .insert(tenantUser)
      .values({
        tenantId,
        userId,
        role,
        permissions: role === 'owner' ? ['*'] : [],
      })
      .returning();
    
    return newMember;
  } catch (error) {
    if (error instanceof ChatSDKError) throw error;
    throw new ChatSDKError('bad_request:database', 'Failed to add user to tenant');
  }
}

// Get tenant chats
export async function getTenantChats(
  tenantId: string,
  options?: {
    userId?: string;
    limit?: number;
    cursor?: string;
  }
): Promise<Array<{
  chat: Chat;
  tenantMetadata: TenantChat['metadata'];
}>> {
  try {
    let query = db
      .select({
        chat: chat,
        tenantMetadata: tenantChat.metadata,
      })
      .from(tenantChat)
      .innerJoin(chat, eq(tenantChat.chatId, chat.id))
      .where(eq(tenantChat.tenantId, tenantId))
      .$dynamic();
    
    if (options?.userId) {
      query = query.where(eq(chat.userId, options.userId));
    }
    
    if (options?.cursor) {
      query = query.where(lt(chat.createdAt, new Date(options.cursor)));
    }
    
    query = query
      .orderBy(desc(chat.createdAt))
      .limit(options?.limit || 50);
    
    return await query;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to retrieve tenant chats');
  }
}

// Associate existing chat with tenant
export async function associateChatWithTenant(
  chatId: string,
  tenantId: string,
  metadata?: TenantChat['metadata']
): Promise<void> {
  try {
    await db.insert(tenantChat).values({
      tenantId,
      chatId,
      metadata: metadata || {},
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      // Already associated, ignore
      return;
    }
    throw new ChatSDKError('bad_request:database', 'Failed to associate chat with tenant');
  }
}

// Get all tenants (admin only)
export async function getAllTenants(options?: {
  limit?: number;
  offset?: number;
  status?: 'active' | 'inactive';
}): Promise<Tenant[]> {
  try {
    let query = db.select().from(tenant).$dynamic();
    
    if (options?.status) {
      query = query.where(eq(tenant.status, options.status));
    }
    
    query = query
      .orderBy(desc(tenant.createdAt))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    return await query;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to retrieve tenants');
  }
}
```

**GitHub Copilot Prompt**:

```
Create a new file lib/db/queries/tenants.ts following the exact patterns from lib/db/queries.ts. Include 'server-only' directive at the top. Use ChatSDKError for all error handling. Implement functions for: getTenantBySlug, getTenantById, createTenant (with transaction), updateTenant, getUserTenants, userCanAccessTenant, addUserToTenant, getTenantChats, associateChatWithTenant, and getAllTenants. All functions must handle errors properly and use the same postgres client pattern.
```

---

## File 3: Middleware for Subdomain Routing

**Location**: `middleware.ts` (ROOT - create or update)  
**Interactions**:

- Next.js request/response cycle
- Routes to `app/[tenant]/*`
- Preserves existing routes

**Implementation**:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Existing routes that should not be intercepted
const PROTECTED_ROUTES = [
  '/(chat)',
  '/(auth)', 
  '/api',
  '/_next',
  '/static',
  '/admin',
  '/login',
  '/register',
  '/reset-password',
];

// Static files and assets
const STATIC_EXTENSIONS = [
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.webp',
  '.css',
  '.js',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Skip middleware for static files
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next();
  }
  
  // Skip middleware for protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Extract subdomain
  const subdomain = getSubdomain(hostname);
  
  // If we have a valid subdomain (not www, not admin, not empty)
  if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'app') {
    // Rewrite to tenant route
    url.pathname = `/t/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }
  
  // For root domain without subdomain, continue normally
  return NextResponse.next();
}

function getSubdomain(hostname: string): string | null {
  // Handle localhost with port
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0];
    }
    return null;
  }
  
  // Handle production domains
  // Expected format: subdomain.domain.com or subdomain.domain.co.uk
  const parts = hostname.split('.');
  
  // We need at least subdomain.domain.tld
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
```

**GitHub Copilot Prompt**:

```
Create or update middleware.ts in the root directory. Implement subdomain detection that rewrites subdomain.domain.com to /t/[subdomain]. CRITICAL: Preserve all existing routes including /(chat), /(auth), /api, /admin. Skip middleware for static files. Handle both localhost (with subdomains like tenant.localhost:3000) and production domains. Use /t/ prefix for tenant routes to avoid conflicts.
```

---

## File 4: Tenant Route Layout

**Location**: `app/t/[tenant]/layout.tsx` (NEW FILE)  
**Interactions**:

- Imports from `lib/db/queries/tenants.ts`
- Wraps tenant pages
- Applies tenant theme

**Implementation**:

```typescript
import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/db/queries/tenants';
import { TenantProvider } from '@/components/providers/tenant-provider';
import { TenantThemeProvider } from '@/components/providers/tenant-theme-provider';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  // Fetch tenant data
  const tenant = await getTenantBySlug(params.tenant);
  
  if (!tenant) {
    notFound();
  }
  
  return (
    <TenantProvider tenant={tenant}>
      <TenantThemeProvider tenant={tenant}>
        <div className="min-h-screen tenant-root">
          {children}
        </div>
      </TenantThemeProvider>
    </TenantProvider>
  );
}

export async function generateMetadata({ params }: { params: { tenant: string } }) {
  const tenant = await getTenantBySlug(params.tenant);
  
  if (!tenant) {
    return {
      title: 'Not Found',
      description: 'The requested tenant could not be found.',
    };
  }
  
  return {
    title: `${tenant.settings.branding.companyName} - Benefits Assistant`,
    description: tenant.settings.branding.tagline || 'Your AI-powered benefits assistant',
    icons: {
      icon: tenant.settings.branding.favicon,
    },
    openGraph: {
      title: `${tenant.settings.branding.companyName} - Benefits Assistant`,
      description: tenant.settings.branding.tagline || 'Your AI-powered benefits assistant',
      images: [tenant.settings.branding.logo],
    },
  };
}
```

**GitHub Copilot Prompt**:

```
Create app/t/[tenant]/layout.tsx that fetches tenant by slug from params. If tenant not found, call notFound(). Wrap children in TenantProvider and TenantThemeProvider. Generate dynamic metadata using tenant branding. Use the settings structure from the tenant table schema.
```

---

## File 5: Tenant Chat Page

**Location**: `app/t/[tenant]/page.tsx` (NEW FILE)  
**Interactions**:

- Uses existing chat components from `app/(chat)`
- Applies tenant context
- Maintains chat functionality

**Implementation**:

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { getTenantBySlug, userCanAccessTenant } from '@/lib/db/queries/tenants';
import { TenantChat } from '@/components/tenant/tenant-chat';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface TenantPageProps {
  params: {
    tenant: string;
  };
}

export default async function TenantChatPage({ params }: TenantPageProps) {
  // Get current user
  const session = await auth();
  
  // Get tenant
  const tenant = await getTenantBySlug(params.tenant);
  
  if (!tenant) {
    redirect('/');
  }
  
  // For public tenants or authenticated users with access
  let hasAccess = tenant.settings.features.publicAccess || false;
  
  if (session?.user) {
    hasAccess = await userCanAccessTenant(session.user.id, tenant.id);
  }
  
  if (!hasAccess && !tenant.settings.features.publicAccess) {
    redirect(`/t/${params.tenant}/access-required`);
  }
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TenantChat 
        tenant={tenant}
        user={session?.user}
      />
    </Suspense>
  );
}
```

**GitHub Copilot Prompt**:

```
Create app/t/[tenant]/page.tsx that checks tenant access. Use auth() from app/(auth)/auth. If user lacks access and tenant isn't public, redirect to access-required page. Render TenantChat component with tenant and user props. Wrap in Suspense with LoadingScreen fallback.
```

---

## File 6: Tenant Provider Component

**Location**: `components/providers/tenant-provider.tsx` (NEW FILE)  
**Interactions**:

- Provides tenant context to child components
- Used by all tenant pages

**Implementation**:

```typescript
'use client';

import { createContext, useContext } from 'react';
import type { Tenant } from '@/lib/db/schema';

interface TenantContextValue {
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context.tenant;
}

export function useTenantId() {
  const tenant = useTenant();
  return tenant.id;
}

export function useTenantSettings() {
  const tenant = useTenant();
  return tenant.settings;
}
```

**GitHub Copilot Prompt**:

```
Create components/providers/tenant-provider.tsx as a client component. Create TenantContext with createContext. Export TenantProvider component and custom hooks: useTenant, useTenantId, and useTenantSettings. Include proper TypeScript types and error handling.
```

---

## File 7: Tenant Theme Provider

**Location**: `components/providers/tenant-theme-provider.tsx` (NEW FILE)  
**Interactions**:

- Applies tenant theme via CSS variables
- Works with existing theme system

**Implementation**:

```typescript
'use client';

import { useEffect } from 'react';
import type { Tenant } from '@/lib/db/schema';

interface TenantThemeProviderProps {
  tenant: Tenant;
  children: React.ReactNode;
}

export function TenantThemeProvider({ tenant, children }: TenantThemeProviderProps) {
  useEffect(() => {
    // Apply tenant theme colors as CSS variables
    const root = document.documentElement;
    const colors = tenant.settings.theme.colors;
    
    // Set color variables
    root.style.setProperty('--tenant-primary', colors.primary);
    root.style.setProperty('--tenant-secondary', colors.secondary);
    root.style.setProperty('--tenant-accent', colors.accent);
    root.style.setProperty('--tenant-background', colors.background);
    root.style.setProperty('--tenant-foreground', colors.foreground);
    root.style.setProperty('--tenant-muted', colors.muted);
    root.style.setProperty('--tenant-muted-foreground', colors.mutedForeground);
    root.style.setProperty('--tenant-card', colors.card);
    root.style.setProperty('--tenant-card-foreground', colors.cardForeground);
    root.style.setProperty('--tenant-border', colors.border);
    
    // Set font variables
    root.style.setProperty('--tenant-font-sans', tenant.settings.theme.fonts.sans);
    root.style.setProperty('--tenant-font-mono', tenant.settings.theme.fonts.mono);
    
    // Set other theme properties
    root.style.setProperty('--tenant-radius', tenant.settings.theme.radius);
    
    // Add tenant class for CSS targeting
    root.classList.add('tenant-themed');
    root.setAttribute('data-tenant-id', tenant.id);
    root.setAttribute('data-tenant-slug', tenant.slug);
    
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon && tenant.settings.branding.favicon) {
      favicon.href = tenant.settings.branding.favicon;
    }
    
    // Cleanup function
    return () => {
      root.classList.remove('tenant-themed');
      root.removeAttribute('data-tenant-id');
      root.removeAttribute('data-tenant-slug');
      
      // Remove CSS variables
      const cssVars = [
        '--tenant-primary', '--tenant-secondary', '--tenant-accent',
        '--tenant-background', '--tenant-foreground', '--tenant-muted',
        '--tenant-muted-foreground', '--tenant-card', '--tenant-card-foreground',
        '--tenant-border', '--tenant-font-sans', '--tenant-font-mono',
        '--tenant-radius'
      ];
      
      cssVars.forEach(varName => {
        root.style.removeProperty(varName);
      });
    };
  }, [tenant]);
  
  return (
    <>
      <style jsx global>{`
        .tenant-themed {
          --primary: var(--tenant-primary);
          --secondary: var(--tenant-secondary);
          --accent: var(--tenant-accent);
          --background: var(--tenant-background);
          --foreground: var(--tenant-foreground);
          --muted: var(--tenant-muted);
          --muted-foreground: var(--tenant-muted-foreground);
          --card: var(--tenant-card);
          --card-foreground: var(--tenant-card-foreground);
          --border: var(--tenant-border);
          --radius: var(--tenant-radius);
          font-family: var(--tenant-font-sans), var(--font-geist);
        }
        
        .tenant-themed code,
        .tenant-themed pre {
          font-family: var(--tenant-font-mono), var(--font-geist-mono);
        }
      `}</style>
      {children}
    </>
  );
}
```

**GitHub Copilot Prompt**:

```
Create components/providers/tenant-theme-provider.tsx as a client component. Apply tenant theme colors as CSS variables on document root. Override existing CSS variables when tenant-themed class is present. Update favicon dynamically. Include cleanup on unmount. Add global styles that use tenant CSS variables.
```

---

## File 8: Tenant Chat Component

**Location**: `components/tenant/tenant-chat.tsx` (NEW FILE)  
**Interactions**:

- Wraps existing chat functionality
- Adds tenant context
- Applies tenant AI settings

**Implementation**:

```typescript
'use client';

import { useChat } from 'ai/react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Tenant, User } from '@/lib/db/schema';
import { Chat } from '@/app/(chat)/chat';
import { useTenant } from '@/components/providers/tenant-provider';
import { TenantChatHeader } from './tenant-chat-header';
import { TenantWelcomeMessage } from './tenant-welcome-message';

interface TenantChatProps {
  tenant: Tenant;
  user?: User;
}

export function TenantChat({ tenant, user }: TenantChatProps) {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  
  // Custom chat configuration for tenant
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
    headers: {
      'X-Tenant-ID': tenant.id,
    },
    body: {
      tenantId: tenant.id,
      model: tenant.settings.ai.model,
      temperature: tenant.settings.ai.temperature,
      maxTokens: tenant.settings.ai.maxTokens,
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: tenant.settings.ai.systemPrompt || 
          `Welcome to ${tenant.settings.branding.companyName}! I'm here to help you with your benefits questions.`,
      },
    ],
    onResponse: (response) => {
      if (!chatId && response.headers.get('X-Chat-ID')) {
        setChatId(response.headers.get('X-Chat-ID'));
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });
  
  // Wrap submit to add tenant context
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user && tenant.settings.features.requireAuth) {
      router.push(`/t/${tenant.slug}/login`);
      return;
    }
    
    originalHandleSubmit(e);
  }, [originalHandleSubmit, user, tenant, router]);
  
  // Check feature flags
  const features = {
    voice: tenant.settings.features.voiceEnabled,
    fileUpload: tenant.settings.features.fileUploadsEnabled && user !== undefined,
    maxFileSize: tenant.settings.features.maxFileSize,
    allowedFileTypes: tenant.settings.features.allowedFileTypes,
  };
  
  return (
    <div className="flex h-screen flex-col">
      <TenantChatHeader tenant={tenant} user={user} />
      
      <div className="flex-1 overflow-hidden">
        {messages.length === 1 ? (
          <TenantWelcomeMessage tenant={tenant} />
        ) : null}
        
        <Chat
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          reload={reload}
          stop={stop}
          features={features}
          className="tenant-chat"
        />
      </div>
    </div>
  );
}
```

**GitHub Copilot Prompt**:

```
Create components/tenant/tenant-chat.tsx that wraps the existing Chat component from app/(chat)/chat. Use useChat hook with tenant-specific configuration. Add X-Tenant-ID header and tenant AI settings to API calls. Include tenant system prompt as initial message. Check feature flags and require auth if needed. Pass tenant-specific features to Chat component.
```

---

## File 9: Admin Dashboard Layout

**Location**: `app/admin/layout.tsx` (NEW FILE)  

**Interactions**:

- Uses auth from `app/(auth)/auth`
- Wraps admin pages

**Implementation**:

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login');
  }
  
  // TODO: Check if user has admin privileges
  // For now, any authenticated user can access admin
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard - Benefits Platform',
  description: 'Manage tenants and platform settings',
};
```

**GitHub Copilot Prompt**:

```
Create app/admin/layout.tsx that checks authentication using auth() from app/(auth)/auth. Redirect to /login if not authenticated. Create admin layout with AdminSidebar and AdminHeader components. Use container styling for main content area. Set appropriate metadata.
```

---

## File 10: Admin Dashboard Page

**Location**: `app/admin/page.tsx` (NEW FILE)  
**Interactions**:

- Fetches data from `lib/db/queries/tenants.ts`
- Displays admin overview

**Implementation**:

```typescript
import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getUserTenants, getAllTenants } from '@/lib/db/queries/tenants';
import { TenantStats } from '@/components/admin/tenant-stats';
import { TenantList } from '@/components/admin/tenant-list';
import { QuickActions } from '@/components/admin/quick-actions';
import { LoadingCard } from '@/components/ui/loading-card';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    return null; // Layout handles redirect
  }
  
  // Fetch user's tenants and stats
  const [userTenants, allTenants] = await Promise.all([
    getUserTenants(session.user.id),
    getAllTenants({ limit: 10 }), // TODO: Check admin permission
  ]);
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your tenants and platform settings
        </p>
      </div>
      
      {/* Quick actions */}
      <QuickActions />
      
      {/* Stats overview */}
      <Suspense fallback={<LoadingCard />}>
        <TenantStats 
          totalTenants={allTenants.length}
          userTenants={userTenants.length}
        />
      </Suspense>
      
      {/* Your tenants */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Your Tenants
        </h2>
        <Suspense fallback={<LoadingCard />}>
          <TenantList 
            tenants={userTenants.map(ut => ({
              ...ut.tenant,
              userRole: ut.role,
            }))}
          />
        </Suspense>
      </div>
      
      {/* All tenants (if admin) */}
      {allTenants.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            All Tenants
          </h2>
          <Suspense fallback={<LoadingCard />}>
            <TenantList tenants={allTenants} showOwner />
          </Suspense>
        </div>
      )}
    </div>
  );
}
```

**GitHub Copilot Prompt**:

```
Create app/admin/page.tsx that fetches user's tenants and all tenants (for admins). Display dashboard with QuickActions, TenantStats, and TenantList components. Use Suspense with LoadingCard fallbacks. Show "Your Tenants" section and conditionally show "All Tenants" if user has admin access.
```

---

## File 11: Create Tenant API Route

**Location**: `app/api/admin/tenants/route.ts` (NEW FILE)  
**Interactions**:

- Uses `lib/db/queries/tenants.ts`
- Creates new tenants

**Implementation**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { createTenant, getTenantBySlug } from '@/lib/db/queries/tenants';
import { z } from 'zod';
import { ChatSDKError } from '@/lib/errors';

// Validation schema
const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  settings: z.object({
    theme: z.object({
      colors: z.object({
        primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      }).partial(),
    }).optional(),
    branding: z.object({
      companyName: z.string().optional(),
      tagline: z.string().optional(),
      logo: z.string().url().optional(),
    }).optional(),
    ai: z.object({
      tone: z.enum(['professional', 'friendly', 'casual', 'technical']).optional(),
      personality: z.string().optional(),
    }).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTenantSchema.parse(body);
    
    // Check if slug is already taken
    const existing = await getTenantBySlug(validatedData.slug);
    if (existing) {
      return NextResponse.json(
        { error: 'A tenant with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Create tenant with current user as owner
    const tenant = await createTenant({
      name: validatedData.name,
      slug: validatedData.slug,
      ownerId: session.user.id,
      settings: validatedData.settings,
    });
    
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        url: `${process.env.NEXT_PUBLIC_APP_URL?.replace('://', `://${tenant.slug}.`)}`,
      },
    });
  } catch (error) {
    console.error('Failed to create tenant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof ChatSDKError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user's tenants
    const tenants = await getUserTenants(session.user.id);
    
    return NextResponse.json({
      tenants: tenants.map(t => ({
        id: t.tenant.id,
        name: t.tenant.name,
        slug: t.tenant.slug,
        role: t.role,
        url: `${process.env.NEXT_PUBLIC_APP_URL?.replace('://', `://${t.tenant.slug}.`)}`,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}
```

**GitHub Copilot Prompt**:

```
Create app/api/admin/tenants/route.ts with POST and GET handlers. POST creates new tenant after validating with Zod schema (name, slug, optional settings). Check auth with auth() function. Validate slug uniqueness. Return tenant with generated URL. GET returns user's tenants. Handle all errors with appropriate status codes. Use ChatSDKError for database errors.
```

---

## File 12: Enhanced Chat API Route

**Location**: `app/api/chat/route.ts` (MODIFY EXISTING)  
**Interactions**:

- Adds tenant context to existing chat
- Validates tenant access

**Implementation** (Add to existing file):

```typescript
// ADD these imports at the top
import { userCanAccessTenant, associateChatWithTenant } from '@/lib/db/queries/tenants';

// MODIFY the existing POST handler by adding tenant logic at the beginning:
export async function POST(request: NextRequest) {
  try {
    // Get auth session (existing code)
    const session = await auth();
    
    // ADD: Extract tenant context
    const tenantId = request.headers.get('X-Tenant-ID');
    
    // ADD: If tenant context exists, validate access
    if (tenantId) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required for tenant access' },
          { status: 401 }
        );
      }
      
      const hasAccess = await userCanAccessTenant(session.user.id, tenantId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this tenant' },
          { status: 403 }
        );
      }
    }
    
    // Continue with existing chat logic...
    const { messages, model, ...otherParams } = await request.json();
    
    // When creating a new chat, associate it with tenant if applicable
    // ADD this after chat creation:
    if (tenantId && chatId) {
      await associateChatWithTenant(chatId, tenantId);
    }
    
    // Rest of existing implementation...
  } catch (error) {
    // Existing error handling...
  }
}
```

**GitHub Copilot Prompt**:

```
Modify existing app/api/chat/route.ts to add tenant support. At the start of POST handler, check for X-Tenant-ID header. If present, verify user has access using userCanAccessTenant. After creating a chat, associate it with tenant using associateChatWithTenant. Don't break any existing functionality - only add tenant validation and association.
```

---

## File 13: Admin Components - Tenant List

**Location**: `components/admin/tenant-list.tsx` (NEW FILE)  
**Interactions**:

- Displays tenant cards
- Links to tenant management

**Implementation**:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Tenant } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, Settings, Users } from 'lucide-react';

interface TenantWithRole extends Tenant {
  userRole?: string;
}

interface TenantListProps {
  tenants: TenantWithRole[];
  showOwner?: boolean;
}

export function TenantList({ tenants, showOwner = false }: TenantListProps) {
  if (tenants.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground mb-4">No tenants found</p>
          <Button asChild>
            <Link href="/admin/tenants/new">Create your first tenant</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {tenant.settings.branding.companyName}
                </CardTitle>
                <CardDescription>
                  {tenant.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'example.com'}
                </CardDescription>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${tenant.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tenants/${tenant.id}/users`}>
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a 
                      href={`${window.location.protocol}//${tenant.slug}.${window.location.host.replace(/^[^.]+\./, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Site
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                {tenant.status}
              </Badge>
            </div>
            
            {tenant.userRole && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Your Role</span>
                <Badge variant="outline">{tenant.userRole}</Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Created</span>
              <span>{format(new Date(tenant.createdAt), 'MMM d, yyyy')}</span>
            </div>
            
            {tenant.settings.branding.tagline && (
              <p className="text-sm text-muted-foreground mt-3 italic">
                "{tenant.settings.branding.tagline}"
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**GitHub Copilot Prompt**:

```
Create components/admin/tenant-list.tsx that displays a grid of tenant cards. Each card shows company name, slug URL, status badge, user role (if provided), and creation date. Include dropdown menu with Settings, Users, and Visit Site options. Show empty state with "Create your first tenant" button. Use shadcn/ui components throughout.
```

---

## File 14: Create Tenant Form Component

**Location**: `components/admin/create-tenant-form.tsx` (NEW FILE)  
**Interactions**:

- Posts to `/api/admin/tenants`
- Validates input client-side

**Implementation**:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(63, 'Slug must be less than 63 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  companyName: z.string().min(2, 'Company name is required'),
  tagline: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  tone: z.enum(['professional', 'friendly', 'casual', 'technical']),
  personality: z.string().optional(),
});

type FormData = z.infer<typeof createTenantSchema>;

export function CreateTenantForm() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      primaryColor: '#0ea5e9',
      tone: 'professional',
      personality: 'helpful and knowledgeable benefits advisor',
    },
  });
  
  // Auto-generate slug from name
  const name = watch('name');
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    register('name').onChange(e);
    
    // Auto-generate slug
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 63);
    
    setValue('slug', slug);
  };
  
  const onSubmit = async (data: FormData) => {
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          settings: {
            theme: {
              colors: {
                primary: data.primaryColor,
                secondary: '#64748b', // default
              },
              fonts: { // default
                sans: 'Inter',
                mono: 'JetBrains Mono',
              },
              radius: '0.5rem', // default
            },
            branding: {
              companyName: data.companyName,
              tagline: data.tagline,
            },
            ai: {
              tone: data.tone,
              personality: data.personality,
            },
          },
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create tenant');
      }
      
      toast.success('Tenant created successfully!');
      router.push(`/admin/tenants/${result.tenant.id}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to create tenant:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create tenant');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Set up the basic details for your new tenant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tenant Name</Label>
              <Input
                id="name"
                placeholder="My Organization"
                {...register('name', { onChange: handleNameChange })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  placeholder="my-org"
                  {...register('slug')}
                />
                <span className="text-sm text-muted-foreground">
                  .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'example.com'}
                </span>
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Customize the appearance and messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline (optional)</Label>
              <Input
                id="tagline"
                placeholder="Your trusted benefits partner"
                {...register('tagline')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  className="w-20 h-10"
                  {...register('primaryColor')}
                />
                <Input
                  value={watch('primaryColor')}
                  onChange={(e) => setValue('primaryColor', e.target.value)}
                  placeholder="#0ea5e9"
                />
              </div>
              {errors.primaryColor && (
                <p className="text-sm text-red-500">{errors.primaryColor.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Configuration</CardTitle>
            <CardDescription>
              Configure how the AI assistant interacts with users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Conversation Tone</Label>
              <Select
                value={watch('tone')}
                onValueChange={(value: any) => setValue('tone', value)}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personality">AI Personality</Label>
              <Textarea
                id="personality"
                placeholder="Describe how the AI should behave..."
                rows={3}
                {...register('personality')}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Tenant
          </Button>
        </div>
      </div>
    </form>
  );
}
```

**GitHub Copilot Prompt**:

```
Create components/admin/create-tenant-form.tsx using react-hook-form with Zod validation. Auto-generate slug from name. Include sections for: basic info (name, slug), branding (company name, tagline, primary color), and AI config (tone, personality). Show validation errors. POST to /api/admin/tenants on submit. Use toast for success/error feedback. Navigate to tenant settings on success.
```

---

## File 15: Tenant-Specific CSS

**Location**: `app/globals.css` (APPEND TO EXISTING)  
**Interactions**:

- Extends existing global styles
- Adds tenant-specific CSS variables

**Implementation** (Add to end of file):

```css
/* Tenant-specific theming */
.tenant-themed {
  /* Override default theme colors with tenant colors */
  --primary: var(--tenant-primary);
  --primary-foreground: hsl(0 0% 98%);
  
  --secondary: var(--tenant-secondary);
  --secondary-foreground: hsl(0 0% 98%);
  
  --accent: var(--tenant-accent);
  --accent-foreground: hsl(0 0% 9%);
  
  --background: var(--tenant-background);
  --foreground: var(--tenant-foreground);
  
  --muted: var(--tenant-muted);
  --muted-foreground: var(--tenant-muted-foreground);
  
  --card: var(--tenant-card);
  --card-foreground: var(--tenant-card-foreground);
  
  --border: var(--tenant-border);
  --radius: var(--tenant-radius);
}

/* Tenant chat specific styles */
.tenant-chat {
  font-family: var(--tenant-font-sans, var(--font-geist));
}

.tenant-chat code,
.tenant-chat pre {
  font-family: var(--tenant-font-mono, var(--font-geist-mono));
}

/* Admin dashboard styles */
.admin-sidebar {
  @apply bg-gray-900 text-gray-100;
}

.admin-sidebar a {
  @apply hover:bg-gray-800 transition-colors;
}

.admin-sidebar a.active {
  @apply bg-gray-800 border-l-4 border-blue-500;
}

/* Tenant card hover effects */
.tenant-card {
  @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5;
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

**GitHub Copilot Prompt**:

```
Append to app/globals.css with tenant-specific styles. Add .tenant-themed class that overrides CSS variables with tenant values. Include tenant chat font styles. Add admin dashboard styles with sidebar styling. Include hover effects for tenant cards and loading shimmer animation. Ensure styles work with existing dark/light theme system.
```

---

## Migration SQL File

**Location**: `migrations/add_multi_tenant.sql` (NEW FILE)  
**Purpose**: Database migration for existing installations

**Implementation**:

```sql
-- Add multi-tenant tables
CREATE TABLE IF NOT EXISTS "Tenant" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(63) UNIQUE NOT NULL,
  domain VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{
    "theme": {
      "colors": {
        "primary": "#0ea5e9",
        "secondary": "#64748b",
        "accent": "#f97316",
        "background": "#ffffff",
        "foreground": "#0f172a",
        "muted": "#f8fafc",
        "mutedForeground": "#64748b",
        "card": "#ffffff",
        "cardForeground": "#0f172a",
        "border": "#e2e8f0"
      },
      "fonts": {
        "sans": "Inter",
        "mono": "JetBrains Mono"
      },
      "radius": "0.5rem"
    },
    "features": {
      "voiceEnabled": false,
      "fileUploadsEnabled": true,
      "maxFileSize": 10485760,
      "allowedFileTypes": ["pdf", "docx", "txt", "csv"],
      "publicAccess": false,
      "requireAuth": true
    },
    "branding": {
      "logo": "/logo.svg",
      "favicon": "/favicon.ico",
      "companyName": "Benefits Assistant"
    },
    "ai": {
      "model": "gpt-4-turbo-preview",
      "temperature": 0.7,
      "maxTokens": 2000,
      "systemPrompt": "You are a helpful benefits advisor...",
      "tone": "professional",
      "personality": "knowledgeable and supportive"
    }
  }'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TenantUser" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId" UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions JSONB NOT NULL DEFAULT '[]',
  "joinedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TenantChat" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenantId" UUID NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "chatId" UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX tenant_slug_idx ON "Tenant"(slug);
CREATE INDEX tenant_status_idx ON "Tenant"(status);
CREATE UNIQUE INDEX tenant_user_idx ON "TenantUser"("tenantId", "userId");
CREATE INDEX tenant_user_user_idx ON "TenantUser"("userId");
CREATE UNIQUE INDEX tenant_chat_idx ON "TenantChat"("tenantId", "chatId");
CREATE INDEX tenant_chat_chat_idx ON "TenantChat"("chatId");

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenant_updated_at BEFORE UPDATE ON "Tenant"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**GitHub Copilot Prompt**:

```
Create migrations/add_multi_tenant.sql that adds Tenant, TenantUser, and TenantChat tables with proper foreign keys to existing User and Chat tables. Include all indexes and a trigger to update the updatedAt timestamp. Use JSONB for settings with sensible defaults. Ensure all constraints and relationships are properly defined.
```

---

## Implementation Summary

### File Creation Order

1. Database schema extension (`lib/db/schema.ts`)
2. Database queries (`lib/db/queries/tenants.ts`)
3. Middleware (`middleware.ts`)
4. Tenant route structure (`app/t/[tenant]/*`)
5. Provider components (`components/providers/*`)
6. Tenant components (`components/tenant/*`)
7. Admin routes (`app/admin/*`)
8. Admin components (`components/admin/*`)
9. API routes (`app/api/admin/*`)
10. Chat API enhancement
11. CSS additions

### Key Integration Points

- **Authentication**: Uses existing `auth()` from `app/(auth)/auth`
- **Database**: Extends existing schema without breaking tables
- **Chat**: Enhances existing chat with optional tenant context
- **Routing**: Adds new routes without affecting existing ones
- **UI**: Reuses existing components where possible

### Testing Strategy

1. Existing chat continues to work at `/(chat)`
2. Admin dashboard accessible at `/admin`
3. Tenant chats work at `subdomain.domain.com`
4. Theme switching applies immediately
5. Multi-tenant isolation verified
6. Performance impact minimal (<5% degradation)
