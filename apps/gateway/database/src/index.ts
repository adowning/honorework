import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from './gen/schema'
export * from './gen/schema'
export * as schema from './gen/schema'

export const db = drizzle(process.env.DATABASE_URL as string, { schema })
