# GitHub Copilot Instructions: Benefits Assistant Demo

This document provides file-by-file instructions for implementing the Benefits Assistant demo using GitHub Copilot and Claude Code. Use these as prompts and guidance while coding in your IDE.

---

## Global Setup Commands

**Package Manager:** pnpm (verified from package.json)
**Database:** Neon Postgres with Drizzle ORM (verified from dependencies)
**Framework:** Next.js 15.3.0-canary with App Router

### Initial Setup

```bash
# Install Azure SDK
pnpm add @azure/search-documents

# Install testing dependencies (if needed)
// ...existing code...

# Generate and run database migrations (after schema changes)
pnpm db:generate
pnpm db:migrate

# Development server
pnpm dev
```

---

## File Implementation Guide

### **File: `.env.example`**

**Task:** Add environment variables for Azure Cognitive Search integration.

```bash
# Azure Cognitive Search (ADD THESE)
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-admin-key

# Existing variables (keep these)
OPENAI_API_KEY=sk-your-openai-key
POSTGRES_URL=your-neon-postgres-url
AUTH_SECRET=your-auth-secret
```

---

### **File: `lib/db/schema.ts`**

**Task:** Extend the Drizzle schema with benefits-specific tables. Add after the existing Stream table definition.

**Copilot Prompt:** "Add benefits tables to Drizzle schema with proper TypeScript types for JSON fields, following existing patterns"

```typescript
// Add these imports if not present
import { uuid, varchar, text, json, integer, timestamp, pgTable } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

// Add these table definitions after existing tables
export const benefitsPlans = pgTable('BenefitsPlans', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('clientId').notNull(),
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

// Export TypeScript types
export type BenefitsPlan = InferSelectModel<typeof benefitsPlans>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type ClientConfig = InferSelectModel<typeof clientConfigs>;
export type AnalyticsEvent = InferSelectModel<typeof analyticsEvents>;
```

**After adding:** Run `pnpm db:generate && pnpm db:migrate`

---

### **File: `lib/db/queries.ts`**

**Task:** Add query functions for the new benefits tables following existing Drizzle patterns.

**Copilot Prompt:** "Add CRUD functions for benefits tables using Drizzle ORM patterns from existing code"

```typescript
// Add these imports at the top
import { benefitsPlans, userProfiles, clientConfigs, analyticsEvents } from './schema';
import type { BenefitsPlan, UserProfile, ClientConfig, AnalyticsEvent } from './schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';

// Add these functions at the end of the file

// Benefits Plans
export async function getBenefitsPlansByClientId(clientId: string) {
  return await db
    .select()
    .from(benefitsPlans)
    .where(eq(benefitsPlans.clientId, clientId));
}

export async function saveBenefitsPlan(plan: Omit<BenefitsPlan, 'id' | 'createdAt'>) {
  const [newPlan] = await db
    .insert(benefitsPlans)
    .values(plan)
    .returning();
  return newPlan;
}

// User Profiles
export async function getUserProfileBySessionId(sessionId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.sessionId, sessionId))
    .limit(1);
  return profile;
}

export async function saveUserProfile(profile: Omit<UserProfile, 'id' | 'updatedAt'>) {
  const existing = await getUserProfileBySessionId(profile.sessionId);
  
  if (existing) {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.sessionId, profile.sessionId))
      .returning();
    return updated;
  } else {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }
}

// Client Configs
export async function getClientConfigById(id: string) {
  const [config] = await db
    .select()
    .from(clientConfigs)
    .where(eq(clientConfigs.id, id))
    .limit(1);
  return config;
}

export async function saveClientConfig(config: Omit<ClientConfig, 'id' | 'createdAt'>) {
  const [newConfig] = await db
    .insert(clientConfigs)
    .values(config)
    .returning();
  return newConfig;
}

// Analytics
export async function saveAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
  const [newEvent] = await db
    .insert(analyticsEvents)
    .values(event)
    .returning();
  return newEvent;
}

export async function getAnalyticsEventsByClientId(
  clientId: string, 
  startDate: Date, 
  endDate: Date
) {
  return await db
    .select()
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.clientId, clientId),
        gte(analyticsEvents.timestamp, startDate),
        lt(analyticsEvents.timestamp, endDate)
      )
    )
    .orderBy(desc(analyticsEvents.timestamp));
}
```

---

### **File: `lib/azure-search.ts` (NEW FILE)**

**Task:** Create Azure Cognitive Search integration for benefits content.

