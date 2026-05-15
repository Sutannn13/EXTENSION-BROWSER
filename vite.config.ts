import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import manifest from './src/manifest';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'src/background/serviceWorker.ts'),
        options: path.resolve(__dirname, 'src/options/main.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    {
      name: 'build-manifest',
      apply: 'build',
      generateBundle(_options, _bundle) {
        // Write manifest.json
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(manifest(), null, 2),
        });

        // Write options.html
        this.emitFile({
          type: 'asset',
          fileName: 'options.html',
          source: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduOverlay AI Settings</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="options.js"></script>
</body>
</html>`,
        });
      },
    },
    {
      name: 'copy-public',
      apply: 'build',
      writeBundle() {
        // Copy icons
        const iconsDir = path.resolve(__dirname, 'public/icons');
        if (fs.existsSync(iconsDir)) {
          const icons = fs.readdirSync(iconsDir);
          for (const icon of icons) {
            const src = path.join(iconsDir, icon);
            const dest = path.resolve(__dirname, 'dist/icons', icon);
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(src, dest);
          }
        }

        // Copy CSS
        const cssSrc = path.resolve(__dirname, 'public/content/content.css');
        const cssDest = path.resolve(__dirname, 'dist/content/content.css');
        const cssDestDir = path.dirname(cssDest);
        if (!fs.existsSync(cssDestDir)) {
          fs.mkdirSync(cssDestDir, { recursive: true });
        }
        if (fs.existsSync(cssSrc)) {
          fs.copyFileSync(cssSrc, cssDest);
        }

        // Copy PDF.js worker for content-script PDF parsing.
        const pdfWorkerSrc = path.resolve(
          __dirname,
          'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
        );
        const pdfWorkerDest = path.resolve(__dirname, 'dist/pdf.worker.min.mjs');
        if (fs.existsSync(pdfWorkerSrc)) {
          fs.copyFileSync(pdfWorkerSrc, pdfWorkerDest);
        }
      },
    },
  ],
});
