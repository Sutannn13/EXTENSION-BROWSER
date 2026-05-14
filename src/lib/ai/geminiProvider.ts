import { buildPrompt } from './prompts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message: string };
}

export async function getGeminiResponse(prompt: string, context: string, apiKey: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  const fullPrompt = buildPrompt(prompt, context);

  const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');

  return text;
}