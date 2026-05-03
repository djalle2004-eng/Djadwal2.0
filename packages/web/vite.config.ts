import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@djadwal/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5173,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      strict: false
    },
    cors: true,
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
        secure: true
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-date-pickers'],
          aggrid: ['ag-grid-community', 'ag-grid-react'],
          pdf: ['jspdf', 'jspdf-autotable', 'pdf-lib', '@react-pdf/renderer', 'html2pdf.js'],
          utils: ['axios', 'date-fns', 'exceljs', 'xlsx', 'lucide-react']
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.svg')) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'sqlite3'],
  },
});