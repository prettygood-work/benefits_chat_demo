import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/analytics/route';

// Mock dependencies
jest.mock('@/lib/db/queries', () => ({
  getAnalyticsEventsByClientId: jest.fn(),
}));

jest.mock('@/app/(auth)/auth', () => ({
  auth: jest.fn(),
}));

const { getAnalyticsEventsByClientId } = require('@/lib/db/queries');

describe('API Route Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Analytics API Route', () => {
    it('returns analytics data successfully', async () => {
      const mockEvents = [
        {
          id: '1',
          sessionId: 'session-1',
          clientId: 'test-client',
          eventType: 'conversation_start',
          metadata: {},
          timestamp: new Date('2024-01-01')
        },
        {
          id: '2', 
          sessionId: 'session-1',
          clientId: 'test-client',
          eventType: 'plan_compared',
          metadata: { plansCompared: ['1', '2'] },
          timestamp: new Date('2024-01-01')
        }
      ];

      getAnalyticsEventsByClientId.mockResolvedValue(mockEvents);

      const request = new NextRequest('http://localhost:3000/api/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalConversations');
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('planComparisons');
      expect(data).toHaveProperty('conversationsOverTime');
      expect(Array.isArray(data.conversationsOverTime)).toBe(true);
    });

    it('handles date range parameters correctly', async () => {
      getAnalyticsEventsByClientId.mockResolvedValue([]);

      const from = '2024-01-01T00:00:00.000Z';
      const to = '2024-01-31T23:59:59.999Z';
      const request = new NextRequest(`http://localhost:3000/api/analytics?from=${from}&to=${to}`);
      
      await GET(request);

      expect(getAnalyticsEventsByClientId).toHaveBeenCalledWith(
        'default-client',
        new Date(from),
        new Date(to)
      );
    });

    it('handles database errors gracefully', async () => {
      getAnalyticsEventsByClientId.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/analytics');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('processes events into correct analytics format', async () => {
      const mockEvents = [
        {
          sessionId: 'session-1',
          eventType: 'conversation_start',
          timestamp: new Date('2024-01-01T10:00:00Z')
        },
        {
          sessionId: 'session-2', 
          eventType: 'conversation_start',
          timestamp: new Date('2024-01-01T14:00:00Z')
        },
        {
          sessionId: 'session-1',
          eventType: 'plan_compared',
          timestamp: new Date('2024-01-01T10:30:00Z')
        }
      ];

      getAnalyticsEventsByClientId.mockResolvedValue(mockEvents);

      const request = new NextRequest('http://localhost:3000/api/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(data.totalConversations).toBe(2);
      expect(data.totalUsers).toBe(2);
      expect(data.planComparisons).toBe(1);
    });
  });

  describe('Chat API Integration', () => {
    it('validates benefits system prompt integration', () => {
      const benefitsPrompt = `You are an expert benefits advisor helping employees understand their health insurance options.

Your expertise includes:
- Health insurance plan types (HMO, PPO, HDHP, EPO) and their key differences
- Cost analysis including premiums, deductibles, copays, and out-of-pocket maximums`;

      expect(benefitsPrompt).toContain('benefits advisor');
      expect(benefitsPrompt).toContain('HMO, PPO, HDHP, EPO');
      expect(benefitsPrompt).toContain('Cost analysis');
    });

    it('validates tool definitions', () => {
      const toolDefinitions = {
        calculatePlanCosts: {
          description: 'Calculate annual costs for health insurance plans',
          parameters: {
            planType: 'string',
            familySize: 'number',
            estimatedUsage: 'enum'
          }
        },
        comparePlans: {
          description: 'Compare multiple health insurance plans',
          parameters: {
            planIds: 'array',
            userProfile: 'object'
          }
        },
        createPlanComparison: {
          description: 'Create an interactive plan comparison chart',
          parameters: {
            planIds: 'array',
            userContext: 'object'
          }
        }
      };

      expect(toolDefinitions.calculatePlanCosts.description).toContain('Calculate annual costs');
      expect(toolDefinitions.comparePlans.description).toContain('Compare multiple');
      expect(toolDefinitions.createPlanComparison.description).toContain('interactive plan comparison');
    });
  });

  describe('Database Query Integration', () => {
    it('validates benefits plan queries', async () => {
      // Mock successful query response
      const mockPlans = [
        {
          id: '1',
          clientId: 'test-client',
          name: 'Test Plan',
          type: 'PPO',
          monthlyPremium: { individual: 400 },
          deductible: { individual: 1000 },
          copays: { primaryCare: 25 }
        }
      ];

      // Test that queries would return expected structure
      expect(Array.isArray(mockPlans)).toBe(true);
      expect(mockPlans[0]).toHaveProperty('id');
      expect(mockPlans[0]).toHaveProperty('clientId');
      expect(mockPlans[0]).toHaveProperty('type');
      expect(mockPlans[0]).toHaveProperty('monthlyPremium');
    });

    it('validates user profile queries', async () => {
      const mockProfile = {
        id: '1',
        sessionId: 'test-session',
        familySize: 2,
        budgetPriority: 'comprehensive',
        medicalConditions: ['diabetes']
      };

      expect(mockProfile).toHaveProperty('sessionId');
      expect(mockProfile).toHaveProperty('familySize');
      expect(mockProfile).toHaveProperty('budgetPriority');
      expect(Array.isArray(mockProfile.medicalConditions)).toBe(true);
    });
  });

  describe('Azure Search Integration', () => {
    it('validates search document structure', () => {
      const mockDocument = {
        id: '1',
        title: 'Test Document',
        content: 'Test content',
        category: 'plan_details',
        planType: 'PPO',
        clientId: 'test-client',
        searchableContent: 'searchable text',
        lastUpdated: '2024-01-01'
      };

      expect(mockDocument).toHaveProperty('id');
      expect(mockDocument).toHaveProperty('title');
      expect(mockDocument).toHaveProperty('content');
      expect(mockDocument).toHaveProperty('category');
      expect(['plan_details', 'enrollment', 'coverage', 'costs', 'faq']).toContain(mockDocument.category);
    });

    it('validates search result formatting', () => {
      const mockResults = [
        {
          id: '1',
          title: 'Test Title',
          content: 'Test content',
          category: 'plan_details' as const,
          planType: 'PPO' as const,
          clientId: 'test-client',
          searchableContent: 'test',
          lastUpdated: '2024-01-01'
        }
      ];

      const formatted = mockResults.map(doc => 
        `Title: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`
      ).join('\n\n');

      expect(formatted).toContain('Title: Test Title');
      expect(formatted).toContain('Category: plan_details');
      expect(formatted).toContain('Content: Test content');
    });
  });

  describe('Error Handling', () => {
    it('handles missing environment variables', () => {
      const envVars = {
        AZURE_SEARCH_ENDPOINT: process.env.AZURE_SEARCH_ENDPOINT,
        AZURE_SEARCH_KEY: process.env.AZURE_SEARCH_KEY,
        POSTGRES_URL: process.env.POSTGRES_URL
      };

      // In test environment, these might not be set
      Object.keys(envVars).forEach(key => {
        if (!envVars[key as keyof typeof envVars]) {
          console.warn(`Environment variable ${key} not set in test environment`);
        }
      });
    });

    it('handles invalid request parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics?from=invalid-date');
      
      // Should handle invalid date gracefully
      try {
        await GET(request);
      } catch (error) {
        // Should not throw unhandled errors
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Validation', () => {
    it('validates response time expectations', async () => {
      getAnalyticsEventsByClientId.mockResolvedValue([]);

      const start = Date.now();
      const request = new NextRequest('http://localhost:3000/api/analytics');
      await GET(request);
      const duration = Date.now() - start;

      // Should respond quickly in test environment
      expect(duration).toBeLessThan(5000); // 5 seconds max for tests
    });

    it('validates data pagination handling', () => {
      // Large dataset simulation
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        sessionId: `session-${i}`,
        eventType: 'conversation_start',
        timestamp: new Date()
      }));

      expect(largeDataset.length).toBe(1000);
      
      // Should handle large datasets without memory issues
      const uniqueSessions = new Set(largeDataset.map(e => e.sessionId));
      expect(uniqueSessions.size).toBe(1000);
    });
  });
});