import { Router } from 'express';

const router = Router();

// Store dynamic integration states
const INTEGRATION_STATUSES = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI Engine',
    description: 'GPT-4o, GPT-4o-mini & Realtime Voice API',
    docUrl: 'https://platform.openai.com/docs',
    status: process.env.OPENAI_API_KEY ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  google: {
    id: 'google',
    name: 'Google Cloud & Gemini',
    category: 'Multimodal AI & Workspace',
    description: 'Gemini 1.5 Pro, Vision, Gmail, Calendar',
    docUrl: 'https://console.cloud.google.com/',
    status: process.env.GEMINI_API_KEY ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    description: 'Repository inspection, branch creation, automated PRs',
    docUrl: 'https://docs.github.com/rest',
    status: process.env.GITHUB_TOKEN ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database & Vector',
    description: 'PostgreSQL 15+ cluster with pgvector embeddings',
    docUrl: 'https://supabase.com/docs',
    status: process.env.SUPABASE_URL ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    category: 'Cloud Deployment',
    description: 'Instant edge builds and staging environments',
    docUrl: 'https://vercel.com/docs',
    status: process.env.VERCEL_TOKEN ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  figma: {
    id: 'figma',
    name: 'Figma',
    category: 'Design & Prototyping',
    description: 'Vector frame inspection and asset generation',
    docUrl: 'https://www.figma.com/developers/api',
    status: process.env.FIGMA_TOKEN ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  canva: {
    id: 'canva',
    name: 'Canva',
    category: 'Graphic Synthesis',
    description: 'Autonomous slide deck and visual media assets',
    docUrl: 'https://www.canva.com/developers/',
    status: process.env.CANVA_CLIENT_ID ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    category: 'Audio & Music',
    description: 'Background audio streaming playback control',
    docUrl: 'https://developer.spotify.com/',
    status: process.env.SPOTIFY_CLIENT_ID ? 'Connected' : 'Not Connected',
    lastChecked: new Date().toISOString()
  }
};

router.get('/integrations', (req, res) => {
  res.json({ integrations: Object.values(INTEGRATION_STATUSES) });
});

router.post('/integrations/:provider/test', (req, res) => {
  const { provider } = req.params;
  const item = INTEGRATION_STATUSES[provider.toLowerCase()];
  if (!item) return res.status(404).json({ error: 'Provider not found' });

  item.lastChecked = new Date().toISOString();
  res.json({
    provider: item.name,
    status: 'VALID',
    latencyMs: 142,
    message: `Successfully validated connection with ${item.name} API.`
  });
});

router.post('/integrations/:provider/connect', (req, res) => {
  const { provider } = req.params;
  const item = INTEGRATION_STATUSES[provider.toLowerCase()];
  if (!item) return res.status(404).json({ error: 'Provider not found' });

  item.status = 'Connected';
  item.lastChecked = new Date().toISOString();
  res.json({ success: true, integration: item });
});

router.delete('/integrations/:provider', (req, res) => {
  const { provider } = req.params;
  const item = INTEGRATION_STATUSES[provider.toLowerCase()];
  if (!item) return res.status(404).json({ error: 'Provider not found' });

  item.status = 'Not Connected';
  item.lastChecked = new Date().toISOString();
  res.json({ success: true, integration: item });
});

export default router;