**Copilot Prompt:** "Create Azure Cognitive Search client with TypeScript interfaces for benefits documents"

```typescript
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
  throw new Error('Azure Search environment variables not configured');
}

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT,
  'benefits-index',
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
);

export interface BenefitsDocument {
  id: string;
  title: string;
  content: string;
  category: 'plan_details' | 'enrollment' | 'coverage' | 'costs' | 'faq';
  planType: 'HMO' | 'PPO' | 'HDHP' | 'EPO' | 'general';
  clientId: string;
  searchableContent: string;
  lastUpdated: string;
}

export async function searchBenefitsContent(
  query: string,
  clientId: string,
  top: number = 5
): Promise<BenefitsDocument[]> {
  try {
    const searchResults = await searchClient.search<BenefitsDocument>(query, {
      searchFields: ['title', 'content', 'searchableContent'],
      select: ['id', 'title', 'content', 'category', 'planType', 'clientId'],
      filter: `clientId eq '${clientId}'`,
      top,
      highlightFields: ['content'],
      semanticConfiguration: 'benefits-semantic-config'
    });

    const documents: BenefitsDocument[] = [];
    for await (const result of searchResults.results) {
      documents.push(result.document);
    }
    
    return documents;
  } catch (error) {
    console.error('Azure Search error:', error);
    return [];
  }
}

export async function indexBenefitsDocument(document: BenefitsDocument): Promise<void> {
  try {
    await searchClient.uploadDocuments([document]);
  } catch (error) {
    console.error('Failed to index document:', error);
    throw error;
  }
}

export function formatSearchResultsForPrompt(results: BenefitsDocument[]): string {
  if (results.length === 0) return '';
  
  return results.map(doc => 
    `Title: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`
  ).join('\n\n');
}
```

---

### **File: `app/(chat)/api/chat/route.ts`**

**Task:** Enhance the main chat API route to integrate Azure Search and benefits expertise.

**Copilot Prompt:** "Modify existing chat route to add Azure search integration and benefits-specific system prompts"

```typescript
// Add these imports at the top
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import { getUserProfileBySessionId, saveUserProfile, saveAnalyticsEvent, getBenefitsPlansByClientId } from '@/lib/db/queries';
import { z } from 'zod';

// Add this system prompt constant
const BENEFITS_SYSTEM_PROMPT = `You are an expert benefits advisor helping employees understand their health insurance options.

Your expertise includes:
- Health insurance plan types (HMO, PPO, HDHP, EPO) and their key differences
- Cost analysis including premiums, deductibles, copays, and out-of-pocket maximums  
- Enrollment processes, eligibility requirements, and life event changes
- Provider networks, prescription coverage, and claims processes
- Personalized recommendations based on family size, medical needs, and budget

Available Benefits Information:
{SEARCH_RESULTS}

User Profile:
{USER_PROFILE}

Guidelines:
1. Ask targeted follow-up questions to understand user needs
2. Provide specific cost calculations when possible
3. Explain insurance concepts in simple terms
4. Recommend specific plans based on user situation
5. Always cite specific plan details when making recommendations
6. Offer to create personalized cost comparisons

Maintain a professional but friendly tone, and always prioritize the user's specific needs and budget constraints.`;

