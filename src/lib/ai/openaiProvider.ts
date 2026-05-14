import { buildPrompt } from './prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  choices?: { message: { content: string } }[];
  error?: { message: string };
}

export async function getOpenAIResponse(prompt: string, context: string, apiKey: string, model: string = 'gpt-4o-mini'): Promise<string> {
  const fullPrompt = buildPrompt(prompt, context);

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: fullPrompt }],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data: OpenAIResponse = await response.json();

  if (data.error) throw new Error(`OpenAI error: ${data.error.message}`);
  if (!data.choices?.[0]?.message?.content) throw new Error('No response from OpenAI');

  return data.choices[0].message.content;
}