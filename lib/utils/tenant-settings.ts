import { defaultTenantSettings } from '../constants';
import type { Tenant } from '../db/schema';

/**
 * Safely gets tenant settings with defaults for missing values
 */
export function getTenantSettings(tenant?: Tenant | null) {
  if (!tenant) {
    return defaultTenantSettings;
  }

  return {
    theme: {
      colors: {
        primary:
          tenant.settings?.theme?.colors?.primary ||
          defaultTenantSettings.theme.colors.primary,
        secondary:
          tenant.settings?.theme?.colors?.secondary ||
          defaultTenantSettings.theme.colors.secondary,
        // ...other properties with fallbacks
      },
      // ...other nested objects with fallbacks
    },
    // ...remaining settings with appropriate fallbacks
  };
}
