'use client';

import { useEffect } from 'react';
import type { Tenant } from '@/lib/db/schema';

interface TenantThemeProviderProps {
  tenant: Tenant;
  children: React.ReactNode;
}

export function TenantThemeProvider({ tenant, children }: TenantThemeProviderProps) {
  useEffect(() => {
    // Apply tenant theme colors as CSS variables
    const root = document.documentElement;
    const colors = tenant.settings.theme.colors;
    
    // Set color variables
    root.style.setProperty('--tenant-primary', colors.primary);
    root.style.setProperty('--tenant-secondary', colors.secondary);
    root.style.setProperty('--tenant-accent', colors.accent);
    root.style.setProperty('--tenant-background', colors.background);
    root.style.setProperty('--tenant-foreground', colors.foreground);
    root.style.setProperty('--tenant-muted', colors.muted);
    root.style.setProperty('--tenant-muted-foreground', colors.mutedForeground);
    root.style.setProperty('--tenant-card', colors.card);
    root.style.setProperty('--tenant-card-foreground', colors.cardForeground);
    root.style.setProperty('--tenant-border', colors.border);
    
    // Set font variables
    root.style.setProperty('--tenant-font-sans', tenant.settings.theme.fonts.sans);
    root.style.setProperty('--tenant-font-mono', tenant.settings.theme.fonts.mono);
    
    // Set other theme properties
    root.style.setProperty('--tenant-radius', tenant.settings.theme.radius);
    
    // Add tenant class for CSS targeting
    root.classList.add('tenant-themed');
    root.setAttribute('data-tenant-id', tenant.id);
    root.setAttribute('data-tenant-slug', tenant.slug);
    
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon && tenant.settings.branding.favicon) {
      favicon.href = tenant.settings.branding.favicon;
    }
    
    // Cleanup function
    return () => {
      root.classList.remove('tenant-themed');
      root.removeAttribute('data-tenant-id');
      root.removeAttribute('data-tenant-slug');
      
      // Remove CSS variables
      const cssVars = [
        '--tenant-primary', '--tenant-secondary', '--tenant-accent',
        '--tenant-background', '--tenant-foreground', '--tenant-muted',
        '--tenant-muted-foreground', '--tenant-card', '--tenant-card-foreground',
        '--tenant-border', '--tenant-font-sans', '--tenant-font-mono',
        '--tenant-radius'
      ];
      
      cssVars.forEach(varName => {
        root.style.removeProperty(varName);
      });
    };
  }, [tenant]);
  
  return (
    <>
      <style jsx global>{`
        .tenant-themed {
          --primary: var(--tenant-primary);
          --secondary: var(--tenant-secondary);
          --accent: var(--tenant-accent);
          --background: var(--tenant-background);
          --foreground: var(--tenant-foreground);
          --muted: var(--tenant-muted);
          --muted-foreground: var(--tenant-muted-foreground);
          --card: var(--tenant-card);
          --card-foreground: var(--tenant-card-foreground);
          --border: var(--tenant-border);
          --radius: var(--tenant-radius);
          font-family: var(--tenant-font-sans), var(--font-geist);
        }
        
        .tenant-themed code,
        .tenant-themed pre {
          font-family: var(--tenant-font-mono), var(--font-geist-mono);
        }
      `}</style>
      {children}
    </>
  );
}
