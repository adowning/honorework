import { drizzle } from 'drizzle-orm/bun-sql'
import { Pool } from 'pg'
import * as schema from './generated/drizzle/schema'
export * as schema from './generated/drizzle/schema'
export const db = drizzle(process.env.DATABASE_URL as string, { schema })
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
