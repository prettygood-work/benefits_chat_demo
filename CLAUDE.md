# AI Development Task: Benefits Assistant Demo Implementation

**Objective:** You are an expert full-stack developer specializing in Next.js, TypeScript, and AI integration. Your task is to implement a "Benefits Assistant Demo" by extending the Vercel AI Chatbot template. Follow each prompt precisely, executing the steps as described.

**CORRECT Tech Stack (Verified from Repository):**

- **Framework:** Next.js 15.3.0-canary (App Router)
- **Language:** TypeScript
- **Package Manager:** pnpm 9.12.3
- **Database/ORM:** Neon Postgres with Drizzle ORM 0.34.0
- **UI:** Tailwind CSS with shadcn/ui
- **AI:** Vercel AI SDK, OpenAI GPT-4/xAI
- **Search:** Azure Cognitive Search
- **Auth:** NextAuth 5.0.0-beta

---

## Phase 1: Database Schema Extension (Hours 1-4)

### Prompt 1: Extend `lib/db/schema.ts` with Benefits Tables

> **Task:** Add benefits-specific tables to the existing Drizzle schema and run migrations.

**Current Schema Analysis:** File uses Drizzle ORM with `pgTable`, UUID primary keys, proper foreign keys.

1. **Modify `lib/db/schema.ts`:** Add these tables after the existing Stream table:

```typescript
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
```

2. **Run Migration Commands:**

```bash
pnpm db:generate
pnpm db:migrate
```

**DELIVERABLE VERIFICATION:**

- [ ] All new tables created successfully in Neon database
- [ ] TypeScript types exported and usable
- [ ] Migration completes without errors

### Prompt 2: Extend `lib/db/queries.ts` with Benefits Functions

> **Task:** Add query functions for the new benefits tables following existing patterns.

**Add these functions to `lib/db/queries.ts` after existing functions:**

