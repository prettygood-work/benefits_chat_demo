```markdown
# Claude AI Assistant Instructions - Benefits Advisory Platform

## Project Context
You are assisting with development of a sophisticated multi-tenant benefits advisory chatbot. The platform serves enterprise clients (credit unions, employers) and their employees, providing AI-powered benefits selection guidance.

## Critical Architecture Principles

### 1. Multi-Tenancy ALWAYS
```typescript
// ❌ NEVER write queries without tenant isolation
const plans = await db.select().from(benefitsPlans);

// ✅ ALWAYS include tenantId
const plans = await db.select()
  .from(benefitsPlans)
  .where(eq(benefitsPlans.tenantId, tenantId));
2. Type Safety Mandatory
typescript// ❌ NEVER use 'any' type
const processData = (data: any) => { ... }

// ✅ ALWAYS define interfaces
interface BenefitsData {
  planId: string;
  costs: PlanCosts;
  coverage: CoverageDetails;
}
const processData = (data: BenefitsData) => { ... }
3. Error Handling Pattern
typescript// ✅ ALWAYS use this pattern
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
Phase-Specific Implementation Rules
Phase 1: Multi-Tenant Foundation

Create tenant isolation at database level
Implement subdomain routing: [tenant].platform.com
Use row-level security policies
Test with minimum 3 tenants

Phase 2: Knowledge & Search

Chunk documents intelligently (1000 chars, 200 overlap)
Always cite sources in AI responses
Implement retry logic for Azure Search
Index documents with tenant isolation

Phase 3: Visual Comparisons

Use Framer Motion for all animations
Implement skeleton loaders during data fetch
Cards must be mobile-responsive
Cost calculations must be mathematically accurate

Phase 4: Personalization

Progressive profile building (never ask all at once)
Store profile in database, not just session
Recommendation scores must be explainable
Privacy-first approach to medical data

Phase 5: Analytics

Aggregate data must never expose individual sessions
Export functions must respect tenant boundaries
Real-time updates via WebSocket where applicable
Cache expensive calculations

Code Quality Standards
Naming Conventions
typescript// Components: PascalCase
export function PlanComparisonCard() { }

// Hooks: camelCase with 'use' prefix
export function useBenefitsRecommendation() { }

// API routes: kebab-case
// /api/admin/tenant-settings

// Database tables: PascalCase
export const BenefitsPlans = pgTable('BenefitsPlans', {})

// Constants: SCREAMING_SNAKE_CASE
const MAX_PLAN_COMPARISONS = 5;
File Organization
typescript// Each component file structure:
// 1. Imports (grouped by type)
// 2. Type definitions
// 3. Constants
// 4. Main component
// 5. Sub-components
// 6. Utility functions
// 7. Exports
Performance Optimizations
typescript// Use React.memo for expensive components
export const PlanCard = memo(PlanCardComponent);

// Implement virtual scrolling for long lists
// Use intersection observer for lazy loading
// Debounce search inputs (300ms)
// Cache Azure Search results (5 minutes)
Testing Requirements
typescript// Every new feature needs:
describe('Feature: Plan Comparison', () => {
  test('renders all plans', async () => {});
  test('calculates costs correctly', () => {});
  test('handles empty state', () => {});
  test('maintains tenant isolation', () => {});
  test('performs within 100ms', () => {});
});
Common Pitfalls to Avoid
1. Tenant Data Leakage

Always verify tenantId in API routes
Never store tenantId in localStorage
Use server-side session management

2. AI Hallucinations

Always provide plan context to AI
Validate AI responses against source data
Never let AI generate specific prices

3. Performance Issues

Paginate large datasets (50 items max)
Implement infinite scroll, not "load more"
Use database indexes on filtered columns

4. Security Vulnerabilities

Sanitize all user inputs
Use parameterized queries only
Implement rate limiting (100 req/min)

Database Query Patterns
Efficient Joins
typescript// Get plans with usage stats
const plansWithStats = await db
  .select({
    plan: benefitsPlans,
    selections: count(planSelections.id),
  })
  .from(benefitsPlans)
  .leftJoin(planSelections, eq(benefitsPlans.id, planSelections.planId))
  .where(eq(benefitsPlans.tenantId, tenantId))
  .groupBy(benefitsPlans.id);
Transaction Pattern
typescriptawait db.transaction(async (tx) => {
  const user = await tx.insert(userProfiles).values(userData).returning();
  await tx.insert(analyticsEvents).values({
    eventType: 'profile_created',
    userId: user[0].id,
  });
});
AI Integration Patterns
System Prompt Structure
typescriptconst systemPrompt = `
Role: ${tenant.settings.voice.personality}
Tone: ${tenant.settings.voice.tone}
Company: ${tenant.name}

Available Plans:
${formatPlansForAI(plans)}

User Context:
${formatUserProfile(profile)}

Rules:
1. Only discuss provided plans
2. Always cite specific costs
3. Ask one question at a time
4. ${tenant.settings.customRules}
`;
Response Validation
typescriptfunction validateAIResponse(response: string, plans: Plan[]): boolean {
  // Check for hallucinated plan names
  // Verify cited costs match database
  // Ensure tone matches configuration
  return isValid;
}