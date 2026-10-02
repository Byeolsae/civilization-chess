import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Keep this standalone app independent from the parent project's PostCSS setup.
  css: { postcss: { plugins: [] } },
});
