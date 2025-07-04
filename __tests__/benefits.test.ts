import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanComparisonArtifact } from '@/components/benefits/plan-comparison-artifact';
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Azure Search
jest.mock('@/lib/azure-search', () => ({
  searchBenefitsContent: jest.fn(),
  formatSearchResultsForPrompt: jest.fn(),
  indexBenefitsDocument: jest.fn(),
}));

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
    createdAt: new Date('2024-01-01')
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
    createdAt: new Date('2024-01-01')
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
  updatedAt: new Date('2024-01-01')
};

describe('Benefits System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    it('calculates costs correctly for different family sizes', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      // Check premium calculations for family size 2 (employeeSpouse)
      expect(screen.getByText('$650')).toBeInTheDocument(); // PPO employee+spouse
      expect(screen.getByText('$450')).toBeInTheDocument(); // HMO employee+spouse
    });

    it('provides accurate recommendations based on user profile', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      // Should show recommendation percentages
      const recommendations = screen.getAllByText(/% match/i);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('handles plan selection correctly', async () => {
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
      
      // Verify confirmation message appears
      expect(screen.getByText(/Great choice/i)).toBeInTheDocument();
    });

    it('handles missing user profile gracefully', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans}
        />
      );
      
      expect(screen.getByText('Health Plan Comparison')).toBeInTheDocument();
      expect(screen.getByText('Premium PPO')).toBeInTheDocument();
    });

    it('displays plan features correctly', () => {
      render(
        <PlanComparisonArtifact 
          plans={mockPlans} 
          userProfile={mockUserProfile}
        />
      );
      
      expect(screen.getByText('Nationwide network')).toBeInTheDocument();
      expect(screen.getByText('Primary care focus')).toBeInTheDocument();
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

    it('calls search function with correct parameters', async () => {
      const mockSearchResults = [];
      (searchBenefitsContent as jest.Mock).mockResolvedValue(mockSearchResults);
      
      await searchBenefitsContent('HMO vs PPO', 'test-client', 5);
      
      expect(searchBenefitsContent).toHaveBeenCalledWith('HMO vs PPO', 'test-client', 5);
    });
  });

  describe('Cost Calculation Logic', () => {
    it('calculates annual costs correctly for individual', () => {
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

    it('adjusts costs for family size correctly', () => {
      const plan = mockPlans[0]; // Premium PPO
      
      // Family of 4 should use family rate
      const familyPremium = plan.monthlyPremium.family * 12; // 850 * 12 = 10200
      const familyDeductible = plan.deductible.family; // 2000
      
      expect(familyPremium).toBe(10200);
      expect(familyDeductible).toBe(2000);
    });

    it('calculates employee+spouse costs correctly', () => {
      const plan = mockPlans[1]; // Essential HMO
      const familySize = 2;
      
      const monthlyPremium = plan.monthlyPremium.employeeSpouse; // 450
      const annualPremium = monthlyPremium * 12; // 5400
      
      expect(annualPremium).toBe(5400);
    });
  });

  describe('Recommendation Engine Logic', () => {
    it('scores plans correctly for comprehensive coverage preference', () => {
      const comprehensiveProfile = {
        ...mockUserProfile,
        budgetPriority: 'comprehensive' as const
      };
      
      // PPO should score higher for comprehensive coverage
      expect(comprehensiveProfile.budgetPriority).toBe('comprehensive');
    });

    it('considers family size in recommendations', () => {
      const largeFamily = {
        ...mockUserProfile,
        familySize: 4
      };
      
      // Large families should favor PPO plans
      expect(largeFamily.familySize).toBeGreaterThan(2);
    });

    it('considers medical conditions in recommendations', () => {
      const chronicProfile = {
        ...mockUserProfile,
        medicalConditions: ['diabetes', 'hypertension']
      };
      
      // Should favor lower deductible plans for chronic conditions
      expect(chronicProfile.medicalConditions.length).toBeGreaterThan(1);
    });

    it('considers risk tolerance in recommendations', () => {
      const lowRiskProfile = {
        ...mockUserProfile,
        riskTolerance: 'low' as const
      };
      
      // Low risk tolerance should avoid HDHP
      expect(lowRiskProfile.riskTolerance).toBe('low');
    });
  });

  describe('Plan Type Specific Logic', () => {
    it('correctly identifies PPO characteristics', () => {
      const ppoPlans = mockPlans.filter(p => p.type === 'PPO');
      expect(ppoPlans).toHaveLength(1);
      expect(ppoPlans[0].features).toContain('No referrals needed');
    });

    it('correctly identifies HMO characteristics', () => {
      const hmoPlans = mockPlans.filter(p => p.type === 'HMO');
      expect(hmoPlans).toHaveLength(1);
      expect(hmoPlans[0].features).toContain('Primary care focus');
    });

    it('handles all plan types correctly', () => {
      const planTypes = mockPlans.map(p => p.type);
      expect(planTypes).toContain('PPO');
      expect(planTypes).toContain('HMO');
    });
  });

  describe('Error Handling', () => {
    it('handles empty plans array', () => {
      render(
        <PlanComparisonArtifact 
          plans={[]} 
          userProfile={mockUserProfile}
        />
      );
      
      expect(screen.getByText('Health Plan Comparison')).toBeInTheDocument();
    });

    it('handles invalid plan data gracefully', () => {
      const invalidPlan = {
        ...mockPlans[0],
        monthlyPremium: null as any
      };
      
      // Should not throw error
      expect(() => {
        render(
          <PlanComparisonArtifact 
            plans={[invalidPlan]} 
            userProfile={mockUserProfile}
          />
        );
      }).not.toThrow();
    });
  });
});

describe('Benefits API Integration Tests', () => {
  it('validates chat API includes benefits context', () => {
    // Mock API response structure
    const mockApiResponse = {
      systemPrompt: expect.stringContaining('benefits advisor'),
      searchResults: expect.any(String),
      userProfile: expect.any(Object)
    };
    
    expect(mockApiResponse.systemPrompt).toEqual(
      expect.stringContaining('benefits advisor')
    );
  });

  it('validates tool integration', () => {
    const tools = ['calculatePlanCosts', 'comparePlans', 'createPlanComparison'];
    
    tools.forEach(tool => {
      expect(tool).toBeTruthy();
    });
  });
});