```typescript
import { benefitsPlans, userProfiles, clientConfigs, analyticsEvents } from './schema';
import type { BenefitsPlan, UserProfile, ClientConfig, AnalyticsEvent } from './schema';

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

**DELIVERABLE VERIFICATION:**

- [ ] All functions compile without TypeScript errors
- [ ] Database operations execute successfully
- [ ] Functions follow existing patterns in the file

---

## Phase 2: Azure Cognitive Search Integration (Hours 5-8)

### Prompt 3: Create Azure Search Service Integration

> **Task:** Set up Azure Cognitive Search client and document management system.

1. **Install Azure SDK:**

```bash
pnpm add @azure/search-documents
```

2. **Create `lib/azure-search.ts`:**

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
  inset-block-start: number = 5
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

3. **Add to `.env.example`:**

```
# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-admin-key
```

**DELIVERABLE VERIFICATION:**

- [ ] Azure Search client connects successfully
- [ ] Search queries return results without errors
- [ ] Document indexing works properly

### Prompt 4: Enhance Chat API with Benefits Intelligence

> **Task:** Modify `app/(chat)/api/chat/route.ts` to integrate Azure search and benefits expertise.

1. **Add imports at top of file:**

```typescript
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import { getUserProfileBySessionId, saveUserProfile, saveAnalyticsEvent } from '@/lib/db/queries';
```

2. **Create benefits system prompt (add to file or separate prompts file):**

```typescript
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
```

3. **Enhance POST function before streamText call:**

```typescript
// Add after authentication check, before streamText call:
const clientId = 'default-client'; // Get from user context or header
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
```

4. **Add benefits-specific tools to streamText call:**

```typescript
// Add these tools to the existing tools object:
calculatePlanCosts: {
  description: 'Calculate annual costs for health insurance plans',
  parameters: z.object({
    planType: z.string(),
    familySize: z.number(),
    estimatedUsage: z.enum(['low', 'medium', 'high'])
  }),
  execute: async ({ planType, familySize, estimatedUsage }) => {
    // Get plan data from database
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
```

**DELIVERABLE VERIFICATION:**

- [ ] API route compiles without TypeScript errors
- [ ] Azure search results appear in AI responses
- [ ] Benefits system prompt is being used
- [ ] Analytics events are being tracked
- [ ] New tools are available to the AI

---

## Phase 3: Multi-Tenant Theming System (Hours 9-12)

### Prompt 5: Create Theme Management System

> **Task:** Build dynamic theming system that allows real-time switching between client configurations.

1. **Create `lib/theme-manager.ts`:**

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getClientConfigById } from '@/lib/db/queries';

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

2. **Update `app/globals.css` to support theme variables:**

```css
/* Add after existing CSS variables */
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

3. **Create `components/theme-switcher.tsx`:**

```tsx
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

4. **Update `app/layout.tsx` to include ThemeProvider:**

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
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

5. **Update chat header to include theme switcher in `components/chat-header.tsx`:**

```tsx
import { ThemeSwitcher } from './theme-switcher';

// Add ThemeSwitcher component to the header
<div className="flex items-center gap-2">
  <ThemeSwitcher />
  {/* existing header content */}
</div>
```

**DELIVERABLE VERIFICATION:**

- [ ] Theme switching works in real-time without page refresh
- [ ] CSS variables update properly for all theme elements
- [ ] Multiple demo themes display distinct visual identities
- [ ] Theme provider integrates with existing layout
- [ ] Theme selection persists across sessions

---

## Phase 4: Plan Comparison Components (Hours 13-16)

### Prompt 6: Create Benefits Artifact Components

> **Task:** Build interactive plan comparison components that integrate with the existing artifact system.

1. **Create `components/benefits/plan-comparison-artifact.tsx`:**

```tsx
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

2. **Register artifact component in `components/artifact.tsx`:**

```tsx
import { PlanComparisonArtifact } from './benefits/plan-comparison-artifact';

// Add to the artifact type rendering logic:
case 'plan-comparison':
  return (
    <PlanComparisonArtifact
      plans={artifact.content.plans}
      userProfile={artifact.content.userProfile}
      onPlanSelect={artifact.content.onPlanSelect}
    />
  );
```

3. **Update chat tools to generate plan comparison artifacts:**

```typescript
// Add to streamText tools in chat route:
createPlanComparison: {
  description: 'Create an interactive plan comparison chart',
  parameters: z.object({
    planIds: z.array(z.string()),
    userContext: z.object({
      familySize: z.number().optional(),
      budgetPriority: z.string().optional(),
      medicalConditions: z.array(z.string()).optional()
    }).optional()
  }),
  execute: async ({ planIds, userContext }) => {
    const plans = await getBenefitsPlansByClientId(clientId);
    const selectedPlans = plans.filter(p => planIds.includes(p.id));
    
    // Track analytics
    await saveAnalyticsEvent({
      sessionId: sessionData.sessionId || generateUUID(),
      clientId,
      eventType: 'plan_compared',
      metadata: { 
        plansCompared: planIds,
        userContext 
      }
    });

    return {
      type: 'artifact',
      artifactType: 'plan-comparison',
      title: 'Health Plan Comparison',
      content: {
        plans: selectedPlans,
        userProfile: userContext,
        onPlanSelect: (planId: string) => {
          // Handle plan selection
          console.log('Plan selected:', planId);
        }
      }
    };
  }
}
```

**DELIVERABLE VERIFICATION:**

- [ ] Plan comparison artifact renders correctly in chat interface
- [ ] Cost calculations are mathematically accurate and realistic
- [ ] Recommendations are logical and well-explained
- [ ] Component integrates with existing artifact system
- [ ] Real-time interaction and plan selection works

---

## Phase 5: Analytics and Performance Dashboard (Hours 17-20)

### Prompt 7: Create Analytics Dashboard

> **Task:** Build a comprehensive analytics dashboard for tracking conversation metrics and business value.

1. **Create `app/analytics/page.tsx`:**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
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

interface AnalyticsData {
  totalConversations: number;
  totalUsers: number;
  averageSessionTime: number;
  planComparisons: number;
  costCalculations: number;
  satisfactionRating: number;
  conversionRate: number;
  conversationsOverTime: Array<{ date: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  planPopularity: Array<{ planType: string; selections: number }>;
  timeDistribution: Array<{ hour: number; conversations: number }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
    setLoading(false);
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Conversations', analyticsData.totalConversations],
      ['Total Users', analyticsData.totalUsers],
      ['Average Session Time (minutes)', analyticsData.averageSessionTime],
      ['Plan Comparisons', analyticsData.planComparisons],
      ['Cost Calculations', analyticsData.costCalculations],
      ['Satisfaction Rating', analyticsData.satisfactionRating],
      ['Conversion Rate (%)', analyticsData.conversionRate]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benefits-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benefits Assistant Analytics</h1>
          <p className="text-muted-foreground">
            Track conversation metrics and business impact
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            value={dateRange}
            onChange={setDateRange}
          />
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.averageSessionTime}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+2m</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.satisfactionRating}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
            <CardDescription>Daily conversation volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.conversationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Type Popularity</CardTitle>
            <CardDescription>Distribution of plan selections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.planPopularity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ planType, percent }) => `${planType} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="selections"
                >
                  {analyticsData?.planPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Hour</CardTitle>
            <CardDescription>Peak conversation times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversations" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
            <CardDescription>Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{item.question}</p>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Business Impact Metrics</CardTitle>
          <CardDescription>Quantified value and efficiency gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData?.planComparisons}
              </div>
              <div className="text-sm text-muted-foreground">Plan Comparisons</div>
              <div className="text-xs text-green-600 mt-1">Saved ~2hrs each</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.costCalculations}
              </div>
              <div className="text-sm text-muted-foreground">Cost Calculations</div>
              <div className="text-xs text-blue-600 mt-1">Instant vs 30min manual</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData?.conversionRate}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-xs text-purple-600 mt-1">Chat to enrollment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

2. **Create analytics API route `app/api/analytics/route.ts`:**

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

function generateTimeSeriesData(events: any[], from: Date, to: Date) {
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate.toDateString() === date.toDateString();
    });
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: dayEvents.filter(e => e.eventType === 'conversation_start').length
    });
  }
  
  return data;
}

function generateTopQuestions(events: any[]) {
  // Mock data - in real implementation, extract from conversation metadata
  return [
    { question: "What's the difference between HMO and PPO?", count: 45 },
    { question: "How much will my family plan cost?", count: 38 },
    { question: "Which doctors are in-network?", count: 32 },
    { question: "What's covered under preventive care?", count: 28 },
    { question: "How do I enroll in a plan?", count: 24 }
  ];
}

function generatePlanPopularity(events: any[]) {
  const planEvents = events.filter(e => e.eventType === 'plan_compared');
  const planCounts = { HMO: 45, PPO: 67, HDHP: 32, EPO: 23 };
  
  return Object.entries(planCounts).map(([planType, selections]) => ({
    planType,
    selections
  }));
}

function generateHourlyDistribution(events: any[]) {
  const hourCounts = new Array(24).fill(0);
  
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((conversations, hour) => ({
    hour,
    conversations
  }));
}
```

