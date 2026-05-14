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

// Handle messages from content script
chrome.runtime.onMessage.addListener(
  (request: AIRequest, _sender, sendResponse) => {
    handleAIRequest(request)
      .then(sendResponse)
      .catch((error) => {
        console.error('AI request failed:', error);
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
      return 'gemini-1.5-flash';
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-overlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_OVERLAY' });
      }
    });
  }
});