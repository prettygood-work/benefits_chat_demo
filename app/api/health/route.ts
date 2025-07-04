import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export async function GET() {
  const checks = {
    api: true,
    database: false,
    search: false,
  };
  
  const startTime = Date.now();
  
  // Basic database check
  try {
    if (process.env.POSTGRES_URL) {
      const client = postgres(process.env.POSTGRES_URL);
      const db = drizzle(client);
      
      // Simple query to check database connection
      const result = await db.execute(sql`SELECT 1 as check`);
      checks.database = result.length > 0;
      client.end();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.database = false;
  }
  
  // Azure search check (minimal)
  try {
    if (process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY) {
      checks.search = true;
    }
  } catch (error) {
    console.error('Search health check failed:', error);
    checks.search = false;
  }
  
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks
  });
}
