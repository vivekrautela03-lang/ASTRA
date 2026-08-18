import { AIProvider } from '../aiProvider.js';

export class OpenAIProvider extends AIProvider {
  constructor() {
    super('OpenAI', 'cloud');
  }

  isConfigured() {
    const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    return Boolean(key && key.length > 5);
  }

  async generateText(prompt, { systemPrompt = '', model = 'gpt-4o', timeoutMs = 10000 } = {}) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are ASTRA, a production personal AI operating system.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) throw new Error(`OpenAI error: HTTP ${res.status}`);
    const data = await res.json();
    return {
      text: data?.choices?.[0]?.message?.content || '',
      modelUsed: model,
      provider: 'OpenAI'
    };
  }
}
