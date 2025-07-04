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
  planType: string;
  clientId: string;
  category?: string;
  searchableContent: string;
  lastUpdated: string;
  relevanceScore?: number;
}

export async function searchBenefitsContent(
  query: string, 
  clientId: string
): Promise<BenefitsDocument[]> {
  // Implementation might be elsewhere, just defining type signature
  return [];
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