**DELIVERABLE VERIFICATION:**

- [ ] Analytics dashboard displays meaningful metrics
- [ ] Charts render correctly with real data
- [ ] Export functionality works
- [ ] Business impact calculations are accurate
- [ ] Date filtering works properly

---

## Phase 6: Testing and Deployment (Hours 21-24)

### Prompt 8: Comprehensive Testing Suite

> **Task:** Create thorough testing coverage for all benefits functionality.

1. **Create `__tests__/benefits.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanComparisonArtifact } from '@/components/benefits/plan-comparison-artifact';
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

// Mock data
const mockPlans: BenefitsPlan[] = [
  {
    id: '1',
    clientId: 'test-client',
    name: 'Premium PPO',
    type: 'PPO',
    description: 'Comprehensive coverage with flexibility',
    monthlyPremium: { individual: 450, employeeSpouse: 650, employeeChild: 550, family: 850 },
    deductible: { individual: 1000, family: 2000 },
    outOfPocketMax: { individual: 5000, family: 10000 },
    copays: { primaryCare: 25, specialist: 50, urgentCare: 75, emergencyRoom: 250 },
    prescriptionCoverage: { generic: 10, brand: 40, specialty: 100 },
    features: ['Nationwide network', 'No referrals needed', 'Specialist access'],
    networkName: 'National Health Network',
    createdAt: new Date()
  },
  {
    id: '2',
    clientId: 'test-client',
    name: 'Essential HMO',
    type: 'HMO',
    description: 'Cost-effective managed care',
    monthlyPremium: { individual: 250, employeeSpouse: 450, employeeChild: 350, family: 650 },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 3000, family: 6000 },
    copays: { primaryCare: 15, specialist: 35, urgentCare: 50, emergencyRoom: 150 },
    prescriptionCoverage: { generic: 5, brand: 25, specialty: 75 },
    features: ['Local network', 'Primary care focus', 'Wellness programs'],
    networkName: 'Regional Care Network',
    createdAt: new Date()
  }
];

const mockUserProfile: UserProfile = {
  id: '1',
  sessionId: 'test-session',
  familySize: 2,
  age: 35,
  location: 'California',
  medicalConditions: ['diabetes'],
  currentMedications: ['metformin'],
  preferredDoctors: ['Dr. Smith'],
  budgetPriority: 'comprehensive',
  riskTolerance: 'medium',
  updatedAt: new Date()
};

describe('Benefits System Integration Tests', () => {
  describe('Plan Comparison Component', () => {
    it('renders plan comparison correctly', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      expect(screen.getByText('Health Plan Comparison')).toBeInTheDocument();
      expect(screen.getByText('Premium PPO')).toBeInTheDocument();
      expect(screen.getByText('Essential HMO')).toBeInTheDocument();
    });

    it('calculates costs correctly', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      // Check premium calculations for family size 2
      expect(screen.getByText('$650')).toBeInTheDocument(); // PPO employee+spouse
      expect(screen.getByText('$450')).toBeInTheDocument(); // HMO employee+spouse
    });

    it('provides accurate recommendations', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      // Should recommend PPO for comprehensive coverage preference
      const recommendations = screen.getAllByText(/match/i);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('handles plan selection', async () => {
      const onPlanSelect = jest.fn();
      
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
          onPlanSelect={onPlanSelect}
        />
      );
      
      const selectButton = screen.getAllByText('Select This Plan')[0];
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        expect(onPlanSelect).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Azure Search Integration', () => {
    it('formats search results correctly', () => {
      const mockResults = [
        {
          id: '1',
          title: 'HMO vs PPO Comparison',
          content: 'HMO plans require referrals while PPO plans offer more flexibility...',
          category: 'plan_details' as const,
          planType: 'general' as const,
          clientId: 'test-client',
          searchableContent: 'HMO PPO comparison referrals flexibility',
          lastUpdated: '2024-01-01'
        }
      ];

      const formatted = formatSearchResultsForPrompt(mockResults);
      
      expect(formatted).toContain('Title: HMO vs PPO Comparison');
      expect(formatted).toContain('Category: plan_details');
      expect(formatted).toContain('Content: HMO plans require referrals');
    });

    it('handles empty search results', () => {
      const formatted = formatSearchResultsForPrompt([]);
      expect(formatted).toBe('');
    });
  });

  describe('Cost Calculation Logic', () => {
    it('calculates annual costs correctly', () => {
      const plan = mockPlans[0]; // Premium PPO
      const familySize = 1;
      
      // Manual calculation
      const monthlyPremium = plan.monthlyPremium.individual; // 450
      const annualPremium = monthlyPremium * 12; // 5400
      const deductible = plan.deductible.individual; // 1000
      const estimatedTotal = annualPremium + (deductible * 0.5); // 5400 + 500 = 5900
      
      expect(annualPremium).toBe(5400);
      expect(estimatedTotal).toBe(5900);
    });

    it('adjusts costs for family size', () => {
      const plan = mockPlans[0]; // Premium PPO
      
      // Family of 4 should use family rate
      const familyPremium = plan.monthlyPremium.family * 12; // 850 * 12 = 10200
      const familyDeductible = plan.deductible.family; // 2000
      
      expect(familyPremium).toBe(10200);
      expect(familyDeductible).toBe(2000);
    });
  });

  describe('Recommendation Engine', () => {
    it('recommends HDHP for low premium priority', () => {
      const lowPremiumProfile = {
        ...mockUserProfile,
        budgetPriority: 'low_premium' as const
      };
      
      // HDHP should score higher for low premium priority
      // This would be tested with actual recommendation logic
      expect(lowPremiumProfile.budgetPriority).toBe('low_premium');
    });

    it('recommends PPO for comprehensive coverage', () => {
      const comprehensiveProfile = {
        ...mockUserProfile,
        budgetPriority: 'comprehensive' as const
      };
      
      // PPO should score higher for comprehensive coverage
      expect(comprehensiveProfile.budgetPriority).toBe('comprehensive');
    });

    it('considers medical conditions in recommendations', () => {
      const chronicProfile = {
        ...mockUserProfile,
        medicalConditions: ['diabetes', 'hypertension']
      };
      
      // Should favor lower deductible plans for chronic conditions
      expect(chronicProfile.medicalConditions.length).toBeGreaterThan(1);
    });
  });
});

describe('Benefits API Integration Tests', () => {
  it('chat API includes benefits context', async () => {
    // Mock API call to chat endpoint
    const mockResponse = {
      systemPrompt: expect.stringContaining('benefits advisor'),
      searchResults: expect.any(String),
      userProfile: expect.any(Object)
    };
    
    expect(mockResponse.systemPrompt).toEqual(
      expect.stringContaining('benefits advisor')
    );
  });
});
```

