import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { getUserTenants } from '@/lib/db/queries/tenants';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // For now, any authenticated user can access the admin dashboard
  // to manage their own tenants. A super-admin role could be added later.
  const tenants = await getUserTenants(session.user.id);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Admin Dashboard - Benefits Platform',
  description: 'Manage tenants and platform settings',
};
