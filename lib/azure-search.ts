import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { ChatSDKError } from './errors';

// Use environment variables safely
const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
const searchKey = process.env.AZURE_SEARCH_KEY;
const searchIndex = process.env.AZURE_SEARCH_INDEX || 'benefits-index';

let searchClient: SearchClient<BenefitsDocument> | null = null;

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
  planType?: 'HMO' | 'PPO' | 'HDHP' | 'EPO' | 'general';
  clientId?: string;
  category?: 'plan_details' | 'enrollment' | 'coverage' | 'costs' | 'faq' | 'general';
  searchableContent?: string;
  lastUpdated?: string;
  relevanceScore?: number;
  tags?: string[];
}

export async function searchBenefitsContent(
  query: string, 
  clientId: string,
  options: {
    top?: number;
    planType?: string;
    category?: string;
  } = {}
): Promise<BenefitsDocument[]> {
  if (!searchClient) {
    console.warn('Azure Search client not initialized, returning mock data');
    return getMockSearchResults(query, clientId);
  }

  try {
    const { top = 5, planType, category } = options;
    
    // Build filter conditions
    const filters = [`clientId eq '${clientId}'`];
    if (planType) filters.push(`planType eq '${planType}'`);
    if (category) filters.push(`category eq '${category}'`);
    
    const searchResults = await searchClient.search(query, {
      searchFields: ['title', 'content', 'searchableContent', 'tags'],
      select: ['id', 'title', 'content', 'category', 'planType', 'clientId', 'tags'],
      filter: filters.join(' and '),
      top,
      orderBy: ['search.score() desc'],
      includeTotalCount: true
    });

    const documents: BenefitsDocument[] = [];
    for await (const result of searchResults.results) {
      const doc = result.document as any;
      documents.push({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        planType: doc.planType,
        clientId: doc.clientId,
        tags: doc.tags,
        searchableContent: doc.searchableContent,
        lastUpdated: doc.lastUpdated,
        relevanceScore: result.score
      });
    }
    
    return documents;
  } catch (error) {
    console.error('Azure Search error:', error);
    return getMockSearchResults(query, clientId);
  }
}

export async function indexBenefitsDocument(document: BenefitsDocument): Promise<void> {
  if (!searchClient) {
    console.warn('Azure Search client not initialized, skipping indexing');
    return;
  }

  try {
    // Enhance document with searchable content if not provided
    if (!document.searchableContent) {
      document.searchableContent = `${document.title} ${document.content} ${document.tags?.join(' ') || ''}`.toLowerCase();
    }
    
    await searchClient.uploadDocuments([document]);
    console.log(`Successfully indexed document: ${document.id}`);
  } catch (error) {
    console.error('Failed to index document:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to index benefits document');
  }
}

export async function deleteBenefitsDocument(documentId: string): Promise<void> {
  if (!searchClient) {
    console.warn('Azure Search client not initialized, skipping deletion');
    return;
  }

  try {
    await searchClient.deleteDocuments('id', [documentId]);
    console.log(`Successfully deleted document: ${documentId}`);
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to delete benefits document');
  }
}

// Mock data for development/testing when Azure Search is not available
function getMockSearchResults(query: string, clientId: string): BenefitsDocument[] {
  const mockDocuments: BenefitsDocument[] = [
    {
      id: 'mock-1',
      title: 'HMO vs PPO Plan Comparison',
      content: 'HMO plans require referrals for specialists but offer lower costs. PPO plans provide more flexibility to see specialists without referrals but typically have higher premiums.',
      category: 'plan_details',
      planType: 'general',
      clientId,
      tags: ['HMO', 'PPO', 'comparison', 'specialists', 'referrals'],
      lastUpdated: new Date().toISOString(),
      relevanceScore: 0.9
    },
    {
      id: 'mock-2',
      title: 'Understanding Deductibles and Out-of-Pocket Maximums',
      content: 'Your deductible is the amount you pay before insurance starts covering costs. The out-of-pocket maximum is the most you\'ll pay in a year for covered services.',
      category: 'costs',
      planType: 'general',
      clientId,
      tags: ['deductible', 'out-of-pocket', 'costs', 'coverage'],
      lastUpdated: new Date().toISOString(),
      relevanceScore: 0.8
    },
    {
      id: 'mock-3',
      title: 'Enrollment Periods and Deadlines',
      content: 'Open enrollment typically runs from November to December. You can also enroll during special enrollment periods triggered by life events like marriage or job changes.',
      category: 'enrollment',
      planType: 'general',
      clientId,
      tags: ['enrollment', 'deadlines', 'life events', 'open enrollment'],
      lastUpdated: new Date().toISOString(),
      relevanceScore: 0.7
    }
  ];

  // Simple relevance scoring based on query terms
  const queryTerms = query.toLowerCase().split(' ');
  return mockDocuments
    .filter(doc => {
      const searchText = `${doc.title} ${doc.content} ${doc.tags?.join(' ') || ''}`.toLowerCase();
      return queryTerms.some(term => searchText.includes(term));
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 5);
}

export function formatSearchResultsForPrompt(results: BenefitsDocument[]): string {
  if (!results || results.length === 0) {
    return "No specific benefits information found in the knowledge base.";
  }

  return results
    .map(result => {
      const categoryLabel = result.category ? `[${result.category.toUpperCase()}]` : '';
      const planTypeLabel = result.planType && result.planType !== 'general' ? `(${result.planType})` : '';
      
      return `${categoryLabel} ${planTypeLabel} **${result.title}**
${result.content}
${result.tags ? `Tags: ${result.tags.join(', ')}` : ''}`;
    })
    .join('\n\n---\n\n');
}