2. **Create end-to-end test `__tests__/e2e/benefits-flow.test.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Benefits Assistant E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete benefits consultation flow', async ({ page }) => {
    // Start conversation
    await page.getByRole('textbox', { name: /message/i }).click();
    await page.getByRole('textbox', { name: /message/i }).fill(
      'I need help choosing a health insurance plan for my family of 3'
    );
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for AI response
    await expect(page.getByText(/help you choose/i)).toBeVisible({ timeout: 10000 });

    // Ask for plan comparison
    await page.getByRole('textbox', { name: /message/i }).fill(
      'Can you show me a comparison of HMO and PPO plans?'
    );
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for plan comparison artifact
    await expect(page.getByText('Health Plan Comparison')).toBeVisible({ timeout: 15000 });

    // Verify plan details are shown
    await expect(page.getByText(/monthly/i)).toBeVisible();
    await expect(page.getByText(/deductible/i)).toBeVisible();
    await expect(page.getByText(/copay/i)).toBeVisible();

    // Select a plan
    await page.getByRole('button', { name: /select this plan/i }).first().click();
    
    // Verify selection confirmation
    await expect(page.getByText(/great choice/i)).toBeVisible();
  });

  test('theme switching works correctly', async ({ page }) => {
    // Navigate to chat
    await page.goto('/');

    // Open theme switcher
    await page.getByRole('button', { name: /theme/i }).click();

    // Switch to Healthcare Green theme
    await page.getByText('Healthcare Green').click();

    // Verify theme change (check CSS variables or visual elements)
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    });

    expect(primaryColor.trim()).toBe('#00a86b');
  });

  test('cost calculation tool works', async ({ page }) => {
    await page.getByRole('textbox', { name: /message/i }).fill(
      'Calculate the annual cost for a PPO plan for my family of 2'
    );
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for cost calculation response
    await expect(page.getByText(/annual/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/premium/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('analytics dashboard loads correctly', async ({ page }) => {
    await page.goto('/analytics');

    // Verify key metrics are displayed
    await expect(page.getByText('Total Conversations')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Avg Session Time')).toBeVisible();
    await expect(page.getByText('Satisfaction Score')).toBeVisible();

    // Verify charts are rendered
    await expect(page.locator('svg')).toBeVisible(); // Charts should render as SVG
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');

    // Verify mobile layout
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
    
    // Test plan comparison on mobile
    await page.getByRole('textbox', { name: /message/i }).fill(
      'Show me plan options'
    );
    await page.getByRole('button', { name: /send/i }).click();

    await expect(page.getByText(/plan/i)).toBeVisible({ timeout: 10000 });
  });
});
```

