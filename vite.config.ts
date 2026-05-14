import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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
        content: path.resolve(__dirname, 'src/content/index.tsx'),
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
        // Inline manifest configuration
        const manifest = {
          manifest_version: 3,
          name: 'EduOverlay AI',
          description: 'AI study overlay for learning forums - helps students learn from uploaded materials',
          version: '1.0.0',
          icons: {
            '16': 'icons/icon16.png',
            '32': 'icons/icon32.png',
            '48': 'icons/icon48.png',
            '128': 'icons/icon128.png',
          },
          permissions: ['storage', 'activeTab', 'scripting'],
          host_permissions: ['<all_urls>'],
          background: {
            service_worker: 'background.js',
            type: 'module',
          },
          content_scripts: [
            {
              matches: ['<all_urls>'],
              js: ['content.js'],
              css: ['content/content.css'],
              run_at: 'document_idle',
            },
          ],
          options_page: 'options.html',
          commands: {
            'toggle-overlay': {
              suggested_key: {
                default: 'Alt+1',
                windows: 'Alt+1',
                mac: 'Alt+1',
                chromeos: 'Alt+1',
                linux: 'Alt+1',
              },
              description: 'Toggle EduOverlay AI overlay',
            },
          },
          web_accessible_resources: [
            {
              resources: ['content/content.css'],
              matches: ['<all_urls>'],
            },
          ],
        };

        // Write manifest.json
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(manifest, null, 2),
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
      generateBundle() {
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
      },
    },
  ],
});