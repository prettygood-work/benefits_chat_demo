import { notFound } from 'next/navigation';
import { getTenantBySlug } from '@/lib/db/queries/tenants';
import { TenantProvider } from '@/components/providers/tenant-provider';
import { TenantThemeProvider } from '@/components/providers/tenant-theme-provider';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const tenant = await getTenantBySlug(params.tenant);

  if (!tenant) {
    notFound();
  }

  return (
    // Wrap children with TenantProvider and TenantThemeProvider
    <TenantProvider tenant={tenant}>
      <TenantThemeProvider tenant={tenant}>
        <div className="min-h-screen tenant-root">{children}</div>
      </TenantThemeProvider>
    </TenantProvider>
  );
}

export async function generateMetadata({
  params,
}: { params: { tenant: string } }) {
  const tenant = await getTenantBySlug(params.tenant);

  if (!tenant) {
    return {
      title: 'Not Found',
      description: 'The requested tenant could not be found.',
    };
  }

  // generate dynamic metadata using tenant branding
  const { companyName, tagline, favicon, logo } = tenant.settings.branding;

  return {
    title: `${companyName} - Benefits Assistant`,
    description: tagline || 'Your AI-powered benefits assistant',
    icons: {
      icon: favicon,
    },
    openGraph: {
      title: `${companyName} - Benefits Assistant`,
      description: tagline || 'Your AI-powered benefits assistant',
      images: [logo],
    },
  };
}
