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
  planType?: string;
  clientId?: string;
  category?: string;
  searchableContent?: string;
  lastUpdated?: string;
  relevanceScore?: number;
}

// Provide a basic mock implementation
export async function searchBenefitsContent(
  query: string, 
  clientId: string
): Promise<BenefitsDocument[]> {
  // ...existing code...
  // Return an empty array or a mock object as needed.
  return [];
}

// Format an array of result documents into a user-friendly string
export function formatSearchResultsForPrompt(results: BenefitsDocument[]): string {
  // ...existing code...
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