/**
 * Environment variable validation for production deployments
 */

interface EnvironmentConfig {
  NODE_ENV: string;
  POSTGRES_URL?: string;
  AUTH_SECRET?: string;
  OPENAI_API_KEY?: string;
  AZURE_SEARCH_ENDPOINT?: string;
  AZURE_SEARCH_KEY?: string;
  DEFAULT_CLIENT_ID?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const env = process.env as EnvironmentConfig;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical environment variables for production
  if (env.NODE_ENV === 'production') {
    if (!env.POSTGRES_URL) {
      errors.push('POSTGRES_URL is required in production');
    }

    if (!env.AUTH_SECRET) {
      errors.push('AUTH_SECRET is required in production');
    }

    if (!env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required in production');
    }

    // Azure Search is recommended but not required
    if (!env.AZURE_SEARCH_ENDPOINT || !env.AZURE_SEARCH_KEY) {
      warnings.push('Azure Search not configured - search functionality will be limited');
    }

    if (!env.DEFAULT_CLIENT_ID) {
      warnings.push('DEFAULT_CLIENT_ID not set - using fallback client ID');
    }
  }

  // Validate AUTH_SECRET format
  if (env.AUTH_SECRET && env.AUTH_SECRET.length < 32) {
    errors.push('AUTH_SECRET must be at least 32 characters long');
  }

  // Validate OpenAI API key format
  if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)');
  }

  // Validate Azure Search endpoint format
  if (env.AZURE_SEARCH_ENDPOINT && !env.AZURE_SEARCH_ENDPOINT.includes('search.windows.net')) {
    errors.push('AZURE_SEARCH_ENDPOINT appears to be invalid (should be a search.windows.net URL)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function logValidationResults(result: ValidationResult): void {
  if (!result.isValid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production');
    }
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }
}

export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}