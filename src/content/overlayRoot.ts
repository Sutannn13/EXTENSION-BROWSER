export function createOverlayRoot(): HTMLElement | null {
  const existingRoot = document.getElementById('eduoverlay-root');
  if (existingRoot) {
    return existingRoot;
  }

  const container = document.createElement('div');
  container.id = 'eduoverlay-root';

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    @import 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  mountPoint.id = 'eduoverlay-mount';
  shadow.appendChild(mountPoint);

  document.body.appendChild(container);

  return container;
}

export function removeOverlayRoot(): void {
  const root = document.getElementById('eduoverlay-root');
  if (root) {
    root.remove();
  }
}