import React, { useState } from 'react';
import { Database, Plus, Search, Trash2, FileText } from 'lucide-react';
import { vectorStoreService, type RAGDocument } from '../../../services/rag/vectorStore';
import { ragTool } from '../../../services/tools/RAGTool';

export const KnowledgeRAGWidget: React.FC = () => {
  const [docs, setDocs] = useState<RAGDocument[]>(vectorStoreService.getAllDocuments());
  const [isIngesting, setIsIngesting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    ragTool.addDocument(newTitle.trim(), newContent.trim());
    setDocs(vectorStoreService.getAllDocuments());
    setNewTitle('');
    setNewContent('');
    setIsIngesting(false);
  };

  const handleDelete = (id: string) => {
    vectorStoreService.deleteDocument(id);
    setDocs(vectorStoreService.getAllDocuments());
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const result = await ragTool.search(searchQuery.trim());
    setSearchStatus(result);
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-950/70 border border-purple-500/30 backdrop-blur-2xl shadow-xl flex flex-col gap-3 font-sans text-xs w-72">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-purple-300">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white text-xs">Vector RAG Knowledge</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
          {docs.length} Docs
        </span>
      </div>

      {/* RAG Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-1 bg-black/50 p-1.5 rounded-xl border border-white/10">
        <Search className="w-3.5 h-3.5 text-purple-400 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vector knowledge..."
          className="flex-1 bg-transparent border-none outline-none text-white text-[11px] placeholder:text-white/40"
        />
        <button type="submit" className="px-2 py-1 rounded-lg bg-purple-500/30 text-purple-200 text-[10px] font-bold">
          Query
        </button>
      </form>

      {/* Query Search Result Toast */}
      {searchStatus && (
        <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-[10px] text-purple-200 leading-relaxed font-mono">
          {searchStatus}
        </div>
      )}

      {/* Ingest Form / Action */}
      {isIngesting ? (
        <form onSubmit={handleIngest} className="flex flex-col gap-2 p-2.5 rounded-2xl bg-black/60 border border-white/10">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document Title (e.g. Project Specs)"
            className="w-full p-1.5 rounded-lg bg-white/10 text-white text-[11px] outline-none"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Document text content or notes..."
            className="w-full h-16 p-1.5 rounded-lg bg-white/10 text-white text-[11px] outline-none resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[10px]">
              Ingest Document
            </button>
            <button type="button" onClick={() => setIsIngesting(false)} className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-[10px]">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsIngesting(true)}
          className="py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-all text-[11px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Knowledge Document</span>
        </button>
      )}

      {/* Quick Document List */}
      <div className="max-h-28 overflow-y-auto flex flex-col gap-1.5 border-t border-white/10 pt-2">
        {docs.slice(0, 3).map(doc => (
          <div key={doc.id} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-between group">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-white text-[11px] truncate">{doc.title}</span>
            </div>
            <button onClick={() => handleDelete(doc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
