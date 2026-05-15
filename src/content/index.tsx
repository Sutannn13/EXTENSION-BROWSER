import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StudyOverlay from './StudyOverlay';
import { createOverlayRoot } from './overlayRoot';

console.log('[EduOverlay] Content script loaded');

// Track if overlay is initialized
let isInitialized = false;

function init(): void {
  if (isInitialized) {
    console.log('[EduOverlay] Already initialized, skipping');
    return;
  }

  console.log('[EduOverlay] Initializing overlay...');

  const container = createOverlayRoot();

  if (!container) {
    console.error('[EduOverlay] Failed to create overlay container');
    return;
  }

  const shadowRoot = container.shadowRoot;
  if (!shadowRoot) {
    console.error('[EduOverlay] Shadow DOM not available');
    return;
  }

  const mountPoint = shadowRoot.getElementById('eduoverlay-mount');
  if (!mountPoint) {
    console.error('[EduOverlay] Mount point not found');
    return;
  }

  const root = createRoot(mountPoint);

  root.render(
    <StrictMode>
      <StudyOverlay />
    </StrictMode>
  );

  isInitialized = true;
  console.log('[EduOverlay] Overlay initialized successfully');
}

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'EDUOVERLAY_TOGGLE') {
    console.log('[EduOverlay] Content script received toggle message');
    console.log('[EduOverlay] Dispatching toggle event');
    window.dispatchEvent(new CustomEvent('eduoverlay:toggle'));
    sendResponse({ ok: true });
  }

  return true;
});

// Local keyboard shortcut handling
// Alt+1 to toggle overlay (works when not typing)
document.addEventListener('keydown', (event) => {
  // Alt+1 toggle
  if (event.key === '1' && event.altKey && !event.ctrlKey && !event.metaKey) {
    console.log('[EduOverlay] Alt+1 pressed');
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('eduoverlay:toggle'));
    return;
  }

  // Number 1 toggle (only when not in input field)
  if (event.key === '1' && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const isTyping = isTypingTarget(event.target) || isTypingTarget(document.activeElement);

    if (isTyping) {
      console.log('[EduOverlay] Number 1 pressed but user is typing, ignoring');
      return;
    }

    // Check setting from storage
    chrome.storage.local.get(['enableNumberOneToggle'], (result) => {
      if (result.enableNumberOneToggle !== false) {
        console.log('[EduOverlay] Number 1 pressed, toggling overlay');
        window.dispatchEvent(new CustomEvent('eduoverlay:toggle'));
      } else {
        console.log('[EduOverlay] Number 1 pressed but disabled in settings');
      }
    });
  }
});

// Helper to check if user is typing in an input field
function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;

  const tag = element.tagName?.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    element.isContentEditable
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
