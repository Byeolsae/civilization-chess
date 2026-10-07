import { roomHandler } from './api/pvp';
import { MemoryRoomStore } from './server/roomStore';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), { name:'local-pvp', configureServer(server) { server.middlewares.use('/api/pvp',roomHandler(new MemoryRoomStore())); } }],
  // Keep this standalone app independent from the parent project's PostCSS setup.
  css: { postcss: { plugins: [] } },
});
