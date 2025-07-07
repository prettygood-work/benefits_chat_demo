# Quick Demo Deployment Guide

## 🚀 Deploy to Vercel in 5 Steps

### Step 1: Prepare Environment Variables
```bash
# Copy demo environment template
cp .env.demo .env.local

# Generate a secure AUTH_SECRET (32+ characters)
openssl rand -base64 32
```

### Step 2: Set Up Database (Vercel Postgres - Free Tier)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new project → Storage → Add PostgreSQL
3. Copy the `POSTGRES_URL` to your `.env.local`

### Step 3: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create API key
3. Add to `.env.local` as `OPENAI_API_KEY=sk-...`

### Step 4: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# - AUTH_SECRET
# - POSTGRES_URL  
# - OPENAI_API_KEY
# - DEFAULT_CLIENT_ID=demo-client
```

### Step 5: Initialize Database
```bash
# After successful deployment, run migrations
pnpm db:migrate

# Seed with demo data
npx tsx scripts/seed-benefits.ts
```

## 🎯 Using Claude Code for Demo Deployment

### Best Practices:
1. **Start Simple**: Deploy without Azure Search first
2. **Incremental Setup**: Add features one by one
3. **Monitor Logs**: Use Vercel Functions logs to debug
4. **Use Claude Code for**:
   - Fixing build errors: "Fix this build error: [paste error]"
   - Environment setup: "Help me configure [service] for demo"
   - Debugging: "Why is [feature] not working in production?"

### Demo Configuration:
- ✅ Database: Vercel Postgres (free tier)
- ✅ AI: OpenAI GPT-4
- ⚠️ Search: Disabled for demo (optional)
- ✅ Auth: NextAuth with secure secrets
- ✅ Analytics: Basic event tracking

### Minimal Required Environment Variables:
```bash
POSTGRES_URL=postgresql://...
AUTH_SECRET=your-32-char-secret
OPENAI_API_KEY=sk-...
DEFAULT_CLIENT_ID=demo-client
NODE_ENV=production
```

## 🔧 Troubleshooting Common Issues

### Build Errors:
- **Crypto API errors**: Fixed with universal crypto implementation
- **Environment validation**: Disabled during build
- **Missing dependencies**: All required deps added to package.json

### Runtime Errors:
- **Database connection**: Check POSTGRES_URL format
- **Auth issues**: Verify AUTH_SECRET is 32+ characters
- **API failures**: Check OpenAI API key and quota

### Performance:
- **Cold starts**: First request may be slow (normal)
- **Memory limits**: Optimized for Vercel's 1GB limit
- **Database connections**: Configured for serverless

## 📱 Demo Features

Working features in demo environment:
- ✅ Interactive chat with benefits expertise
- ✅ Plan comparison with real cost calculations
- ✅ Multi-tenant theming system
- ✅ User profile management
- ✅ Analytics dashboard with real metrics
- ✅ Mobile responsive design

Optional features (require additional setup):
- 🔍 Azure Cognitive Search (enhanced responses)
- 📊 Advanced analytics with real client data
- 🎨 Custom client branding

## 🎯 Success Metrics

Your demo is working when:
- [ ] Home page loads without errors
- [ ] Chat responds to benefits questions
- [ ] Plan comparison shows realistic data
- [ ] Theme switching works
- [ ] Analytics page displays metrics
- [ ] Mobile version functions properly

## 🆘 Get Help with Claude Code

If you encounter issues:

1. **Paste the exact error message**: "I'm getting this error: [paste full error]"
2. **Describe what you're trying to do**: "I want to deploy this for a demo"
3. **Share relevant logs**: Copy Vercel deployment logs
4. **Ask specific questions**: "How do I configure X for demo environment?"

Claude Code is excellent for:
- Debugging deployment issues
- Configuring environment variables
- Fixing build errors
- Optimizing for demo use cases
- Adding demo data and configurations