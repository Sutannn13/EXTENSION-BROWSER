// AI Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIRequest {
  type: 'AI_REQUEST';
  prompt: string;
  context: string;
}

export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export type ProviderType = 'gemini' | 'openai' | 'anthropic';