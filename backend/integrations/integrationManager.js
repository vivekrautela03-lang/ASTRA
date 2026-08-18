/**
 * ASTRA OS — Official Cloud Integrations & Credential Manager
 */

export class IntegrationManager {
  constructor() {
    this.integrations = {
      openai: {
        id: 'openai',
        name: 'OpenAI API',
        category: 'AI / LLM',
        envKey: 'OPENAI_API_KEY',
        docsUrl: 'https://platform.openai.com',
        description: 'GPT-4o, Whisper STT, and text embeddings.'
      },
      google: {
        id: 'google',
        name: 'Google Gemini',
        category: 'AI / Multimodal',
        envKey: 'GEMINI_API_KEY',
        docsUrl: 'https://aistudio.google.com',
        description: 'Gemini 1.5 Pro multimodal vision and research.'
      },
      groq: {
        id: 'groq',
        name: 'Groq Cloud LPU',
        category: 'AI / Ultra-Fast LLM',
        envKey: 'GROQ_API_KEY',
        docsUrl: 'https://console.groq.com',
        description: 'Sub-100ms Llama 3.3 70B conversational latency.'
      },
      deepseek: {
        id: 'deepseek',
        name: 'DeepSeek AI',
        category: 'AI / Reasoning',
        envKey: 'DEEPSEEK_API_KEY',
        docsUrl: 'https://platform.deepseek.com',
        description: 'DeepSeek-R1 logic and algorithmic reasoning.'
      },
      supabase: {
        id: 'supabase',
        name: 'Supabase PostgreSQL',
        category: 'Database / RAG',
        envKey: 'SUPABASE_URL',
        docsUrl: 'https://supabase.com/dashboard',
        description: 'pgvector memory, RLS tenancy, and realtime storage.'
      },
      github: {
        id: 'github',
        name: 'GitHub Cloud',
        category: 'DevOps / Code',
        envKey: 'GITHUB_TOKEN',
        docsUrl: 'https://github.com/settings/tokens',
        description: 'Automated PRs, issues, commits, and CI actions.'
      },
      vercel: {
        id: 'vercel',
        name: 'Vercel Deployment',
        category: 'DevOps / Hosting',
        envKey: 'VERCEL_TOKEN',
        docsUrl: 'https://vercel.com/account/tokens',
        description: 'Frontend builds and production deployments.'
      },
      figma: {
        id: 'figma',
        name: 'Figma Design Tokens',
        category: 'Design / UI',
        envKey: 'FIGMA_TOKEN',
        docsUrl: 'https://www.figma.com/developers/api',
        description: 'Design system tokens and layout inspection.'
      }
    };
  }

  getIntegrations() {
    return Object.values(this.integrations).map(item => {
      const val = process.env[item.envKey] || process.env[`VITE_${item.envKey}`];
      const isConnected = Boolean(val && val.length > 5);
      return {
        ...item,
        status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
        hasKey: isConnected
      };
    });
  }
}

export const integrationManager = new IntegrationManager();
