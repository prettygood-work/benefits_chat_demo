import { db } from '@/lib/db/drizzle';
import { benefitsPlans, clientConfigs, analyticsEvents } from '@/lib/db/schema';

const samplePlans = [
  {
    clientId: 'default-client',
    name: 'Premium PPO Plus',
    type: 'PPO' as const,
    description: 'Comprehensive coverage with maximum flexibility and nationwide access',
    monthlyPremium: { individual: 450, employeeSpouse: 650, employeeChild: 550, family: 850 },
    deductible: { individual: 1000, family: 2000 },
    outOfPocketMax: { individual: 5000, family: 10000 },
    copays: { primaryCare: 25, specialist: 50, urgentCare: 75, emergencyRoom: 250 },
    prescriptionCoverage: { generic: 10, brand: 40, specialty: 100 },
    features: ['Nationwide network', 'No referrals needed', 'Specialist access', 'Mental health coverage'],
    networkName: 'National Health Network'
  },
  {
    clientId: 'default-client', 
    name: 'Essential HMO',
    type: 'HMO' as const,
    description: 'Cost-effective managed care with coordinated services',
    monthlyPremium: { individual: 250, employeeSpouse: 450, employeeChild: 350, family: 650 },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 3000, family: 6000 },
    copays: { primaryCare: 15, specialist: 35, urgentCare: 50, emergencyRoom: 150 },
    prescriptionCoverage: { generic: 5, brand: 25, specialty: 75 },
    features: ['Local network', 'Primary care focus', 'Wellness programs', 'Preventive care'],
    networkName: 'Regional Care Network'
  },
  {
    clientId: 'default-client',
    name: 'Health Savings HDHP',
    type: 'HDHP' as const, 
    description: 'High-deductible plan with HSA eligibility for tax savings',
    monthlyPremium: { individual: 180, employeeSpouse: 320, employeeChild: 250, family: 480 },
    deductible: { individual: 2500, family: 5000 },
    outOfPocketMax: { individual: 6000, family: 12000 },
    copays: { primaryCare: 0, specialist: 0, urgentCare: 0, emergencyRoom: 0 },
    prescriptionCoverage: { generic: 0, brand: 0, specialty: 0 },
    features: ['HSA eligible', 'Lower premiums', 'Preventive care covered', 'Tax advantages'],
    networkName: 'Value Health Network'
  },
  {
    clientId: 'default-client',
    name: 'Balanced EPO',
    type: 'EPO' as const,
    description: 'Exclusive provider network with good coverage balance',
    monthlyPremium: { individual: 325, employeeSpouse: 525, employeeChild: 425, family: 725 },
    deductible: { individual: 750, family: 1500 },
    outOfPocketMax: { individual: 4000, family: 8000 },
    copays: { primaryCare: 20, specialist: 40, urgentCare: 60, emergencyRoom: 200 },
    prescriptionCoverage: { generic: 8, brand: 30, specialty: 85 },
    features: ['Exclusive network', 'No referrals', 'Coordinated care', 'Online tools'],
    networkName: 'Exclusive Provider Network'
  }
];

const sampleClientConfig = {
  name: 'TechCorp Solutions',
  theme: {
    colors: {
      primary: '#0066cc',
      secondary: '#004499', 
      accent: '#ff6b35',
      background: '#ffffff',
      text: '#1a1a1a'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px' }
    },
    branding: {
      companyName: 'TechCorp Solutions',
      tagline: 'Innovative Benefits for the Modern Workforce'
    },
    personality: {
      tone: 'professional' as const,
      formality: 'formal' as const
    }
  },
  messaging: {
    welcomeMessage: 'Welcome to your benefits consultation! How can I help you find the perfect health plan?',
    fallbackResponses: [
      'I understand you have questions about your benefits. Let me help you find the right information.',
      'Benefits can be complex. I\'m here to make it simple for you.',
      'Let me connect you with the specific information you need about your health plans.'
    ],
    specialtyPrompts: {
      cost_comparison: 'I can help you compare the costs of different plans based on your family size and expected usage.',
      plan_selection: 'Let me analyze which plan might be the best fit for your specific situation.',
      enrollment: 'I can guide you through the enrollment process and important deadlines.'
    }
  }
};

const sampleAnalyticsEvents = [
  {
    sessionId: 'session-001',
    clientId: 'default-client',
    eventType: 'conversation_start' as const,
    metadata: { userAgent: 'test', source: 'web' }
  },
  {
    sessionId: 'session-001', 
    clientId: 'default-client',
    eventType: 'plan_compared' as const,
    metadata: { plansCompared: ['1', '2'], familySize: 2 }
  },
  {
    sessionId: 'session-002',
    clientId: 'default-client', 
    eventType: 'conversation_start' as const,
    metadata: { userAgent: 'test', source: 'web' }
  },
  {
    sessionId: 'session-002',
    clientId: 'default-client',
    eventType: 'cost_calculated' as const,
    metadata: { planType: 'PPO', familySize: 1 }
  }
];

async function seedBenefitsData() {
  try {
    console.log('Seeding benefits plans...');
    
    // Insert benefits plans
    for (const plan of samplePlans) {
      await db.insert(benefitsPlans).values(plan);
    }
    
    console.log('Seeding client config...');
    // Insert client config
    await db.insert(clientConfigs).values(sampleClientConfig);
    
    console.log('Seeding analytics events...');
    // Insert sample analytics events
    for (const event of sampleAnalyticsEvents) {
      await db.insert(analyticsEvents).values(event);
    }
    
    console.log('✅ Benefits data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding benefits data:', error);
  }
}

// Run the seeder
seedBenefitsData();