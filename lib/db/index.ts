import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres client with connection URL
const client = postgres(process.env.POSTGRES_URL!);

// Create drizzle client with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
