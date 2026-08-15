import { Router } from 'express';
import { searchYouTube } from '../services/searchProvider.js';
import { executeProviderCommand } from '../services/commandExecutor.js';

const router = Router();

router.post('/automation/search-song', async (req, res) => {
  const { query, provider } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query required' });
  }

  try {
    if (!provider || provider === 'youtube') {
      const results = await searchYouTube(query);
      return res.json({ provider: 'youtube', results });
    }

    return res.json({ provider: provider || 'unknown', results: [] });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

router.post('/automation/play-song', async (req, res) => {
  const { provider, id, url, query } = req.body;
  if (!provider) {
    return res.status(400).json({ error: 'provider required' });
  }

  try {
    const result = await executeProviderCommand(provider, { id, url, query });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      provider,
      played: true,
      url: url || (id ? `https://www.youtube.com/watch?v=${id}` : undefined),
      result
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Playback failed' });
  }
});

export default router;
