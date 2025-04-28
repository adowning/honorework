import { defaultPlugins } from '@hey-api/openapi-ts'

export default {
  input: 'https://api.cashflowcasino.com/swagger.json',
  output: 'src/sdk/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    'zod',
    '@tanstack/vue-query',
    {
      asClass: true, // default
      // name: '@cashflow/sdk',
      runtimeConfigPath: './src/sdk/cashflow-api.ts',
    },
  ],
}
