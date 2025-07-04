#!/bin/bash

# Quick deployment script for Benefits Chat Demo
# This script bypasses time-consuming checks for urgent deployment

set -e
echo "🚀 Starting emergency deployment process..."

# Set memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Skip database migrations for now (can be run separately)
echo "⚡ Skipping database migrations for speed..."

# Build with error bypassing enabled
echo "🏗️  Building application with bypassed checks..."
npx next build

echo "✅ Build completed! Ready for Vercel deployment."
echo ""
echo "🔧 Post-deployment setup:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Run database migrations: 'pnpm db:migrate'"
echo "3. Test functionality after deployment"