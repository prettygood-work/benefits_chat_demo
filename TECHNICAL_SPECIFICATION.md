# Benefits Assistant Demo - Technical Specification

## Based on Exact Requirements with Implementation Verification

## System Architecture Overview

### Foundation: Vercel AI Chatbot Template Extension

**Repository Analysis Quote:** *"Next.js 15.3.0-canary, Vercel AI SDK, Vercel Postgres + Drizzle ORM, NextAuth, shadcn/ui components"*

**Why This Foundation:** Existing sophisticated AI chatbot with streaming, artifacts, authentication, and chat history - provides enterprise-grade starting point.

**Quote from Spencer's Approach:** *"Rather than building a traditional FAQ-style chatbot, I propose developing a contextually-aware benefits advisor that anticipates user needs through predictive conversation flows"*

**Implementation Strategy:** Extend existing template with benefits expertise rather than rebuild core functionality.

### Required Architecture Extensions

#### Core Integration Requirements

**Quote from Job Posting:** *"Configure Azure Cognitive Search to index benefits data (FAQs, plan summaries, etc.). Integrate GPT-4 API to power conversational AI."*

**Technical Implementation:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │◄──►│  Vercel AI SDK  │◄──►│    OpenAI       │
│   Frontend       │    │   Integration   │    │    GPT-4        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Vercel Postgres │◄──►│ Azure Cognitive │◄──►│  Benefits Data  │
│   + Drizzle     │    │     Search      │    │   & Documents   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technical Implementation Details

### 1. Azure Cognitive Search Integration

**Quote from Spencer's Timeline:** *"Days 1-2: Azure Cognitive Search configuration, benefits data indexing strategy"*

#### Deliverable 1.1: Azure Search Service Setup

```typescript
// lib/azure-search-client.ts
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT!,
  'benefits-index',
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY!)
);
```

**Verification Method:** Azure Cognitive Search service responds to API calls and returns indexed benefits documents.

#### Deliverable 1.2: Benefits Document Indexing

**Quote from Job Posting:** *"index benefits data (FAQs, plan summaries, etc.)"*

```typescript
interface BenefitsDocument {
  id: string;
  title: string;
  content: string;
  category: 'plan_details' | 'enrollment' | 'coverage' | 'costs';
  plan_type: 'HMO' | 'PPO' | 'HDHP' | 'EPO';
  searchable_content: string;
  metadata: {
    last_updated: Date;
    client_id: string;
    relevance_score: number;
  };
}
```

**Verification Method:** Upload test benefits documents and confirm they are searchable through the Azure Search API.

#### Deliverable 1.3: Semantic Search Implementation

**Quote from Spencer's Proposal:** *"hybrid retrieval-augmented generation (RAG) approach, combining dense vector embeddings with traditional keyword matching"*

```typescript
export const searchBenefitsContent = async (
  query: string, 
  clientId: string
): Promise<BenefitsDocument[]> => {
  const searchResults = await searchClient.search(query, {
    searchFields: ['title', 'content', 'searchable_content'],
    filter: `client_id eq '${clientId}'`,
    top: 5,
    highlightFields: ['content'],
    semanticConfiguration: 'benefits-semantic-config'
  });
  return Array.from(searchResults.results);
};
```

**Verification Method:** Natural language queries return relevant benefits information with semantic understanding.

### 2. GPT-4 Integration with Benefits Expertise

**Quote from Spencer's Timeline:** *"Days 3-4: GPT-4 API integration, prompt engineering for benefits domain"*

#### Deliverable 2.1: Benefits-Expert System Prompts

```typescript
const BENEFITS_SYSTEM_PROMPT = `
You are an expert benefits advisor helping employees understand their health insurance options. 

Your expertise includes:
- Health insurance plan types (HMO, PPO, HDHP, EPO) and their differences
- Cost analysis including premiums, deductibles, copays, and out-of-pocket maximums
- Enrollment processes, eligibility requirements, and life event changes
- Provider networks, prescription coverage, and claims processes

Available Plans: {PLANS_CONTEXT}
User Profile: {USER_PROFILE}
Search Results: {AZURE_SEARCH_CONTEXT}

Provide personalized recommendations based on the user's specific situation, family size, medical needs, and budget preferences.
`;
```

**Verification Method:** AI responses demonstrate deep benefits knowledge and reference specific plan details from Azure search results.

