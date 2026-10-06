import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.API_PROXY_TARGET || 'http://localhost:3000';
  return {
    plugins: [react()],
    server: {
      proxy: Object.fromEntries(['/auth', '/reports', '/alerts'].map((path) => [path, { target, changeOrigin: true }])),
    },
  };
});
