import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: process.env.PORT || 5173,
        host: '0.0.0.0',
        cors: true,
        hmr: {
          host: process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost',
        },
        proxy: {
          '/api/leetcode': {
            target: 'https://leetcode-api-pied.vercel.app',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/leetcode/, ''),
          }
        }
      },
      preview: {
        port: process.env.PORT || 5173,
        host: '0.0.0.0',
        cors: true
      }
    };
});