// In the POST function, add this logic before the streamText call:
export async function POST(request: Request) {
  // ... existing authentication and setup code ...

  // Add benefits-specific logic
  const clientId = 'default-client'; // Get from user context or header in production
  const userProfile = await getUserProfileBySessionId(sessionData.sessionId || generateUUID());

  // Get last user message for search
  const lastUserMessage = messages[messages.length - 1];
  const searchResults = await searchBenefitsContent(
    lastUserMessage.content, 
    clientId
  );

  // Enhance system prompt with search results and user profile
  const enhancedSystemPrompt = BENEFITS_SYSTEM_PROMPT
    .replace('{SEARCH_RESULTS}', formatSearchResultsForPrompt(searchResults))
    .replace('{USER_PROFILE}', JSON.stringify(userProfile || {}));

  // Track analytics event
  await saveAnalyticsEvent({
    sessionId: sessionData.sessionId || generateUUID(),
    clientId,
    eventType: 'conversation_start',
    metadata: { messageCount: messages.length }
  });

  // In the streamText call, add these tools to the existing tools object:
  const result = await streamText({
    // ... existing configuration ...
    system: enhancedSystemPrompt, // Use enhanced prompt instead of default
    tools: {
      // ... existing tools ...
      
      calculatePlanCosts: {
        description: 'Calculate annual costs for health insurance plans',
        parameters: z.object({
          planType: z.string(),
          familySize: z.number(),
          estimatedUsage: z.enum(['low', 'medium', 'high'])
        }),
        execute: async ({ planType, familySize, estimatedUsage }) => {
          const plans = await getBenefitsPlansByClientId(clientId);
          const selectedPlan = plans.find(p => p.type === planType);
          
          if (!selectedPlan) {
            return { error: 'Plan not found' };
          }

          // Calculate costs based on family size
          const premiumKey = familySize === 1 ? 'individual' 
            : familySize === 2 ? 'employeeSpouse'
            : familySize >= 3 ? 'family' : 'individual';
          
          const annualPremiums = selectedPlan.monthlyPremium[premiumKey] * 12;
          const deductible = familySize === 1 
            ? selectedPlan.deductible.individual 
            : selectedPlan.deductible.family;
          
          // Estimate usage costs
          const usageMultiplier = estimatedUsage === 'low' ? 0.3 
            : estimatedUsage === 'medium' ? 0.6 : 0.9;
          const estimatedUsageCosts = deductible * usageMultiplier;
          
          return {
            planName: selectedPlan.name,
            annualPremiums,
            deductible,
            estimatedUsageCosts,
            totalEstimatedCost: annualPremiums + estimatedUsageCosts,
            breakdown: {
              monthlyPremium: selectedPlan.monthlyPremium[premiumKey],
              copays: selectedPlan.copays,
              prescriptionCoverage: selectedPlan.prescriptionCoverage
            }
          };
        }
      },
      
      comparePlans: {
        description: 'Compare multiple health insurance plans',
        parameters: z.object({
          planIds: z.array(z.string()),
          userProfile: z.object({
            familySize: z.number(),
            medicalConditions: z.array(z.string())
          })
        }),
        execute: async ({ planIds, userProfile }) => {
          const plans = await getBenefitsPlansByClientId(clientId);
          const selectedPlans = plans.filter(p => planIds.includes(p.id));
          
          const comparison = selectedPlans.map(plan => {
            const premiumKey = userProfile.familySize === 1 ? 'individual'
              : userProfile.familySize === 2 ? 'employeeSpouse'
              : 'family';
            
            return {
              planName: plan.name,
              type: plan.type,
              monthlyPremium: plan.monthlyPremium[premiumKey],
              annualPremium: plan.monthlyPremium[premiumKey] * 12,
              deductible: userProfile.familySize === 1 
                ? plan.deductible.individual 
                : plan.deductible.family,
              copays: plan.copays,
              features: plan.features,
              networkName: plan.networkName
            };
          });
          
          await saveAnalyticsEvent({
            sessionId: sessionData.sessionId || generateUUID(),
            clientId,
            eventType: 'plan_compared',
            metadata: { plansCompared: planIds, familySize: userProfile.familySize }
          });
          
          return { comparison, totalPlans: comparison.length };
        }
      }
    }
  });

  // ... rest of existing function ...
}
```

---

### **File: `lib/theme-manager.ts` (NEW FILE)**

**Task:** Create dynamic theming system for multi-tenant support.

**Copilot Prompt:** "Create React context for dynamic theming with CSS variable updates and localStorage persistence"

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ClientTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
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
}

// Predefined demo themes
const DEMO_THEMES: ClientTheme[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    colors: {
      primary: '#0066cc',
      secondary: '#004499',
      accent: '#ff6b35',
      background: '#ffffff',
      foreground: '#1a1a1a',
      muted: '#f5f5f5',
      border: '#e0e0e0'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'TechCorp Solutions',
      tagline: 'Innovative Benefits for the Modern Workforce'
    },
    personality: { tone: 'professional', formality: 'formal' }
  },
  {
    id: 'healthcare-green',
    name: 'Healthcare Green',
    colors: {
      primary: '#00a86b',
      secondary: '#008050',
      accent: '#ffa500',
      background: '#fafffe',
      foreground: '#2c2c2c',
      muted: '#f0f8f5',
      border: '#d0e6db'
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'MedLife Partners',
      tagline: 'Comprehensive Care, Simplified'
    },
    personality: { tone: 'friendly', formality: 'conversational' }
  },
  {
    id: 'startup-purple',
    name: 'Startup Purple',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#111827',
      muted: '#f9fafb',
      border: '#e5e7eb'
    },
    typography: {
      fontFamily: 'Poppins',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'InnovateTech',
      tagline: 'Disrupting Benefits, One Employee at a Time'
    },
    personality: { tone: 'friendly', formality: 'conversational' }
  }
];

interface ThemeContextType {
  currentTheme: ClientTheme;
  setThemeById: (themeId: string) => void;
  availableThemes: ClientTheme[];
  updateCSSVariables: (theme: ClientTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ClientTheme>(DEMO_THEMES[0]);
  const [availableThemes] = useState<ClientTheme[]>(DEMO_THEMES);

  const updateCSSVariables = (theme: ClientTheme) => {
    const root = document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-foreground', theme.colors.foreground);
    root.style.setProperty('--color-muted', theme.colors.muted);
    root.style.setProperty('--color-border', theme.colors.border);
    
    // Update typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      root.style.setProperty(`--font-size-${size}`, value);
    });
  };

  const setThemeById = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      updateCSSVariables(theme);
      localStorage.setItem('currentTheme', themeId);
    }
  };

  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = localStorage.getItem('currentTheme');
    if (savedThemeId) {
      setThemeById(savedThemeId);
    } else {
      updateCSSVariables(currentTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider 
      value={{ 
        currentTheme, 
        setThemeById, 
        availableThemes, 
        updateCSSVariables 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

---

### **File: `components/theme-switcher.tsx` (NEW FILE)**

**Task:** Create theme switching dropdown component.

**Copilot Prompt:** "Create theme switcher dropdown using shadcn/ui components with visual theme previews"

```typescript
'use client';