#### Deliverable 2.2: Context Injection System

**Quote from Spencer's Proposal:** *"Context injection: Real-time insertion of plan details, user profile, and conversation history"*

```typescript
export const enhancePromptWithSearchResults = async (
  userMessage: string,
  userProfile: UserProfile,
  clientId: string
): Promise<string> => {
  const searchResults = await searchBenefitsContent(userMessage, clientId);
  const relevantPlans = await getClientPlans(clientId);
  
  return BENEFITS_SYSTEM_PROMPT
    .replace('{PLANS_CONTEXT}', formatPlansForPrompt(relevantPlans))
    .replace('{USER_PROFILE}', formatUserProfile(userProfile))
    .replace('{AZURE_SEARCH_CONTEXT}', formatSearchResults(searchResults));
};
```

**Verification Method:** AI responses include specific information from Azure search results and demonstrate awareness of user profile details.

#### Deliverable 2.3: Multi-Turn Conversation Management

**Quote from Job Posting:** *"Ensure the chatbot handles multi-step queries (e.g., plan comparisons, enrollment assistance)"*

```typescript
// Extend existing Vercel template's conversation system
interface BenefitsConversationContext {
  sessionId: string;
  userProfile: UserProfile;
  conversationHistory: Message[];
  currentIntent: 'plan_comparison' | 'enrollment' | 'cost_calculation' | 'general_inquiry';
  extractedEntities: {
    familySize?: number;
    medicalConditions?: string[];
    budgetPreference?: 'low_premium' | 'low_deductible' | 'comprehensive';
    preferredDoctors?: string[];
  };
}
```

**Verification Method:** Chatbot maintains context across multiple messages and provides relevant follow-up questions.

### 3. Database Schema Extensions

**Repository Analysis:** *"Uses Drizzle ORM with Vercel Postgres"*

#### Deliverable 3.1: Benefits-Specific Schema Extension

```typescript
// Extend existing lib/db/schema.ts
export const benefitsPlans = pgTable('BenefitsPlans', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('clientId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { enum: ['HMO', 'PPO', 'HDHP', 'EPO'] }).notNull(),
  monthlyPremium: json('monthlyPremium').$type<PremiumStructure>().notNull(),
  deductible: json('deductible').$type<DeductibleStructure>().notNull(),
  outOfPocketMax: json('outOfPocketMax').$type<OutOfPocketStructure>().notNull(),
  features: json('features').$type<string[]>().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const userProfiles = pgTable('UserProfiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('sessionId', { length: 255 }).notNull(),
  familySize: integer('familySize').default(1),
  medicalConditions: json('medicalConditions').$type<string[]>().default([]),
  budgetPriority: varchar('budgetPriority', { 
    enum: ['low_premium', 'low_deductible', 'comprehensive'] 
  }),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const clientConfigs = pgTable('ClientConfigs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  theme: json('theme').$type<ClientTheme>().notNull(),
  messaging: json('messaging').$type<ClientMessaging>().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
```

**Verification Method:** Database tables created successfully with proper foreign key relationships and can store/retrieve benefits data.

### 4. Multi-Tenant White-Label System

**Quote from Melodie:** *"could we leverage the same framework and simply upload new benefits data, tweak branding, or adjust tone for each new client?"*

#### Deliverable 4.1: Theme Management System

```typescript
interface ClientTheme {
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
}

// Extend existing shadcn/ui theming system
export function applyClientTheme(theme: ClientTheme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
```

**Verification Method:** Theme switching works in real-time, completely changing appearance and messaging without page refresh.

#### Deliverable 4.2: Client Configuration Management

```typescript
// app/api/clients/[clientId]/config/route.ts
export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  const client = await db.select().from(clientConfigs)
    .where(eq(clientConfigs.id, params.clientId))
    .limit(1);
  
  return Response.json(client[0]);
}
```

**Verification Method:** Multiple client configurations can be stored and retrieved, each with different themes and messaging.

### 5. Plan Comparison and Cost Calculation

**Quote from Job Posting:** *"multi-step queries (e.g., plan comparisons, enrollment assistance)"*

#### Deliverable 5.1: Cost Calculation Engine

