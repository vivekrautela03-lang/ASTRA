import { AIProvider } from '../aiProvider.js';

export class GroqProvider extends AIProvider {
  constructor() {
    super('Groq Cloud', 'cloud');
  }

  isConfigured() {
    const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    return Boolean(key && key.length > 5);
  }

  async generateText(prompt, { systemPrompt = '', model = 'llama-3.3-70b-versatile', timeoutMs = 8000 } = {}) {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key not configured');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are ASTRA, a high-speed personal AI operating system.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) throw new Error(`Groq error: HTTP ${res.status}`);
    const data = await res.json();
    return {
      text: data?.choices?.[0]?.message?.content || '',
      modelUsed: model,
      provider: 'Groq Cloud'
    };
  }
}
