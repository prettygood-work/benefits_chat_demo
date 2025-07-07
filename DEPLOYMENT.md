# Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Set these in Vercel environment variables or your hosting platform:

#### Required Environment Variables
```bash
# Database
POSTGRES_URL=your-neon-postgres-url

# Authentication
AUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=https://your-domain.vercel.app

# AI Services
OPENAI_API_KEY=sk-your-openai-key

# Azure Cognitive Search (Optional but Recommended)
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-admin-key

# Optional - Redis for Resumable Streams
REDIS_URL=your-redis-connection-string

# Optional - Analytics
VERCEL_ANALYTICS_ID=your-analytics-id
```

#### Production-Specific Variables
```bash
NODE_ENV=production
VERCEL_URL=your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2. Database Setup

#### Neon Postgres Configuration
1. **Create Production Database**:
   - Log into Neon Console
   - Create new project for production
   - Copy connection string to `POSTGRES_URL`

2. **Run Migrations**:
   ```bash
   pnpm db:migrate
   ```

3. **Seed Initial Data** (Optional):
   ```bash
   npx tsx scripts/seed-benefits.ts
   ```

#### Database Verification
- [ ] All tables created successfully
- [ ] Migration history clean
- [ ] Sample data loaded (if applicable)
- [ ] Connection string secure and working

### 3. Azure Cognitive Search Setup (Recommended)

#### Create Search Service
1. **Azure Portal Setup**:
   - Create Azure Cognitive Search service
   - Choose appropriate pricing tier (Basic or Standard)
   - Enable semantic search capabilities

2. **Index Configuration**:
   - Create index named `benefits-index`
   - Configure semantic search configuration: `benefits-semantic-config`
   - Set up searchable fields: `title`, `content`, `searchableContent`

3. **Verify Search Integration**:
   ```bash
   # Verify search endpoint
   curl -X POST "https://your-search-service.search.windows.net/indexes/benefits-index/docs/search?api-version=2023-11-01" \
   -H "Content-Type: application/json" \
   -H "api-key: your-admin-key" \
   -d '{"search": "benefits"}'
   ```

#### Search Service Verification
- [ ] Search service created and accessible
- [ ] Index `benefits-index` exists
- [ ] Semantic configuration `benefits-semantic-config` enabled
- [ ] API keys secured and working
- [ ] Search queries return results

### 4. Performance Optimization

#### Build Optimization
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized and using Next.js Image component
- [ ] CSS purged and minified
- [ ] JavaScript code splitting enabled

#### Caching Configuration
```typescript
// next.config.js additions for production
const nextConfig = {
  headers: async () => [
    {
      source: '/api/analytics',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=300, stale-while-revalidate=600'
        }
      ]
    }
  ],
  compress: true,
  poweredByHeader: false,
}
```

## Deployment Steps

### 1. Pre-Deployment Validation

#### Run Complete Validation
```bash
# Validate CSS and code quality
pnpm run validate