```typescript
interface CostCalculationResult {
  plan: BenefitsPlan;
  annualCosts: {
    premiums: number;
    estimatedDeductible: number;
    estimatedCopays: number;
    estimatedPrescriptions: number;
    totalEstimated: number;
  };
  recommendations: {
    score: number;
    reasoning: string;
    pros: string[];
    cons: string[];
  };
}

export function calculatePlanCosts(
  plan: BenefitsPlan,
  userProfile: UserProfile,
  usageEstimate: 'low' | 'medium' | 'high'
): CostCalculationResult {
  // Implementation with accurate cost calculation logic
}
```

**Verification Method:** Cost calculations are mathematically accurate and provide realistic annual cost projections.

#### Deliverable 5.2: Plan Comparison Components

```tsx
// Extend existing artifact system for plan comparisons
export function PlanComparisonArtifact({
  plans,
  userProfile
}: {
  plans: BenefitsPlan[];
  userProfile: UserProfile;
}) {
  const calculations = plans.map(plan => 
    calculatePlanCosts(plan, userProfile, 'medium')
  );
  
  return (
    <div className="plan-comparison-grid">
      {calculations.map((calc, index) => (
        <PlanCard key={plans[index].id} calculation={calc} />
      ))}
    </div>
  );
}
```

**Verification Method:** Plan comparison renders correctly within chat interface and provides accurate side-by-side analysis.

### 6. Analytics Dashboard

**Quote from Job Posting:** *"Familiarity with Google Analytics or Dimension Labs for chatbot performance monitoring"*

#### Deliverable 6.1: Conversation Analytics

```typescript
// Extend existing message tracking with benefits-specific events
export const analyticsEvents = pgTable('AnalyticsEvents', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('sessionId', { length: 255 }).notNull(),
  clientId: uuid('clientId').notNull(),
  eventType: varchar('eventType', {
    enum: ['conversation_start', 'plan_compared', 'cost_calculated', 'recommendation_viewed']
  }).notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
```

**Verification Method:** Analytics events are captured during conversations and displayed in real-time dashboard.

#### Deliverable 6.2: Business Metrics Dashboard

```tsx
// app/analytics/page.tsx - New analytics route
export default async function AnalyticsDashboard() {
  const metrics = await getAnalyticsMetrics();
  
  return (
    <div className="analytics-dashboard">
      <MetricCard title="Total Conversations" value={metrics.totalConversations} />
      <MetricCard title="Plan Comparisons" value={metrics.planComparisons} />
      <MetricCard title="Avg Satisfaction" value={metrics.avgSatisfaction} />
      <ConversationVolumeChart data={metrics.conversationTrends} />
      <PopularTopicsChart data={metrics.popularTopics} />
    </div>
  );
}
```

**Verification Method:** Dashboard displays meaningful business metrics and updates in real-time during demo conversations.

## Environment Configuration

### Required Environment Variables

```bash
# Azure Cognitive Search
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-admin-key

# OpenAI API (for GPT-4)
OPENAI_API_KEY=sk-your-openai-key

# Existing Vercel template variables
POSTGRES_URL=your-vercel-postgres-url
AUTH_SECRET=your-auth-secret
```

**Verification Method:** All services connect successfully with proper authentication.

## Deployment Configuration

### Vercel Deployment with Azure Integration

```json
// vercel.json
{
  "name": "benefits-chatbot-demo",
  "version": 2,
  "env": {
    "AZURE_SEARCH_ENDPOINT": "@azure_search_endpoint",
    "AZURE_SEARCH_KEY": "@azure_search_key",
    "OPENAI_API_KEY": "@openai_api_key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

**Verification Method:** Application deploys successfully to Vercel with all integrations working.

## Performance Targets and Verification

### Response Time Requirements

**Quote from Job Posting:** *"Optimize response times and ensure cross-device/browser compatibility"*

**Targets:**

- AI response initiation: < 1 second
- Azure search results: < 500ms
- Plan comparison rendering: < 2 seconds
- Theme switching: < 200ms

**Verification Method:** Performance testing with realistic data loads confirms all targets are met.

### Accuracy Requirements

**Quote from Job Posting:** *"Test the chatbot for accuracy, fallback handling, and edge cases"*

**Targets:**

- 95%+ accurate responses to benefits questions
- Proper fallback handling for unsupported queries
- Edge case handling for unusual scenarios

**Verification Method:** Comprehensive test suite covering all benefits scenarios with manual verification of accuracy.

This technical specification provides exact implementation details based on Melodie's requirements with clear deliverables and verification methods for every component.
