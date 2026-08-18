import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, Search, ExternalLink, ShieldCheck, 
  Layers, RefreshCw, Key
} from 'lucide-react';

interface PublicApiItem {
  name: string;
  description: string;
  auth: string;
  https: boolean;
  cors: boolean;
  category: string;
  url: string;
}

export const AstraPublicApisView: React.FC = () => {
  const [apis, setApis] = useState<PublicApiItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPublicApis = useCallback(() => {
    setIsLoading(true);
    const catParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    const qParam = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : '';

    fetch(`/api/v1/public-apis?${catParam}${qParam}`)
      .catch(() => fetch(`http://localhost:8990/api/v1/public-apis?${catParam}${qParam}`))
      .then(res => res && res.json ? res.json() : null)
      .then(data => {
        if (data?.apis) {
          setApis(data.apis);
        }
        if (data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPublicApis();
  }, [fetchPublicApis]);

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">PUBLIC APIS MASTER CATALOG</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Global public APIs and open data sources integrated into ASTRA cognitive research and tool routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPublicApis}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Catalog
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NASA, AI, Crypto, Weather, Maps..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Public APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apis.map((api, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {api.name}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {api.category}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-2 leading-relaxed line-clamp-2">
                {api.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-white/50">
                  <Key className="w-3 h-3 text-amber-400" />
                  Auth: <span className="text-white/80 font-mono">{api.auth}</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1 text-white/50">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  HTTPS: <span className="text-emerald-400">{api.https ? 'Yes' : 'No'}</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1 text-white/50">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  CORS: <span className={api.cors ? 'text-cyan-400' : 'text-amber-400'}>{api.cors ? 'Yes' : 'No'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold group-hover:underline"
                >
                  <span>Explore Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ASTRA Ready
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {apis.length === 0 && !isLoading && (
        <div className="text-center py-16 space-y-3">
          <Globe className="w-10 h-10 text-white/20 mx-auto" />
          <p className="text-sm text-white/50">No public APIs matched your query.</p>
        </div>
      )}
    </div>
  );
};
