import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  // Vercel에서는 도메인 바로 아래에 배포하므로 루트 경로를 사용한다.
  base: '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 개발할 때는 항상 같은 주소로 열리도록 포트를 고정한다.
  server: {
    port: 3000,
    open: true,
  },
  // 배포할 정적 파일은 dist 폴더에 모은다.
  build: {
    outDir: 'dist',
  },
})