import { useTheme } from '@/lib/theme-manager';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { currentTheme, setThemeById, availableThemes } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          {currentTheme.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setThemeById(theme.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div>
                <div className="font-medium">{theme.name}</div>
                <div className="text-xs text-muted-foreground">
                  {theme.branding.companyName}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### **File: `app/globals.css`**

**Task:** Add theme-aware CSS variables that can be dynamically updated.

**Copilot Prompt:** "Add CSS custom properties for theming that override shadcn/ui defaults"

```css
/* Add these theme variables after existing CSS variables */
:root {
  /* Theme-specific variables */
  --color-primary: #0066cc;
  --color-secondary: #004499;
  --color-accent: #ff6b35;
  --color-background: #ffffff;
  --color-foreground: #1a1a1a;
  --color-muted: #f5f5f5;
  --color-border: #e0e0e0;
  
  /* Typography variables */
  --font-family: 'Inter';
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
}

/* Override shadcn/ui variables to use theme variables */
:root {
  --primary: var(--color-primary);
  --secondary: var(--color-secondary);
  --accent: var(--color-accent);
  --background: var(--color-background);
  --foreground: var(--color-foreground);
  --muted: var(--color-muted);
  --border: var(--color-border);
}

/* Apply theme typography */
body {
  font-family: var(--font-family), system-ui, sans-serif;
}

.theme-aware {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-color: var(--color-border);
}
```

---

### **File: `app/layout.tsx`**

**Task:** Add ThemeProvider to the root layout.

**Copilot Prompt:** "Wrap existing layout with ThemeProvider while keeping all existing providers"

```typescript
import { ThemeProvider } from '@/lib/theme-manager';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans theme-aware`}>
        <ThemeProvider>
          <Toaster />
          {/* Keep existing providers */}
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### **File: `components/chat-header.tsx`**

**Task:** Add theme switcher to the chat header.

**Copilot Prompt:** "Add ThemeSwitcher component to existing chat header without breaking layout"

```typescript
import { ThemeSwitcher } from './theme-switcher';

// In the existing header component, add ThemeSwitcher to the button group
<div className="flex items-center gap-2">
  <ThemeSwitcher />
  {/* existing header buttons */}
</div>
```

---

### **File: `components/benefits/plan-comparison-artifact.tsx` (NEW FILE)**

**Task:** Create interactive plan comparison component for artifacts system.

**Copilot Prompt:** "Create plan comparison component with cost calculations and recommendations using shadcn/ui"

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, DollarSign, Users, Heart } from 'lucide-react';
import type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

interface PlanComparisonProps {
  plans: BenefitsPlan[];
  userProfile?: UserProfile;
  onPlanSelect?: (planId: string) => void;
}

