// Database connection using Neon and Drizzle ORM
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as schema from './schema';

// Load environment variables from authentication directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Current process.env.DATABASE_URL:', process.env.DATABASE_URL);
  throw new Error('DATABASE_URL environment variable is required');
}

// Create Neon client
const sql = neon(DATABASE_URL);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default db;
