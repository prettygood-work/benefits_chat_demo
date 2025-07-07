import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getUserTenants, getAllTenants } from '@/lib/db/queries/tenants';
import { TenantStats } from '@/components/admin/tenant-stats';
import { TenantList } from '@/components/admin/tenant-list';
import { QuickActions } from '@/components/admin/quick-actions';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    return null; // Layout handles redirect
  }
  
  // Fetch user's tenants and stats
  const [userTenants, allTenants] = await Promise.all([
    getUserTenants(session.user.id),
    getAllTenants({ limit: 10 }), // TODO: Check admin permission
  ]);
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your tenants and platform settings
        </p>
      </div>
      
      {/* Quick actions */}
      <QuickActions />
      
      {/* Stats overview */}
      <Suspense fallback={<div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />}>
        <TenantStats 
          totalTenants={allTenants.length}
          userTenants={userTenants.length}
        />
      </Suspense>
      
      {/* Your tenants */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Your Tenants
        </h2>
        <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />}>
          <TenantList 
            tenants={userTenants.map(ut => ({
              ...ut.tenant,
              userRole: ut.role,
            }))}
          />
        </Suspense>
      </div>
      
      {/* All tenants (if admin) */}
      {allTenants.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            All Tenants
          </h2>
          <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />}>
            <TenantList tenants={allTenants} showOwner />
          </Suspense>
        </div>
      )}
    </div>
  );
}
