import { buildPrompt } from './prompts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface AnthropicResponse {
  content?: { type: 'text'; text: string }[];
  error?: { message: string };
}

export async function getAnthropicResponse(prompt: string, context: string, apiKey: string, model: string = 'claude-3-5-haiku-latest'): Promise<string> {
  const fullPrompt = buildPrompt(prompt, context);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: 'Kamu adalah asisten belajar untuk mahasiswa. Selalu jawab dalam bahasa Indonesia.',
      messages: [{ role: 'user', content: fullPrompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`Anthropic API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) throw new Error(`Anthropic error: ${data.error.message}`);
  if (!data.content?.[0]?.text) throw new Error('No response from Claude');

  return data.content[0].text;
}