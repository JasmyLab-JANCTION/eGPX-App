import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  // Add 'define' if 'global is not defined' error occurs (rarely needed with this plugin)
  define: {
    global: {},
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
