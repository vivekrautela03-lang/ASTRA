export async function searchYouTube(query) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const resp = await fetch(searchUrl);
  const html = await resp.text();

  const match = html.match(/var ytInitialData = (.*?);<\/script>/s) || html.match(/window\["ytInitialData"\] = (.*?);<\/script>/s);
  if (!match) {
    return [];
  }

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const results = [];
  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.videoRenderer && obj.videoRenderer.videoId) {
      const vr = obj.videoRenderer;
      const title = vr.title?.runs?.map((run) => run.text).join('') || vr.title?.simpleText || 'Unknown';
      results.push({
        id: vr.videoId,
        title,
        url: `https://www.youtube.com/watch?v=${vr.videoId}`
      });
    }

    for (const value of Object.values(obj)) {
      walk(value);
    }
  }

  walk(data);

  const dedup = [];
  const seen = new Set();
  for (const item of results) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      dedup.push(item);
    }
    if (dedup.length >= 8) break;
  }

  return dedup;
}
