import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Code2,
  Search,
  Upload,
  Trash2,
  Download,
  ExternalLink,
  X,
  Shield,
  Copy,
  Check,
  HardDrive
} from 'lucide-react';
import {
  fileVaultService,
  type VaultItem,
  type VaultFileType
} from '../../services/fileVaultService';

interface AstraFileVaultProps {
  onOpenChatSession?: (content: string) => void;
  className?: string;
}

export const AstraFileVault: React.FC<AstraFileVaultProps> = ({
  onOpenChatSession,
  className = ''
}) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | VaultFileType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshVault = () => {
    setItems(fileVaultService.getItems());
  };

  useEffect(() => {
    refreshVault();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          fileVaultService.addUploadedFile(file, '', ev.target?.result as string);
          refreshVault();
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          fileVaultService.addUploadedFile(file, ev.target?.result as string);
          refreshVault();
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    fileVaultService.deleteItem(id);
    if (selectedItem?.id === id) setSelectedItem(null);
    refreshVault();
  };

  const handleDownload = (item: VaultItem) => {
    const content = item.content || item.summary || item.name;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (type: VaultFileType) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Folder className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className={`w-full h-[78vh] flex flex-col gap-5 p-6 rounded-3xl liquid-glass shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10 select-text overflow-hidden animate-in fade-in zoom-in-95 ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl liquid-glass-pill flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,191,255,0.4)]">
            <Folder className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-wider text-white">
                ASTRA FILE VAULT &amp; KNOWLEDGE ARCHIVE
              </h2>
              <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full liquid-glass-card text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                QUANTUM ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-white/50 font-sans">
              Store, search, and recall chats, generated images, research documents, and code artifacts.
            </p>
          </div>
        </div>

        {/* Upload & Storage Summary */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl liquid-glass-card text-xs font-mono text-white/60">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{items.length} Files Stored</span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00BFFF] to-blue-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider shadow-[0_0_20px_rgba(0,191,255,0.45)] transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 select-none">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass-card overflow-x-auto astra-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All Files ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === 'chat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chats ({items.filter((i) => i.type === 'chat').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === 'image'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Images ({items.filter((i) => i.type === 'image').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('document')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === 'document'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Documents ({items.filter((i) => i.type === 'document').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('code')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeCategory === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Code ({items.filter((i) => i.type === 'code').length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, chats, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl liquid-glass-input text-xs text-white placeholder-white/40 outline-none"
          />
        </div>
      </div>

      {/* 3. Main Files Grid */}
      <div className="flex-1 overflow-y-auto astra-scrollbar pr-1">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center text-white/40 select-none py-12">
            <Folder className="w-12 h-12 stroke-[1.2] text-cyan-400/40 animate-pulse" />
            <span className="text-sm font-semibold">No files match your search filter</span>
            <p className="text-xs max-w-sm">
              Upload documents or save chats to store them permanently in your local encrypted enclave.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-4 rounded-2xl liquid-glass-card flex flex-col justify-between gap-3 border border-white/[0.08] hover:border-cyan-500/40 hover:scale-[1.01] transition-all cursor-pointer group shadow-sm"
              >
                {/* Card Top */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail / Icon */}
                  {item.type === 'image' && item.previewUrl ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden liquid-glass-card shrink-0 border border-white/20">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl liquid-glass-pill flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.type)}
                    </div>
                  )}

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 mt-0.5">
                      {item.size} • {item.createdAt}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                {item.summary && (
                  <p className="text-[11px] text-white/60 font-sans line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                {/* Tags & Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] select-none">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full liquid-glass-chip text-cyan-300/80 shrink-0"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      title="Download file"
                      className="p-1.5 rounded-lg text-white/50 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Delete from vault"
                      className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Full Item Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in select-text">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col p-6 rounded-3xl liquid-glass shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-cyan-500/30 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl liquid-glass-pill flex items-center justify-center">
                  {getCategoryIcon(selectedItem.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {selectedItem.name}
                  </span>
                  <span className="text-[10px] font-mono text-white/50">
                    {selectedItem.type.toUpperCase()} • {selectedItem.size} • {selectedItem.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopyContent(selectedItem.content || selectedItem.summary)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-chip text-xs text-white/80 hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(selectedItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-chip text-xs text-white/80 hover:text-white"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto astra-scrollbar py-4 flex flex-col gap-4">
              {/* Image Preview */}
              {selectedItem.type === 'image' && selectedItem.previewUrl && (
                <div className="w-full flex items-center justify-center p-4 rounded-2xl liquid-glass-card">
                  <img
                    src={selectedItem.previewUrl}
                    alt={selectedItem.name}
                    className="max-h-96 rounded-xl object-contain shadow-2xl"
                  />
                </div>
              )}

              {/* Text / Markdown / Code Viewer */}
              {selectedItem.content && (
                <pre className="p-4 rounded-2xl liquid-glass-card text-xs font-mono text-[#E6F7FF] whitespace-pre-wrap leading-relaxed overflow-x-auto astra-scrollbar select-text">
                  {selectedItem.content}
                </pre>
              )}

              {/* Chat Session Details & Action */}
              {selectedItem.type === 'chat' && onOpenChatSession && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedItem.content) {
                        onOpenChatSession(selectedItem.content);
                      }
                      setSelectedItem(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00BFFF] to-blue-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider shadow-[0_0_20px_rgba(0,191,255,0.4)] transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Chat HUD</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstraFileVault;
