import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { ChatSDKError } from './errors';

// Use environment variables safely
const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
const searchKey = process.env.AZURE_SEARCH_KEY;
const searchIndex = process.env.AZURE_SEARCH_INDEX || 'benefits-index';

let searchClient: SearchClient | null = null;

// Only initialize if all required environment variables exist
if (typeof searchEndpoint === 'string' && typeof searchKey === 'string') {
  try {
    searchClient = new SearchClient(
      searchEndpoint,
      searchIndex,
      new AzureKeyCredential(searchKey)
    );
  } catch (error) {
    console.error('Failed to initialize Azure Search client:', error);
  }
} else {
  console.warn('Azure Search is not configured. Provide AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY.');
}

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
    if (!searchClient) {
      console.log('Azure Search not configured, returning mock data');
      return getMockSearchResults(clientId);
    }
    
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
        planType: doc.planType || 'general',
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
    return getMockSearchResults(clientId);
  }
}

function getMockSearchResults(clientId: string): BenefitsDocument[] {
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

export async function indexBenefitsDocument(document: BenefitsDocument): Promise<void> {
  try {
    if (!searchClient) {
      console.log('Azure Search not configured, skipping document indexing');
      return;
    }
    
    await searchClient.uploadDocuments([document]);
  } catch (error) {
    console.error('Failed to index document:', error);
    // Don't throw errors here for demo
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