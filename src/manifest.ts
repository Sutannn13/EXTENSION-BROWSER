export default function manifest() {
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
        resources: ['content/content.css', 'pdf.worker.min.mjs'],
        matches: ['<all_urls>'],
      },
    ],
  };
}
