import { auth } from '@/lib/auth';
import { userCanAccessTenant, associateChatWithTenant } from '@/lib/db/queries/tenants';
import { NextRequest, NextResponse } from 'next/server';

// This is the complete, updated file
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
          { status: 401 }
        );
      }
      
      const hasAccess = await userCanAccessTenant(session.user.id, tenantId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this tenant' },
          { status: 403 }
        );
      }
    }
    
    // Continue with existing chat logic...
    // ... (existing code) ...
    
    // After saving chat and before streaming response, associate with tenant
    if (tenantId && chatId) {
      await associateChatWithTenant(chatId, tenantId);
    }
    
    // ... (rest of existing code) ...
  } catch (error) {
    // ... (existing error handling) ...
  }
}
}
