import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  out: './src/drizzle',
  dialect: 'postgresql',
  schema: './src/drizzle/schema.ts',
  //   driver: "bun-sql",
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5434/client',
  },
  extensionsFilters: ['postgis'],
  schemaFilter: 'public',
  strict: true,
  verbose: true,
  tablesFilter: '*',
  // introspect: {
  // casing: 'camel',
  // },
  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public',
  },
  entities: {
    roles: {
      provider: '',
      exclude: [],
      include: [],
    },
  },
  //   breakpoints: true,
  //   strict: true,
  //   verbose: true,
})
