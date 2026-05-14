import React from 'react';
import { createRoot } from 'react-dom/client';
import StudyOverlay from './StudyOverlay';
import { createOverlayRoot } from './overlayRoot';

function init(): void {
  const container = createOverlayRoot();

  if (!container) {
    console.error('EduOverlay: Failed to create overlay container');
    return;
  }

  const shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    console.error('EduOverlay: Shadow DOM not available');
    return;
  }

  const mountPoint = shadowRoot.getElementById('eduoverlay-mount');
  if (!mountPoint) {
    console.error('EduOverlay: Mount point not found');
    return;
  }

  const root = createRoot(mountPoint);

  root.render(
    <React.StrictMode>
      <StudyOverlay />
    </React.StrictMode>
  );

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_OVERLAY') {
      window.dispatchEvent(new CustomEvent('eduoverlay-toggle'));
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === '1' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    const activeElement = document.activeElement;
    const isInputField =
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.tagName === 'SELECT' ||
      activeElement?.getAttribute('contenteditable') === 'true';

    if (!isInputField) {
      chrome.storage.local.get(['enableNumberKeyShortcut'], (result) => {
        if (result.enableNumberKeyShortcut !== false) {
          window.dispatchEvent(new CustomEvent('eduoverlay-toggle'));
        }
      });
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}