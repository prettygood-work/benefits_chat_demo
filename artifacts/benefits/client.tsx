import { Artifact } from '@/components/create-artifact';
import { PlanComparisonArtifact } from '@/components/benefits/plan-comparison-artifact';
import { CopyIcon } from '@/components/icons';
import { toast } from 'sonner';
import type { BenefitsPlan, UserProfile } from '@/lib/db/schema';

interface BenefitsArtifactMetadata {
  plans: BenefitsPlan[];
  userProfile?: UserProfile;
}

export const benefitsArtifact = new Artifact<'benefits', BenefitsArtifactMetadata>({
  kind: 'benefits',
  description: 'Interactive benefits plan comparison and analysis tools.',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      plans: [],
    });
  },
  onStreamPart: ({ streamPart, setMetadata }) => {
    if (streamPart.type === 'data-benefits-plans') {
      // Type assertion for the specific case
      const benefitsStreamPart = streamPart as any;
      setMetadata((metadata) => ({
        ...metadata,
        plans: benefitsStreamPart.data?.plans || [],
        userProfile: benefitsStreamPart.data?.userProfile,
      }));
    }
  },
  content: ({ content, metadata, isLoading }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    try {
      const parsedContent = JSON.parse(content);
      
      return (
        <PlanComparisonArtifact
          plans={parsedContent.plans || metadata?.plans || []}
          userProfile={parsedContent.userProfile || metadata?.userProfile}
          onPlanSelect={(planId) => {
            console.log('Plan selected:', planId);
            toast.success('Plan selected successfully!');
          }}
        />
      );
    } catch (error) {
      console.error('Failed to parse benefits content:', error);
      return (
        <div className="p-6 text-center">
          <p className="text-red-600">Failed to load benefits comparison</p>
        </div>
      );
    }
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy plan details',
      onClick: ({ content }) => {
        try {
          const parsedContent = JSON.parse(content);
          const planDetails = parsedContent.plans
            .map((plan: BenefitsPlan) => 
              `${plan.name} (${plan.type}): $${plan.monthlyPremium.individual}/month`
            )
            .join('\n');
          
          navigator.clipboard.writeText(planDetails);
          toast.success('Plan details copied to clipboard!');
        } catch (error) {
          toast.error('Failed to copy plan details');
        }
      },
    },
  ],
  toolbar: [],
});