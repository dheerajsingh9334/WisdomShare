import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
  server: {
    port: 5173,
    // Add hmr options for better stability
    hmr: {
      overlay: true,
    },
  },
  build: {
    target: 'esnext', // Modern browsers for better performance
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendors
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'],
          // Heavy UI & Animation
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', '@heroicons/react'],
          // Large utility packages
          'vendor-utils': ['axios', 'formik', 'yup', 'redux-persist', '@stripe/react-stripe-js'],
          // Specialized heavy editors/viewers
          'vendor-editor': ['react-quill', 'quill', 'react-markdown', 'rehype-raw', 'remark-gfm'],
          'vendor-charts': ['recharts'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
      'axios',
      'framer-motion',
      'lucide-react',
      'react-icons',
      'recharts',
      'quill',
      'react-quill',
      'formik',
      'yup',
      'redux-persist',
      'react-markdown',
      'rehype-raw',
      'remark-gfm'
    ],
    // Force dependency discovery for some packages that might be missed
    entries: [
      './src/main.jsx',
      './src/App.jsx'
    ]
  },
});

