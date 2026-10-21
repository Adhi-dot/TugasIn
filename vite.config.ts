import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteApiPlugin } from './src/server/viteApiPlugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Muat environment variables (.env, .env.local) ke process.env Node.js server
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      viteApiPlugin(),
    ],
    server: {
      port: 3000,
      host: true,
      open: false,
    },
  };
});
