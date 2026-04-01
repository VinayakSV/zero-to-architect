import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/zero-to-architect/',
  assetsInclude: ['**/*.md'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-markdown': ['react-markdown', 'remark-gfm', 'rehype-raw', 'react-syntax-highlighter'],
          'vendor-mermaid': ['mermaid'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
