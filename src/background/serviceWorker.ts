import type { AIRequest, AIResponse } from '../lib/ai/types';
import { getGeminiResponse } from '../lib/ai/geminiProvider';
import { getOpenAIResponse } from '../lib/ai/openaiProvider';
import { getAnthropicResponse } from '../lib/ai/anthropicProvider';
import { detectDisallowedQuestion } from '../lib/safety/academicIntegrity';

interface Settings {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

// Helper function to check if URL is restricted (internal browser pages)
function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return true;
  const restrictedPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'brave://',
    'about:',
    'file://',
    'devtools://',
  ];
  return restrictedPrefixes.some(prefix => url.startsWith(prefix));
}

// Handle messages from content script
chrome.runtime.onMessage.addListener(
  (request: AIRequest, _sender, sendResponse) => {
    console.log('[EduOverlay] Background: received message', request.type);
    handleAIRequest(request)
      .then(sendResponse)
      .catch((error) => {
        console.error('[EduOverlay] Background: AI request failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
);

async function handleAIRequest(request: AIRequest): Promise<AIResponse> {
  try {
    const settings = await getSettings();

    if (!settings.apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set your API key in extension settings.',
      };
    }

    const disallowedCheck = detectDisallowedQuestion(request.prompt);
    if (disallowedCheck.isDisallowed) {
      return {
        success: false,
        error: disallowedCheck.message,
      };
    }

    let response: string;
    switch (settings.provider) {
      case 'gemini':
        response = await getGeminiResponse(
          request.prompt,
          request.context,
          settings.apiKey,
          settings.model
        );
        break;
      case 'openai':
        response = await getOpenAIResponse(
          request.prompt,
          request.context,
          settings.apiKey,
          settings.model
        );
        break;
      case 'anthropic':
        response = await getAnthropicResponse(
          request.prompt,
          request.context,
          settings.apiKey,
          settings.model
        );
        break;
      default:
        throw new Error(`Unknown provider: ${settings.provider}`);
    }

    return { success: true, response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

async function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['aiProvider', 'apiKey', 'aiModel'],
      (result) => {
        resolve({
          provider: (result.aiProvider as Settings['provider']) || 'gemini',
          apiKey: result.apiKey || '',
          model:
            result.aiModel ||
            getDefaultModel(result.aiProvider as Settings['provider']),
        });
      }
    );
  });
}

function getDefaultModel(provider?: string): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-5-haiku-latest';
    case 'gemini':
    default:
      return 'gemini-2.5-flash';
  }
}

// Handle keyboard command from manifest
chrome.commands.onCommand.addListener(async (command) => {
  console.log('[EduOverlay] Background: received command', command);

  if (command !== 'toggle-overlay') return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !tab.url) {
      console.warn('[EduOverlay] Background: no active tab or URL');
      return;
    }

    // Check for restricted URLs
    if (isRestrictedUrl(tab.url)) {
      console.warn('[EduOverlay] Background: blocked on restricted URL:', tab.url);
      return;
    }

    console.log('[EduOverlay] Background: sending toggle to tab', tab.id, tab.url);

    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, { type: 'EDUOVERLAY_TOGGLE' });
    console.log('[EduOverlay] Background: toggle message sent successfully');
  } catch (error) {
    console.warn('[EduOverlay] Background: failed to send message, content script may not be ready:', error);
    // Don't crash - content script might not be ready yet
  }
});

console.log('[EduOverlay] Background: service worker initialized');