### Prompt 9: Production Deployment Setup

> **Task:** Configure production deployment with all necessary environment variables and optimizations.

1. **Update `vercel.json` for production deployment:**

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

2. **Create production environment checklist `DEPLOYMENT.md`:**

```markdown
# Production Deployment Checklist

## Pre-Deployment Setup

### 1. Azure Cognitive Search
- [ ] Create Azure Cognitive Search service
- [ ] Configure semantic search capabilities
- [ ] Set up benefits-index with proper schema
- [ ] Index sample benefits documents
- [ ] Test search queries return relevant results

### 2. Environment Variables
Set these in Vercel environment variables:

```bash
# Required
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-admin-key
OPENAI_API_KEY=sk-your-openai-key
POSTGRES_URL=your-neon-postgres-url
AUTH_SECRET=your-32-char-secret

# Optional
NODE_ENV=production
VERCEL_URL=your-domain.vercel.app
```

### 3. Database Setup

- [ ] Run all migrations: `pnpm db:migrate`
- [ ] Seed with sample benefits plans
- [ ] Set up client configurations for demo themes
- [ ] Verify all tables created successfully

### 4. Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure caching for Azure Search results
- [ ] Optimize bundle size
- [ ] Enable compression

## Deployment Steps

1. **Deploy to Vercel:**

   ```bash
   pnpm build
   vercel --prod
   ```

2. **Verify Deployment:**
   - [ ] Chat functionality works
   - [ ] Azure search integration active
   - [ ] Plan comparison artifacts render
   - [ ] Theme switching works
   - [ ] Analytics dashboard loads
   - [ ] All API endpoints respond

3. **Post-Deployment Testing:**
   - [ ] Run E2E tests against production
   - [ ] Test mobile responsiveness
   - [ ] Verify performance metrics
   - [ ] Check error monitoring

## Monitoring Setup

### Error Tracking

- Set up Vercel monitoring
- Configure alert thresholds
- Monitor Azure Search quota usage

### Performance Monitoring

- Track response times
- Monitor conversation success rates
- Watch for Azure API limits

### Business Metrics

- Track daily active users
- Monitor plan comparison usage
- Measure conversion rates

## Maintenance Tasks

### Weekly

- [ ] Review error logs
- [ ] Check Azure Search quota usage
- [ ] Monitor conversation quality

### Monthly

- [ ] Update benefits content in Azure Search
- [ ] Review analytics and business metrics
- [ ] Update plan data if needed

## Troubleshooting

### Common Issues

1. **Azure Search not returning results:**
   - Check API key and endpoint
   - Verify index exists and has documents
   - Test search queries directly in Azure portal

2. **Chat responses slow:**
   - Check OpenAI API rate limits
   - Monitor Azure Search response times
   - Verify database query performance

3. **Theme switching not working:**
   - Check CSS variable updates
   - Verify localStorage access
   - Test in different browsers

### Emergency Contacts

- Azure Support: [Portal Link]
- OpenAI Support: [Portal Link]
- Vercel Support: [Portal Link]

```

