import * as schema from './drizzle/schema';
export * from './drizzle/schema';
export * as schema from './drizzle/schema';
export declare const db: import("drizzle-orm/bun-sql").BunSQLDatabase<typeof schema> & {
    $client: Bun.SQL;
};
