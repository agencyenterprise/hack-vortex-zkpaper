import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from "vite-plugin-node-polyfills";
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },

  build: {
    target: 'esnext',
  },
  plugins: [react(), nodePolyfills()],

});
