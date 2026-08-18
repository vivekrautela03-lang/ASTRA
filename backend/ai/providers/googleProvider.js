import { AIProvider } from '../aiProvider.js';

export class GoogleProvider extends AIProvider {
  constructor() {
    super('Google AI Studio', 'cloud');
  }

  isConfigured() {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    return Boolean(key && key.length > 5);
  }

  async generateText(prompt, { systemPrompt = '', model = 'gemini-1.5-flash', timeoutMs = 10000 } = {}) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt || 'You are ASTRA, a personal AI operating system.' }] }
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!res.ok) throw new Error(`Google Gemini error: HTTP ${res.status}`);
    const data = await res.json();
    return {
      text: data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
      modelUsed: model,
      provider: 'Google AI Studio'
    };
  }
}
