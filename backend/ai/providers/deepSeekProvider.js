import { AIProvider } from '../aiProvider.js';

export class DeepSeekProvider extends AIProvider {
  constructor() {
    super('DeepSeek AI', 'cloud');
  }

  isConfigured() {
    const key = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    return Boolean(key && key.length > 5);
  }

  async generateText(prompt, { systemPrompt = '', model = 'deepseek-chat', timeoutMs = 12000 } = {}) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('DeepSeek API key not configured');

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are ASTRA, a logical reasoning personal AI operating system.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) throw new Error(`DeepSeek error: HTTP ${res.status}`);
    const data = await res.json();
    return {
      text: data?.choices?.[0]?.message?.content || '',
      modelUsed: model,
      provider: 'DeepSeek AI'
    };
  }
}
