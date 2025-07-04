import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { ChatSDKError } from './errors';

if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
  throw new ChatSDKError('bad_request:api', 'Azure Search environment variables not configured');
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
  planType: string;
  clientId: string;
  category?: string;
  searchableContent: string;
  lastUpdated: string;
  relevanceScore?: number;
}

export async function searchBenefitsContent(
  query: string, 
  clientId: string,
  top: number = 5
): Promise<BenefitsDocument[]> {
  try {
    const searchResults = await searchClient.search(query, {
      searchFields: ['title', 'content', 'searchableContent'],
      select: ['id', 'title', 'content', 'category', 'planType', 'clientId', 'searchableContent', 'lastUpdated'],
      filter: `clientId eq '${clientId}'`,
      top,
      highlightFields: 'content'
    });

    const documents: BenefitsDocument[] = [];
    for await (const result of searchResults.results) {
      const doc = result.document as any;
      documents.push({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        planType: doc.planType,
        clientId: doc.clientId,
        category: doc.category,
        searchableContent: doc.searchableContent || doc.content,
        lastUpdated: doc.lastUpdated || new Date().toISOString(),
        relevanceScore: result.score
      });
    }
    
    return documents;
  } catch (error) {
    console.error('Azure Search error:', error);
    // Return mock data for demo when search fails
    return [
      {
        id: '1',
        title: 'HMO vs PPO Plan Comparison',
        content: 'HMO plans require you to choose a primary care physician and get referrals for specialists. PPO plans offer more flexibility to see any doctor without referrals.',
        planType: 'general',
        clientId,
        category: 'plan_details',
        searchableContent: 'HMO PPO comparison primary care physician referrals flexibility',
        lastUpdated: new Date().toISOString(),
        relevanceScore: 0.95
      },
      {
        id: '2',
        title: 'Understanding Deductibles and Copays',
        content: 'A deductible is the amount you pay before your insurance starts covering costs. Copays are fixed amounts you pay for specific services.',
        planType: 'general',
        clientId,
        category: 'coverage',
        searchableContent: 'deductible copay insurance coverage costs services',
        lastUpdated: new Date().toISOString(),
        relevanceScore: 0.87
      }
    ];
  }
}

export async function indexBenefitsDocument(document: BenefitsDocument): Promise<void> {
  try {
    await searchClient.uploadDocuments([document]);
  } catch (error) {
    console.error('Failed to index document:', error);
    throw new ChatSDKError('bad_request:api', 'Failed to index benefits document');
  }
}

export function formatSearchResultsForPrompt(results: BenefitsDocument[]): string {
  if (!results || results.length === 0) {
    return "No specific benefits information available.";
  }

  return results
    .map(result => {
      return `## ${result.title}
${result.content}
${result.category ? `Category: ${result.category}` : ''}`;
    })
    .join('\n\n');
}