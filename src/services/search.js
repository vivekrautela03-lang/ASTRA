export async function searchWeb(query) {
  try {
    const res = await fetch(`http://localhost:8990/api/v1/public-apis?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    console.warn('[SEARCH SERVICE]: Fallback to internal search');
  }
  return { results: [], query };
}

export default {
  searchWeb
};
