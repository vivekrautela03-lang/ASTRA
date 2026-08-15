import type { MemoryItem } from '../types/eva';

const STORAGE_KEY = 'EVA_OS_PERSISTENT_MEMORY_V8';

export class MemoryEngine {
  private memories: MemoryItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.memories = JSON.parse(saved);
        return;
      }
    } catch {
      // Fallback to default
    }

    // Default initial seed memory
    this.memories = [
      {
        id: 'mem-1',
        content: 'User prefers dark glassmorphism futuristic Jarvis theme with cyan/aurora lighting.',
        category: 'preference',
        confidence: 0.99,
        timestamp: '2026-08-07 10:15',
        tags: ['ui', 'theme', 'jarvis', 'preferences']
      },
      {
        id: 'mem-2',
        content: 'Core project workspace located at e:\\EV my personal assistant (React + WebGL Three.js + TypeScript).',
        category: 'code',
        confidence: 1.0,
        timestamp: '2026-08-07 11:30',
        tags: ['workspace', 'vite', 'threejs', 'react']
      },
      {
        id: 'mem-3',
        content: 'Bilingual voice mode active: Hindi + English seamless switching enabled.',
        category: 'preference',
        confidence: 0.95,
        timestamp: '2026-08-07 12:00',
        tags: ['voice', 'hindi', 'bilingual', 'stt']
      },
      {
        id: 'mem-4',
        content: 'User primary goals: Create the world\'s most advanced AI Assistant OS that feels alive.',
        category: 'fact',
        confidence: 0.99,
        timestamp: '2026-08-07 12:45',
        tags: ['mission', 'jarvis', 'ai-os', 'architecture']
      },
      {
        id: 'mem-5',
        content: 'Local environment running on high-end GPU with WebGL Shader rendering active at 120 FPS.',
        category: 'event',
        confidence: 0.97,
        timestamp: '2026-08-07 13:00',
        tags: ['hardware', 'gpu', 'performance', 'telemetry']
      }
    ];

    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memories));
    } catch (e) {
      console.warn('[EV Memory Storage] Failed to save memory to local storage', e);
    }
  }

  public getMemories(): MemoryItem[] {
    return [...this.memories];
  }

  public searchMemories(query: string): MemoryItem[] {
    if (!query.trim()) return this.getMemories();
    const q = query.toLowerCase();
    return this.memories.filter(
      m => m.content.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  public addMemory(content: string, category: MemoryItem['category'], tags: string[] = []): MemoryItem {
    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      content,
      category,
      confidence: 0.98,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tags: ['user-added', ...tags]
    };
    this.memories.unshift(newItem);
    this.saveToStorage();
    return newItem;
  }

  public deleteMemory(id: string): void {
    this.memories = this.memories.filter(m => m.id !== id);
    this.saveToStorage();
  }

  public clearAllMemories(): void {
    this.memories = [];
    this.saveToStorage();
  }
}

export const memoryEngine = new MemoryEngine();
