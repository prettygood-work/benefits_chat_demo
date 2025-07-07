# Benefits Advisory Platform

A sophisticated multi-tenant benefits advisory chatbot that helps employees understand and select their health insurance benefits through AI-powered conversations.

## 🎯 Project Overview

This platform transforms how employees interact with their benefits by providing:

- **For Employees**: Natural conversation-based benefits guidance with visual plan comparisons
- **For Employers**: White-labeled solution with comprehensive analytics and insights
- **For Administrators**: Multi-tenant management with real-time monitoring

## 🏗️ Architecture

┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Next.js 15 App    │────▶│  Vercel AI SDK      │────▶│   OpenAI GPT-4      │
│  (App Router)       │     │  + Streaming        │     │  Benefits Expert    │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
│                           │                           │
▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Vercel Postgres    │────▶│   Azure Cognitive   │────▶│   Vercel Blob       │
│  + Drizzle ORM      │     │   Search (RAG)      │     │  Document Storage   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.0 (App Router)
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Database**: Vercel Postgres with Drizzle ORM
- **AI**: Vercel AI SDK + OpenAI GPT-4
- **Search**: Azure Cognitive Search
- **Auth**: NextAuth.js
- **Hosting**: Vercel Edge Functions

## 📋 Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later
- Vercel account
- OpenAI API key
- Azure Cognitive Search instance
- PostgreSQL database (via Vercel)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd benefits-advisory-platform
pnpm install
2. Environment Variables
Create .env.local with:
env# Database
DATABASE_URL="postgres://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Azure Search
AZURE_SEARCH_ENDPOINT="https://..."
AZURE_SEARCH_KEY="..."
AZURE_SEARCH_INDEX="benefits-index"

# Auth
AUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."
3. Database Setup
bash# Push schema to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Seed with demo data (optional)
pnpm db:seed
4. Azure Search Setup
bash# Create search index
pnpm search:create-index

# Test search connection
pnpm search:test
5. Development
bash# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
📁 Project Structure
├── app/
│   ├── [tenant]/          # Tenant-specific chat interface
│   ├── admin/             # Admin dashboard
│   │   ├── [tenantId]/    # Tenant management
│   │   └── analytics/     # Cross-client analytics
│   └── api/               # API routes
│       ├── chat/          # Chat streaming endpoint
│       ├── search/        # Azure search integration
│       └── admin/         # Admin APIs
├── components/
│   ├── benefits/          # Plan cards, comparisons
│   ├── chat/              # Chat UI components
│   └── admin/             # Admin components
├── lib/
│   ├── ai/                # AI prompts and logic
│   ├── azure-search/      # Search client and indexing
│   ├── db/                # Database schema and queries
│   ├── recommendations/   # Recommendation engine
│   └── analytics/         # Analytics engine
└── tests/                 # Test files by phase
