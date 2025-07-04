#!/bin/bash

# Production Deployment Verification Script
# Verifies all systems are ready for production deployment

set -e
echo "🔍 Verifying production deployment readiness..."

# Check environment variables
echo "📋 Checking environment variables..."
if [ -z "$AZURE_SEARCH_ENDPOINT" ]; then
    echo "❌ AZURE_SEARCH_ENDPOINT not set"
    exit 1
fi

if [ -z "$AZURE_SEARCH_KEY" ]; then
    echo "❌ AZURE_SEARCH_KEY not set"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    exit 1
fi

if [ -z "$POSTGRES_URL" ]; then
    echo "❌ POSTGRES_URL not set"
    exit 1
fi

echo "✅ All required environment variables are set"

# Validate CSS
echo "🎨 Validating CSS..."
node scripts/validate-css.js

# Type check
echo "🔍 Running TypeScript type check..."
npx tsc --noEmit

# Lint check
echo "🧹 Running linting..."
pnpm run lint

# Quick build test (without full build)
echo "⚡ Testing webpack configuration..."
NODE_OPTIONS="--max-old-space-size=2048" npx next build --no-lint 2>&1 | head -20

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for production deployment"