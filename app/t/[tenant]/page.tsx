import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { getTenantBySlug, userCanAccessTenant } from '@/lib/db/queries/tenants';
import { TenantChat } from '@/components/tenant/tenant-chat';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface TenantPageProps {
  params: {
    tenant: string;
  };
}

export default async function TenantChatPage({ params }: TenantPageProps) {
  const session = await auth();
  const tenant = await getTenantBySlug(params.tenant);
  
  if (!tenant) {
    notFound();
  }
  
  const features = tenant.settings.features || {};
  let hasAccess = features.publicAccess || false;
  
  if (session?.user && !hasAccess) {
    hasAccess = await userCanAccessTenant(session.user.id, tenant.id);
  }
  
  if (!hasAccess && features.requireAuth) {
    redirect(`/t/${params.tenant}/access-required`);
  }
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TenantChat 
        tenant={tenant}
        user={session?.user}
      />
    </Suspense>
  );
}
    </Suspense>
  );
}
