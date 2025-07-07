'use client';

import { createContext, useContext } from 'react';
import type { Tenant } from '@/lib/db/schema';

interface TenantContextValue {
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context.tenant;
}

export function useTenantId() {
  const tenant = useTenant();
  return tenant.id;
}

export function useTenantSettings() {
  const tenant = useTenant();
  return tenant.settings;
}
