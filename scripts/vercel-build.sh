#!/bin/bash

# Vercel Build Script for Benefits Chat Demo
# This script handles the build process with proper error handling and optimizations

set -e  # Exit on any error

echo "🚀 Starting Vercel build process..."

# Set Node.js memory limit for build
export NODE_OPTIONS="--max-old-space-size=4096"

# Validate CSS before building
echo "✅ Validating CSS..."
node scripts/validate-css.js

# Run database migrations
echo "🗄️  Running database migrations..."
tsx lib/db/migrate

# Build the application
echo "🏗️  Building Next.js application..."
next build

echo "✅ Build completed successfully!"