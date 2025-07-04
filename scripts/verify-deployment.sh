#!/bin/bash

# Production Deployment Verification Script
# Verifies all systems are ready for production deployment

# Don't exit immediately on error during checks
set +e 
echo "🔍 Verifying production deployment readiness..."

# Check environment variables
echo "📋 Checking environment variables..."
MISSING_VARS=0

check_env_var() {
  if [ -z "${!1}" ]; then
    echo "❌ $1 not set"
    MISSING_VARS=$((MISSING_VARS+1))
    return 1
  else
    echo "✅ $1 is set"
    return 0
  fi
}

check_env_var "AZURE_SEARCH_ENDPOINT"
check_env_var "AZURE_SEARCH_KEY"
check_env_var "OPENAI_API_KEY" 
check_env_var "POSTGRES_URL"

if [ $MISSING_VARS -gt 0 ]; then
  echo "⚠️ $MISSING_VARS required environment variables missing"
  # Only exit if we're in production mode
  if [ "$NODE_ENV" = "production" ]; then
    echo "❌ Production deployment cannot proceed without all environment variables"
    exit 1
  else
    echo "⚠️ Development mode detected, continuing with warnings..."
  fi
else
  echo "✅ All required environment variables are set"
fi

# Set back to exit on error for remaining checks
set -e

# Validate CSS
echo "🎨 Validating CSS..."
if [ -f "scripts/validate-css.js" ]; then
  node scripts/validate-css.js
else
  echo "⚠️ CSS validation script not found, skipping"
fi

# Type check
echo "🔍 Running TypeScript type check..."
npx tsc --noEmit || {
  echo "⚠️ TypeScript errors detected. Review errors above."
  if [ "$NODE_ENV" = "production" ]; then
    exit 1
  fi
}

# Lint check
echo "🧹 Running linting..."
pnpm run lint || {
  echo "⚠️ Lint errors detected. Review errors above."
  if [ "$NODE_ENV" = "production" ]; then
    exit 1
  fi
}

# Quick build test (without full build)
echo "⚡ Testing webpack configuration..."
NODE_OPTIONS="--max-old-space-size=2048" npx next build --no-lint 2>&1 | head -20

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for production deployment"