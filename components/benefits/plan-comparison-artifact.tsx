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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg space-y-6 w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Health Plan Comparison</h2>
        <p className="text-gray-600">
          Compare plans side-by-side to find the best option for {userProfile?.familySize === 1 ? 'you' : 'your family'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const costs = calculateAnnualCost(plan, userProfile?.familySize || 1);
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
              Great choice! You&apos;ve selected the {plans.find(p => p.id === selectedPlan)?.name} plan.
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