export function PlanComparisonArtifact({ 
  plans, 
  userProfile, 
  onPlanSelect 
}: PlanComparisonProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const calculateAnnualCost = (plan: BenefitsPlan, familySize: number = 1) => {
    const premiumKey = familySize === 1 ? 'individual' 
      : familySize === 2 ? 'employeeSpouse' 
      : familySize === 3 ? 'employeeChild'
      : 'family';
    
    const monthlyPremium = plan.monthlyPremium[premiumKey];
    const deductible = familySize === 1 ? plan.deductible.individual : plan.deductible.family;
    
    return {
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      deductible,
      estimatedTotal: (monthlyPremium * 12) + (deductible * 0.5) // Assume 50% deductible usage
    };
  };

  const getPlanRecommendationScore = (plan: BenefitsPlan, profile?: UserProfile) => {
    let score = 60; // Base score
    
    if (profile) {
      // Family size factor
      if (profile.familySize && profile.familySize > 2 && plan.type === 'PPO') score += 15;
      if (profile.familySize === 1 && plan.type === 'HDHP') score += 10;
      
      // Budget priority factor
      if (profile.budgetPriority === 'low_premium' && plan.type === 'HDHP') score += 20;
      if (profile.budgetPriority === 'comprehensive' && plan.type === 'PPO') score += 20;
      
      // Medical conditions factor
      if (profile.medicalConditions && profile.medicalConditions.length > 0) {
        if (plan.type === 'PPO' || plan.type === 'HMO') score += 15;
      }
      
      // Risk tolerance factor
      if (profile.riskTolerance === 'low' && plan.type !== 'HDHP') score += 10;
      if (profile.riskTolerance === 'high' && plan.type === 'HDHP') score += 15;
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const getRecommendationText = (score: number) => {
    return score >= 85 ? 'Excellent match for your situation'
      : score >= 75 ? 'Good option worth considering'
      : score >= 65 ? 'Adequate coverage with some trade-offs'
      : 'May not be the best fit for your needs';
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    onPlanSelect?.(planId);
  };

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Health Plan Comparison</h2>
        <p className="text-gray-600">
          Compare plans side-by-side to find the best option for {userProfile?.familySize === 1 ? 'you' : 'your family'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const costs = calculateAnnualCost(plan, userProfile?.familySize);
          const score = getPlanRecommendationScore(plan, userProfile);
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => handlePlanSelection(plan.id)}
            >
              {score >= 85 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  RECOMMENDED
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={
                      plan.type === 'PPO' ? 'default' :
                      plan.type === 'HMO' ? 'secondary' :
                      plan.type === 'HDHP' ? 'outline' : 'destructive'
                    }>
                      {plan.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${costs.monthlyPremium}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {getRecommendationText(score)} ({score}% match)
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Annual Premium</div>
                    <div className="font-semibold">${costs.annualPremium.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Deductible</div>
                    <div className="font-semibold">${costs.deductible.toLocaleString()}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Copays</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Primary Care: ${plan.copays.primaryCare}</div>
                    <div>Specialist: ${plan.copays.specialist}</div>
                    <div>Urgent Care: ${plan.copays.urgentCare}</div>
                    <div>Emergency: ${plan.copays.emergencyRoom}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Prescription Coverage</h4>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div>Generic: ${plan.prescriptionCoverage.generic}</div>
                    <div>Brand: ${plan.prescriptionCoverage.brand}</div>
                    <div>Specialty: ${plan.prescriptionCoverage.specialty}</div>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Key Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t">
                  <div className="text-center text-sm text-gray-600">
                    Est. Annual Total: <span className="font-bold text-gray-900">
                      ${costs.estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelection(plan.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select This Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Great choice! You've selected the {plans.find(p => p.id === selectedPlan)?.name} plan.
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            This plan offers excellent value for your situation. Would you like help with enrollment or have questions about coverage?
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### **File: `app/analytics/page.tsx` (NEW FILE)**

**Task:** Create comprehensive analytics dashboard.

**Copilot Prompt:** "Create analytics dashboard with charts using Recharts and shadcn/ui components"

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Star,
  Download,
  Filter
} from 'lucide-react';

// Add the analytics interface and component implementation
// (Use the full code from the Claude.md file)
```

---

### **File: `app/api/analytics/route.ts` (NEW FILE)**

**Task:** Create analytics API endpoint.

**Copilot Prompt:** "Create analytics API route that processes analytics events and returns dashboard data"

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsEventsByClientId } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = new Date(searchParams.get('from') || Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = new Date(searchParams.get('to') || Date.now());
  const clientId = 'default-client'; // Get from auth/context

  try {
    const events = await getAnalyticsEventsByClientId(clientId, from, to);
    
    // Process events into analytics data
    const analyticsData = {
      totalConversations: events.filter(e => e.eventType === 'conversation_start').length,
      totalUsers: new Set(events.map(e => e.sessionId)).size,
      averageSessionTime: 8.5, // Calculate from actual session data
      planComparisons: events.filter(e => e.eventType === 'plan_compared').length,
      costCalculations: events.filter(e => e.eventType === 'cost_calculated').length,
      satisfactionRating: 4.3, // Calculate from satisfaction events
      conversionRate: 23.5, // Calculate from conversion events
      
      conversationsOverTime: generateTimeSeriesData(events, from, to),
      topQuestions: generateTopQuestions(events),
      planPopularity: generatePlanPopularity(events),
      timeDistribution: generateHourlyDistribution(events)
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// Add helper functions for data processing
// (Use implementations from Claude.md file)
```

---

### **File: `__tests__/benefits.test.ts` (NEW FILE)**

**Task:** Create comprehensive test suite for benefits functionality.

// ...existing code...

```typescript
// ...existing code...
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanComparisonArtifact } from '@/components/benefits/plan-comparison-artifact';
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

// Add test implementations
// (Use full test code from Claude.md file)
```

---

### **File: `vercel.json`**

**Task:** Configure production deployment settings.

**Copilot Prompt:** "Update Vercel configuration for production deployment with proper environment variables and function timeouts"

```json
{
  "name": "benefits-chatbot-demo",
  "version": 2,
  "env": {
    "AZURE_SEARCH_ENDPOINT": "@azure_search_endpoint",
    "AZURE_SEARCH_KEY": "@azure_search_key",
    "OPENAI_API_KEY": "@openai_api_key",
    "POSTGRES_URL": "@postgres_url",
    "AUTH_SECRET": "@auth_secret"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/analytics",
      "destination": "/analytics"
    }
  ]
}
```

---

## Testing and Deployment Commands

### Development Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm playwright test

# Run type checking
pnpm tsc --noEmit

# Run linting
pnpm lint
```

### Production Deployment

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod

# Run database migrations in production
pnpm db:migrate
```

---

## Verification Checklist

Use this checklist while developing to ensure each component works correctly:

### Database Layer

- [ ] All migrations run successfully
- [ ] Query functions return expected data types
- [ ] Foreign key relationships work
- [ ] TypeScript types compile without errors

### Azure Integration

- [ ] Search client connects successfully
- [ ] Documents can be indexed and retrieved
- [ ] Search results integrate with AI responses
- [ ] Error handling for Azure API failures

### Theming System

- [ ] Theme switching updates CSS variables in real-time
- [ ] Theme selection persists across page reloads
- [ ] All shadcn/ui components respect theme colors
- [ ] Typography changes apply correctly

### Plan Comparison

- [ ] Cost calculations are mathematically accurate
- [ ] Recommendations consider user profile data
- [ ] Interactive elements respond to user actions
- [ ] Component integrates with artifact system

### Analytics Dashboard

- [ ] Charts render with real data from database
- [ ] Date filtering works correctly
- [ ] Export functionality generates valid CSV
- [ ] Performance metrics update in real-time

### Production Deployment

- [ ] All environment variables configured
- [ ] API endpoints respond correctly
- [ ] Error monitoring active
- [ ] Performance meets requirements (<2s response times)

---

## Common Troubleshooting

### Database Issues

- **Migration failures:** Check Neon connection string and permissions
- **Type errors:** Verify Drizzle schema matches database structure
- **Query failures:** Check foreign key relationships and data types

### Azure Search Issues

- **Connection failures:** Verify endpoint URL and API key
- **No search results:** Check index exists and has documents
- **Slow responses:** Monitor Azure Search quota and performance tier

### Theme Issues

- **CSS not updating:** Check CSS variable names match theme manager
- **localStorage errors:** Handle client-side only operations
- **Hydration errors:** Ensure theme provider wraps all components

### Performance Issues

- **Slow AI responses:** Check OpenAI API rate limits and prompt length
- **Large bundle size:** Use dynamic imports for heavy components
- **Memory leaks:** Clean up event listeners and subscriptions

This file provides comprehensive guidance for implementing the Benefits Assistant Demo using GitHub Copilot and Claude Code. Each section includes specific prompts and code examples to accelerate development while maintaining code quality and consistency.
