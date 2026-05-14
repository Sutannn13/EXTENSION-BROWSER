import type { ManifestV3 } from '@crxjs/vite-plugin';

export default function manifest(): ManifestV3 {
  return {
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
    permissions: [
      'storage',
      'activeTab',
      'scripting',
    ],
    host_permissions: [
      '<all_urls>',
      'https://generativelanguage.googleapis.com/*',
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
    ],
    background: {
      service_worker: 'background/serviceWorker.js',
      type: 'module',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content/content.js'],
        css: ['content/content.css'],
        run_at: 'document_end',
      },
    ],
    options_page: 'options/options.html',
    commands: {
      'toggle-overlay': {
        suggested_key: {
          default: 'Alt+1',
        },
        description: 'Toggle the study overlay',
      },
    },
    web_accessible_resources: [
      {
        resources: ['content/content.css'],
        matches: ['<all_urls>'],
      },
    ],
  };
}