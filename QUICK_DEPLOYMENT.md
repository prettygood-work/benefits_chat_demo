# Quick Deployment Guide

## Vercel Deployment Steps

1. **Push code to GitHub**
   - Create a new GitHub repository
   - Push the code to this repository

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "Next.js" as the framework

3. **Environment Variables Setup**
   - Add the following environment variables in Vercel:

     ```
     NEXTAUTH_SECRET=random_string_here
     NEXTAUTH_URL=https://your-vercel-app-name.vercel.app
     AUTH_SECRET=another_random_string_here
     ```

   - For demo purposes, you can skip database and Azure search configuration
   - For AI features, add:
     ```
     OPENAI_API_KEY=your_openai_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build and deployment to complete

## Testing Deployed App

1. **Auth Setup**
   - First user to access the app will be created as guest
   - For demo purposes, this is sufficient

2. **Benefits Chat Demo**
   - Navigate to the main chat interface
   - Try asking questions about health plans

3. **Analytics Demo**
   - Navigate to the analytics page
   - Review mock data visualization

## Troubleshooting Common Deployment Issues

1. **Build Failures**
   - Check Vercel build logs for specific errors
   - Ensure all environment variables are set correctly

2. **Missing Features**
   - Some features might be using mock data in deployment
   - Check console logs for error messages

3. **Authentication Issues**
   - Ensure NEXTAUTH_URL matches your deployed URL
   - Check AUTH_SECRET is properly set

4. **API Route Errors**
   - Check error responses in browser developer tools
   - Verify network requests to API endpoints

Remember, this is a demo deployment and not intended for production use. Some features will use mock data when real services aren't configured.
