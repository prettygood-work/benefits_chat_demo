import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { ChatSDKError } from './errors';

if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
  throw new ChatSDKError('bad_request:configuration', 'Azure Search environment variables not configured');
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
  category: 'plan_details' | 'enrollment' | 'coverage' | 'costs' | 'faq';
  planType: 'HMO' | 'PPO' | 'HDHP' | 'EPO' | 'general';
  clientId: string;
  searchableContent: string;
  lastUpdated: string;
}

export async function searchBenefitsContent(
  query: string,
  clientId: string,
  top: number = 5
): Promise<BenefitsDocument[]> {
  try {
    const searchResults = await searchClient.search<BenefitsDocument>(query, {
      searchFields: ['title', 'content', 'searchableContent'],
      select: ['id', 'title', 'content', 'category', 'planType', 'clientId'],
      filter: `clientId eq '${clientId}'`,
      top,
      highlightFields: ['content'],
      semanticConfiguration: 'benefits-semantic-config'
    });

    const documents: BenefitsDocument[] = [];
    for await (const result of searchResults.results) {
      documents.push(result.document);
    }
    
    return documents;
  } catch (error) {
    console.error('Azure Search error:', error);
    return [];
  }
}

export async function indexBenefitsDocument(document: BenefitsDocument): Promise<void> {
  try {
    await searchClient.uploadDocuments([document]);
  } catch (error) {
    console.error('Failed to index document:', error);
    throw new ChatSDKError('bad_request:azure_search', 'Failed to index benefits document');
  }
}

export function formatSearchResultsForPrompt(results: BenefitsDocument[]): string {
  if (results.length === 0) return '';
  
  return results.map(doc => 
    `Title: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`
  ).join('\n\n');
}