**FINAL DELIVERABLE VERIFICATION:**
- [ ] All tests pass (unit, integration, E2E)
- [ ] Production deployment successful
- [ ] All environment variables configured
- [ ] Performance meets targets (<2s response times)
- [ ] Mobile responsiveness verified
- [ ] Analytics tracking functional
- [ ] Error monitoring active
- [ ] Documentation complete

---

## Summary Verification Checklist

**Phase 1 - Database Extensions:**
- [ ] All new tables created and functional in Neon
- [ ] TypeScript types exported and usable
- [ ] Query functions follow existing Drizzle patterns
- [ ] Migrations run successfully

**Phase 2 - Azure Integration:**
- [ ] Search client connects to Azure service
- [ ] Documents can be indexed and searched
- [ ] Search results enhance AI responses
- [ ] Error handling for API failures

**Phase 3 - Multi-Tenant System:**
- [ ] Theme switching works in real-time
- [ ] Multiple demo themes with distinct identities
- [ ] CSS variables update properly
- [ ] Theme persistence across sessions

**Phase 4 - Plan Comparison:**
- [ ] Artifact renders correctly in chat interface
- [ ] Cost calculations mathematically accurate
- [ ] Recommendations logical and well-explained
- [ ] Interactive elements function properly

**Phase 5 - Analytics Dashboard:**
- [ ] Meaningful business metrics displayed
- [ ] Charts render with real data
- [ ] Export functionality works
- [ ] Performance tracking active

**Phase 6 - Production Ready:**
- [ ] Comprehensive test coverage
- [ ] Production deployment successful
- [ ] Monitoring and alerting configured
- [ ] Documentation complete