# Run build to catch compilation errors
pnpm run build
```

#### Deployment Checklist
- [ ] All validations passing
- [ ] CSS validation successful
- [ ] TypeScript compilation clean
- [ ] Environment variables configured
- [ ] Database migrations ready

### 2. Vercel Deployment

#### Initial Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Environment Configuration
```bash
# Set environment variables via CLI
vercel env add POSTGRES_URL production
vercel env add AUTH_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add AZURE_SEARCH_ENDPOINT production
vercel env add AZURE_SEARCH_KEY production
```

#### Domain Configuration
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] DNS records properly set
- [ ] Redirects configured

### 3. Post-Deployment Verification

#### Functional Verification
- [ ] Home page loads successfully
- [ ] Chat functionality works
- [ ] Plan comparison artifacts render
- [ ] Analytics dashboard accessible
- [ ] Theme switching functional
- [ ] Mobile responsiveness verified

#### Performance Verification
- [ ] Page load times < 3 seconds
- [ ] API response times < 2 seconds
- [ ] Database query performance acceptable
- [ ] No console errors in production

#### Security Verification
- [ ] No exposed API keys or secrets
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Authentication working
- [ ] No sensitive data in client-side code

## Monitoring and Maintenance

### 1. Error Monitoring

#### Vercel Analytics
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active

#### Custom Monitoring
```javascript
// Add to app/layout.tsx for error tracking
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('error', (event) => {
    // Send error to monitoring service
    console.error('Production error:', event.error);
  });
}
```

### 2. Performance Monitoring

#### Key Metrics to Track
- **Response Times**: API endpoints < 2s
- **Database Performance**: Query times < 500ms
- **User Engagement**: Session duration, conversation completion
- **Error Rates**: < 1% error rate target

#### Monitoring Setup
```bash
# Environment variables for monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn  # If using Sentry
```

### 3. Backup and Recovery

#### Database Backups
- [ ] Automated daily backups enabled in Neon
- [ ] Backup retention policy configured
- [ ] Recovery procedures documented

#### Code Backups
- [ ] GitHub repository properly configured
- [ ] Main branch protected
- [ ] Tags for releases
- [ ] CI/CD pipeline active

## Troubleshooting Guide

### Common Deployment Issues

#### 1. Build Failures
**CSS Syntax Errors**:
```bash
# Run CSS validation
node scripts/validate-css.js
```

**TypeScript Errors**:
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

#### 2. Runtime Errors
**Database Connection Issues**:
- Verify `POSTGRES_URL` format
- Check Neon dashboard for connection limits
- Ensure database is not suspended

**Azure Search Issues**:
- Verify endpoint and API key
- Check index exists and is populated
- Confirm semantic search is enabled

#### 3. Performance Issues
**Slow API Responses**:
- Check database query performance
- Monitor Azure Search quota usage
- Verify caching configuration

**High Memory Usage**:
- Analyze bundle size
- Check for memory leaks in React components
- Monitor Vercel function metrics

### Emergency Procedures

#### Rollback Process
```bash
# Revert to previous deployment
vercel rollback [deployment-url]
```

#### Hotfix Deployment
```bash
# Quick fix deployment
git checkout main
git pull origin main
# Make minimal fix
git add .
git commit -m "hotfix: critical issue"
git push origin main
# Auto-deploys via Vercel integration
```

## Performance Targets

### Production Benchmarks
- **Page Load Time**: < 3 seconds (First Contentful Paint)
- **API Response Time**: < 2 seconds (95th percentile)
- **Database Query Time**: < 500ms average
- **Build Time**: < 10 minutes

### Scalability Targets
- **Concurrent Users**: 1000+ simultaneous users
- **Daily Active Users**: 10,000+ DAU capacity
- **API Requests**: 100,000+ requests/day
- **Database Connections**: 100+ concurrent connections

## Security Checklist

### Production Security
- [ ] All API keys stored as environment variables
- [ ] No hardcoded secrets in codebase
- [ ] HTTPS enforced for all traffic
- [ ] Authentication properly configured
- [ ] CORS restricted to allowed domains
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] XSS prevention (React default protections)
- [ ] Input validation on all forms

### Data Protection
- [ ] User data encrypted at rest
- [ ] Secure session management
- [ ] Proper error handling (no sensitive data exposure)
- [ ] Audit logging for sensitive operations
- [ ] Data retention policies implemented

## Success Criteria

### Deployment Success Indicators
- [ ] Zero-downtime deployment
- [ ] All validations passing in production
- [ ] Performance metrics within targets
- [ ] No critical errors in first 24 hours
- [ ] User workflows functioning correctly

### Business Success Metrics
- [ ] User engagement metrics positive
- [ ] Plan comparison usage tracking
- [ ] Cost calculation accuracy validated
- [ ] Customer satisfaction scores maintained
- [ ] Support ticket volume normal

## Contact Information

### Support Escalation
- **Technical Issues**: Development Team
- **Infrastructure Issues**: DevOps/Platform Team
- **Database Issues**: Database Administrator
- **Security Issues**: Security Team

### Monitoring Alerts
- **Error Rate > 5%**: Immediate alert
- **Response Time > 5s**: Warning alert
- **Database Connection Issues**: Critical alert
- **Build Failures**: Development team notification