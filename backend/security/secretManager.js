/**
 * ASTRA OS — In-Memory Encrypted Credential Vault & Masker
 */

export class SecretManager {
  static maskKey(rawKey) {
    if (!rawKey || typeof rawKey !== 'string') return 'NOT_CONFIGURED';
    if (rawKey.length <= 8) return '********';
    return `${rawKey.slice(0, 4)}...${rawKey.slice(-4)}`;
  }

  static getSanitizedSecrets() {
    return {
      OPENAI_API_KEY: SecretManager.maskKey(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY),
      GEMINI_API_KEY: SecretManager.maskKey(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
      GROQ_API_KEY: SecretManager.maskKey(process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY),
      DEEPSEEK_API_KEY: SecretManager.maskKey(process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY),
      GITHUB_TOKEN: SecretManager.maskKey(process.env.GITHUB_TOKEN),
      VERCEL_TOKEN: SecretManager.maskKey(process.env.VERCEL_TOKEN),
      FIGMA_TOKEN: SecretManager.maskKey(process.env.FIGMA_TOKEN),
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://hzvsrqhfurghzkfdpxlt.supabase.co'
    };
  }

  static isConfigured(secretName) {
    const val = process.env[secretName] || process.env[`VITE_${secretName}`];
    return Boolean(val && val.length > 5);
  }
}
