import { fileURLToPath, URL } from 'node:url'
// import { pluginOas } from '@kubb/plugin-oas'
// import { pluginTs } from '@kubb/plugin-ts'
// import { pluginVueQuery } from '@kubb/plugin-vue-query'
// import kubb from 'unplugin-kubb/vite'
import AppLoading from 'vite-plugin-app-loading'
import pages from 'vite-plugin-pages'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    TurboConsole({
      /* options here */
      // disablePassLogs: true,
    }),
    AppLoading(),
    vueDevTools({ launchEditor: 'code' }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'src/types/auto/auto-imports.d.ts',
      dirs: ['src/composables'],
      eslintrc: {
        enabled: true, // <-- this
      },
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
    }),
    // 自动按需导入组件
    Components({
      dts: 'src/types/auto/components.d.ts',
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
    }),
    // kubb({
    //   config: {
    //     root: '.',
    //     input: {
    //       path: './petStore.yaml',
    //     },
    //     output: {
    //       path: './src/gen',
    //       clean: true,
    //     },
    //     plugins: [
    //       pluginOas({
    //         generators: [],
    //       }),
    //       pluginTs({
    //         output: {
    //           path: 'models',
    //         },
    //       }),
    //       pluginVueQuery({
    //         output: {
    //           path: './hooks',
    //         },
    //         pathParamsType: 'object',
    //       }),
    //     ],
    //   },
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['test.cashflowcasino.com'],
  },
})
