Prompt 1: Extend lib/db/schema.ts with Benefits Tables
Current Schema Analysis:

File: lib/db/schema.ts
Existing tables: User, Chat, Message_v2, Document, Suggestion, Vote_v2, Stream
Uses Drizzle ORM with pgTable, UUID primary keys, proper foreign keys

SPECIFIC IMPLEMENTATION DEMANDS:

Add these exact tables to lib/db/schema.ts after the existing Stream table:

typescriptexport const benefitsPlans = pgTable('BenefitsPlans', {
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
    helpText: string;
    errorMessage: string;
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

Create migration file:

Run: pnpm db:generate to create migration
Run: pnpm db:migrate to apply migration

DELIVERABLE VERIFICATION:

 Tables created in database without errors
 TypeScript types exported and usable
 Foreign key relationships work properly
 JSON columns accept and return proper TypeScript types

Prompt 2: Extend lib/db/queries.ts with Benefits Functions
Current File Analysis:

File: lib/db/queries.ts
Existing functions: getChatById, saveChat, getMessagesByChatId, saveMessages, etc.
Uses Drizzle ORM with proper error handling

SPECIFIC IMPLEMENTATION DEMANDS:

Add these exact functions to lib/db/queries.ts after existing functions:

typescript// Benefits Plans
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
DELIVERABLE VERIFICATION:

 All functions compile without TypeScript errors
 Database operations execute successfully
 Functions follow existing patterns in the file
 Error handling matches existing functions

Phase 2: Azure Cognitive Search Integration (Hours 5-8)
Prompt 3: Create lib/azure-search.ts Integration
Repository Analysis:

No existing Azure integration
Uses environment variables pattern from .env.example
API routes follow pattern in app/(chat)/api/ directory

SPECIFIC IMPLEMENTATION DEMANDS:

Create new file lib/azure-search.ts:

typescriptimport { SearchClient, AzureKeyCredential } from '@azure/search-documents';

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

Add to .env.example:

AZURE_SEARCH_ENDPOINT=<https://your-search-service.search.windows.net>
AZURE_SEARCH_KEY=your-search-admin-key

Install Azure Search SDK:

bashpnpm add @azure/search-documents
DELIVERABLE VERIFICATION:

 Azure Search client connects successfully
 Search queries return results without errors
 Document indexing works properly
 Environment variables configured correctly

Prompt 4: Modify app/(chat)/api/chat/route.ts for Benefits Integration
Current File Analysis:

File: app/(chat)/api/chat/route.ts
Uses Vercel AI SDK with streamText function
Has existing tool implementations (createDocument, updateDocument, etc.)
Uses system prompts from lib/ai/prompts

SPECIFIC IMPLEMENTATION DEMANDS:

Add Azure Search import at top of file:

typescriptimport { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import { getUserProfileBySessionId, saveUserProfile, saveAnalyticsEvent } from '@/lib/db/queries';

Replace existing system prompt with benefits-specific version:

Modify lib/ai/prompts.ts or override in chat route
Add this benefits system prompt:

typescriptconst BENEFITS_SYSTEM_PROMPT = `You are an expert benefits advisor helping employees understand their health insurance options.

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

Enhance the main POST function with search integration:

typescript// Add after authentication check, before streamText call:
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

Add benefits-specific tools to the streamText call:

typescript// Add these tools to the existing tools object:
calculatePlanCosts: {
  description: 'Calculate annual costs for health insurance plans',
  parameters: z.object({
    planType: z.string(),
    familySize: z.number(),
    estimatedUsage: z.enum(['low', 'medium', 'high'])
  }),
  execute: async ({ planType, familySize, estimatedUsage }) => {
    // Implementation for cost calculation
    return {
      annualPremiums: 0,
      estimatedDeductible: 0,
      totalEstimatedCost: 0
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
    // Implementation for plan comparison
    return {
      comparison: 'Plan comparison results'
    };
  }
}
DELIVERABLE VERIFICATION:

 API route compiles without TypeScript errors
 Azure search results appear in AI responses
 Benefits system prompt is being used
 Analytics events are being tracked
 New tools are available to the AI

Phase 3: Multi-Tenant Theming System (Hours 9-12)
Prompt 5: Create Multi-Tenant Theme System
Current Theme Analysis:

Uses next-themes for dark/light mode
CSS variables in app/globals.css
shadcn/ui components with theme support

SPECIFIC IMPLEMENTATION DEMANDS:

Create lib/theme-manager.ts:

typescript'use client';

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
  messaging: {
    welcomeMessage: string;
    helpText: string;
    errorMessage: string;
  };
}

export const defaultThemes: ClientTheme[] = [
  {
    id: 'techcorp',
    name: 'TechCorp Benefits',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      foreground: '#1e293b',
      muted: '#f8fafc',
      border: '#e2e8f0'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      }
    },
    branding: {
      companyName: 'TechCorp',
      tagline: 'Smart Benefits for Smart People'
    },
    personality: {
      tone: 'professional',
      formality: 'conversational'
    },
    messaging: {
      welcomeMessage: 'Welcome to TechCorp Benefits! I\'m here to help you navigate your health insurance options.',
      helpText: 'I can help you compare plans, calculate costs, and find the perfect coverage for your needs.',
      errorMessage: 'I apologize, but I encountered an issue. Please try rephrasing your question.'
    }
  },
  {
    id: 'medcenter',
    name: 'MedCenter Employee Benefits',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      foreground: '#064e3b',
      muted: '#f0fdf4',
      border: '#d1fae5'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
      }
    },
    branding: {
      companyName: 'MedCenter',
      tagline: 'Caring for Those Who Care'
    },
    personality: {
      tone: 'friendly',
      formality: 'conversational'
    },
    messaging: {
      welcomeMessage: 'Hello! As a healthcare professional, you understand the importance of good coverage. Let me help you find the right plan.',
      helpText: 'I specialize in healthcare benefits and can provide detailed information about medical coverage and networks.',
      errorMessage: 'I\'m having trouble with that request. Let me connect you with our benefits specialists.'
    }
  }
];

const ThemeContext = createContext<{
  currentTheme: ClientTheme;
  setThemeById: (themeId: string) => void;
  availableThemes: ClientTheme[];
}>({
  currentTheme: defaultThemes[0],
  setThemeById: () => {},
  availableThemes: defaultThemes
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ClientTheme>(defaultThemes[0]);
  
  const setThemeById = (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      applyThemeVariables(theme);
    }
  };
  
  useEffect(() => {
    applyThemeVariables(currentTheme);
  }, [currentTheme]);
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setThemeById,
      availableThemes: defaultThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyThemeVariables(theme: ClientTheme) {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Apply typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
}

export const useTheme = () => useContext(ThemeContext);

Modify app/layout.tsx to include ThemeProvider:

typescriptimport { ThemeProvider } from '@/lib/theme-manager';

// Wrap existing content with ThemeProvider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/*existing providers*/}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

Create theme switching component components/theme-switcher.tsx:

tsx'use client';

import { useTheme } from '@/lib/theme-manager';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSwitcher() {
  const { currentTheme, setThemeById, availableThemes } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {currentTheme.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setThemeById(theme.id)}
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
DELIVERABLE VERIFICATION:

 Theme switching works in real-time without page refresh
 CSS variables update properly for all theme elements
 Multiple demo themes display distinct visual identities
 Theme provider integrates with existing layout

Phase 4: Plan Comparison Components (Hours 13-16)
Prompt 6: Create Benefits Artifact Components
Current Artifact Analysis:

Artifact system in components/artifact.tsx and components/create-artifact.tsx
Uses streaming UI parts and metadata management
Existing artifact types: text, code, image, sheet

SPECIFIC IMPLEMENTATION DEMANDS:

Create components/benefits/plan-comparison-artifact.tsx:

tsx'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

    const annualPremium = plan.monthlyPremium[premiumKey] * 12;
    const estimatedDeductible = plan.deductible[familySize === 1 ? 'individual' : 'family'] * 0.5; // Estimate 50% usage
    
    return annualPremium + estimatedDeductible;
  };
  
  const getRecommendation = (plan: BenefitsPlan, userProfile?: UserProfile) => {
    if (!userProfile) return null;

    const hasConditions = userProfile.medicalConditions.length > 0;
    const isLargeFam
ily = userProfile.familySize > 2;

    if (plan.type === 'HMO' && !hasConditions && !isLargeFamily) {
      return { score: 85, reason: 'Great value for healthy individuals' };
    }
    if (plan.type === 'PPO' && hasConditions) {
      return { score: 90, reason: 'Best for ongoing medical needs' };
    }
    if (plan.type === 'HDHP' && userProfile.budgetPriority === 'low_premium') {
      return { score: 80, reason: 'Lowest monthly costs' };
    }
    
    return { score: 70, reason: 'Good general coverage' };
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Health Plan Comparison</h2>
        <p className="text-muted-foreground">
          Compare plans side-by-side to find the best option for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const recommendation = getRecommendation(plan, userProfile);
          const annualCost = calculateAnnualCost(plan, userProfile?.familySize);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {recommendation && recommendation.score >= 85 && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  Recommended
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <Badge variant="outline">{plan.type}</Badge>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Monthly Premium</p>
                    <p className="text-lg font-bold text-primary">
                      ${plan.monthlyPremium.individual}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Deductible</p>
                    <p className="text-lg font-bold">
                      ${plan.deductible.individual}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Est. Annual Cost</p>
                    <p className="text-lg font-bold text-green-600">
                      ${Math.round(annualCost).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Out-of-Pocket Max</p>
                    <p className="text-lg font-bold">
                      ${plan.outOfPocketMax.individual}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Key Features</p>
                  <ul className="text-sm space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-primary rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {recommendation && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Recommendation Score: {recommendation.score}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recommendation.reason}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanSelect?.(plan.id);
                  }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Register new artifact type in components/artifact.tsx:

typescript// Add to artifact registry
import { PlanComparisonArtifact } from './benefits/plan-comparison-artifact';

// Add to artifact mapping
const artifactComponents = {
  // existing artifacts...
  'plan-comparison': PlanComparisonArtifact,
};

Create cost calculation utility lib/benefits-calculator.ts:

typescriptimport type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

export interface CostCalculationResult {
  plan: BenefitsPlan;
  annualCosts: {
    premiums: number;
    estimatedDeductible: number;
    estimatedCopays: number;
    estimatedPrescriptions: number;
    totalEstimated: number;
  };
  recommendation: {
    score: number;
    reasoning: string;
    pros: string[];
    cons: string[];
  };
}

export function calculatePlanCosts(
  plan: BenefitsPlan,
  userProfile: UserProfile,
  usageEstimate: 'low' | 'medium' | 'high' = 'medium'
): CostCalculationResult {
  
  const familySize = userProfile.familySize;
  const hasConditions = userProfile.medicalConditions.length > 0;
  
  // Calculate premiums based on family size
  const premiumKey = familySize === 1 ? 'individual'
    : familySize === 2 ? 'employeeSpouse'
    : familySize === 3 ? 'employeeChild'
    : 'family';
  
  const annualPremiums = plan.monthlyPremium[premiumKey] * 12;
  
  // Estimate deductible usage based on health conditions and usage
  const deductibleUsage = usageEstimate === 'low' ? 0.2
    : usageEstimate === 'medium' ? 0.5
    : 0.8;
  
  const deductibleAmount = plan.deductible[familySize === 1 ? 'individual' : 'family'];
  const estimatedDeductible = deductibleAmount * deductibleUsage;
  
  // Estimate copays based on usage and family size
  const visitMultiplier = familySize *(usageEstimate === 'low' ? 2 : usageEstimate === 'medium' ? 4 : 8);
  const estimatedCopays = plan.copays.primaryCare* visitMultiplier;
  
  // Estimate prescription costs
  const prescriptionMultiplier = userProfile.currentMedications.length || 1;
  const estimatedPrescriptions = plan.prescriptionCoverage.generic *prescriptionMultiplier* 12;
  
  const totalEstimated = annualPremiums + estimatedDeductible + estimatedCopays + estimatedPrescriptions;
  
  // Generate recommendation
  const recommendation = generateRecommendation(plan, userProfile, totalEstimated);
  
  return {
    plan,
    annualCosts: {
      premiums: annualPremiums,
      estimatedDeductible,
      estimatedCopays,
      estimatedPrescriptions,
      totalEstimated
    },
    recommendation
  };
}

function generateRecommendation(
  plan: BenefitsPlan,
  userProfile: UserProfile,
  totalCost: number
) {
  let score = 70; // Base score
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Analyze based on plan type and user profile
  if (plan.type === 'HMO') {
    if (userProfile.budgetPriority === 'low_premium') {
      score += 15;
      pros.push('Lower monthly premiums');
    }
    if (userProfile.medicalConditions.length === 0) {
      score += 10;
      pros.push('Great for preventive care');
    } else {
      score -= 10;
      cons.push('Requires referrals for specialists');
    }
  }
  
  if (plan.type === 'PPO') {
    if (userProfile.medicalConditions.length > 0) {
      score += 15;
      pros.push('No referrals needed for specialists');
    }
    if (userProfile.budgetPriority === 'low_premium') {
      score -= 10;
      cons.push('Higher monthly premiums');
    }
    pros.push('Maximum flexibility in provider choice');
  }
  
  if (plan.type === 'HDHP') {
    if (userProfile.budgetPriority === 'low_premium') {
      score += 20;
      pros.push('Lowest monthly premiums');
      pros.push('HSA eligibility for tax savings');
    }
    if (userProfile.medicalConditions.length > 0) {
      score -= 15;
      cons.push('High deductible with ongoing medical needs');
    }
  }
  
  // Family size considerations
  if (userProfile.familySize > 2 && plan.type === 'HMO') {
    score += 5;
    pros.push('Cost-effective for families');
  }
  
  const reasoning = score >= 85 ? 'Excellent match for your situation'
    : score >= 75 ? 'Good option worth considering'
    : score >= 65 ? 'Adequate coverage with some trade-offs'
    : 'May not be the best fit for your needs';
  
  return {
    score: Math.min(100, Math.max(0, score)),
    reasoning,
    pros,
    cons
  };
}
DELIVERABLE VERIFICATION:

 Plan comparison artifact renders correctly in chat interface
 Cost calculations are mathematically accurate and realistic
 Recommendations are logical and well-explained
 Component integrates with existing artifact system
 Real-time interaction and plan selection works

Summary Verification Checklist
Database Extensions:

 All new tables created and functional
 TypeScript types exported and usable
 Foreign key relationships working
 Query functions following existing patterns

Azure Integration:

 Search client connects to Azure service
 Documents can be indexed and searched
 Search results enhance AI responses
 Error handling for API failures

AI Enhancement:

 Benefits system prompts being used
 Search results appear in conversations
 New tools available to AI
 Analytics events being tracked

Multi-Tenant System:

 Theme switching works in real-time
 Multiple demo themes with distinct identities
 CSS variables update properly
 Theme provider integrates with layout

Plan Comparison:

 Artifact renders in chat interface
 Cost calculations accurate and realistic
 Recommendations logical and explained
 Interactive elements function properly

Each deliverable must pass verification before proceeding to the next phase.
