import { AIProvider } from '../aiProvider.js';
import { CONFIG } from '../../config/env.js';

export class LocalProvider extends AIProvider {
  constructor() {
    super('Local Host / Ollama', 'local');
  }

  isConfigured() {
    return true; // Local host is always assumed available for offline tasks
  }

  async generateText(prompt, { model = 'llama3', timeoutMs = 8000 } = {}) {
    try {
      const res = await fetch(`${CONFIG.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          text: data.response || '',
          modelUsed: model,
          provider: 'Local Ollama'
        };
      }
    } catch {
      // Local daemon offline fallback
    }

    return {
      text: `[Local Offline Mode] Received directive: "${prompt}". Running offline heuristics.`,
      modelUsed: 'local-fallback',
      provider: 'Local Host'
    };
  }
}
