import { streamText } from 'ai';
import { auth } from '@/app/(auth)/auth';
import {
  userCanAccessTenant,
  associateChatWithTenant,
} from '@/lib/db/queries/tenants';
import { type NextRequest, NextResponse } from 'next/server';
import { myProvider } from '@/lib/ai/providers';
import { generateUUID } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Get auth session
    const session = await auth();

    // Extract tenant context
    const tenantId = request.headers.get('X-Tenant-ID');

    // If tenant context exists, validate access
    if (tenantId) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required for tenant access' },
          { status: 401 },
        );
      }

      const hasAccess = await userCanAccessTenant(session.user.id, tenantId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this tenant' },
          { status: 403 },
        );
      }
    }

    const {
      messages,
      model = 'gpt-4-turbo-preview',
      ...otherParams
    } = await request.json();

    // Generate chat ID if not provided
    const chatId = generateUUID();

    // Stream the AI response
    const result = await streamText({
      model: myProvider(model),
      messages,
      ...otherParams,
    });

    // Associate chat with tenant if applicable
    if (tenantId && chatId) {
      try {
        await associateChatWithTenant(chatId, tenantId);
      } catch (error) {
        console.error('Failed to associate chat with tenant:', error);
        // Don't fail the request for this
      }
    }

    return result.toDataStreamResponse({
      headers: {
        'X-Chat-ID': chatId,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
