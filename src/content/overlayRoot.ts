const OVERLAY_ROOT_ID = 'eduoverlay-ai-root';

export function createOverlayRoot(): HTMLElement | null {
  const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
  if (existingRoot) {
    return existingRoot;
  }

  const container = document.createElement('div');
  container.id = OVERLAY_ROOT_ID;

  const shadow = container.attachShadow({ mode: 'open' });

  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('content/content.css');
    shadow.appendChild(stylesheet);
  }

  const style = document.createElement('style');
  style.textContent = `
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
  const root = document.getElementById(OVERLAY_ROOT_ID);
  if (root) {
    root.remove();
  }
}
