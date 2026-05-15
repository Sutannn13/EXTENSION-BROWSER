import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function stripPdfJsDynamicImports() {
  return {
    name: 'strip-pdfjs-dynamic-imports',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.endsWith('/pdfjs-dist/build/pdf.mjs')) {
        return null;
      }

      const transformed = code
        .replace(
          /this\._createCDNWrapper = url => \{[\s\S]*?type: "text\/javascript"\s*\}\)\);\s*\};/,
          'this._createCDNWrapper = () => { throw new Error("PDF.js CDN worker wrapper is disabled in EduOverlay content script."); };'
        )
        .replace(
          /const worker = await import\(\/\*webpackIgnore: true\*\/this\.workerSrc\);\s*return worker\.WorkerMessageHandler;/,
          'throw new Error("PDF.js fake worker fallback is disabled in EduOverlay content script.");'
        );

      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/content/index.tsx'),
      output: {
        format: 'iife',
        name: 'EduOverlayContent',
        entryFileNames: 'content.js',
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css') {
            return 'content/content.css';
          }

          return '[name].[ext]';
        },
      },
    },
  },
  plugins: [stripPdfJsDynamicImports(), react()],
});
