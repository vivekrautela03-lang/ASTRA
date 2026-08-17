/**
 * ASTRA OS — Hierarchical Persistent Memory Engine
 */

export class MemorySystem {
  constructor() {
    this.memories = [
      {
        id: 'mem-core-1',
        category: 'PREFERENCE',
        content: 'Address Vivek naturally as boss. Maintain a confident, concise, futuristic tone.',
        tags: ['persona', 'user-preference'],
        importance: 10,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem-core-2',
        category: 'PROJECT',
        content: 'ASTRA OS architecture: React 19 frontend, Node Express kernel, Supabase pgvector database, modular robotics abstraction.',
        tags: ['project', 'architecture'],
        importance: 9,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mem-core-3',
        category: 'SEMANTIC',
        content: 'Hardware safety law: LLM never emits raw PWM; high-level kinematics pass through local safety interlock.',
        tags: ['robotics', 'safety'],
        importance: 10,
        createdAt: new Date().toISOString()
      }
    ];
  }

  addMemory({ content, category = 'LONG_TERM', tags = [], importance = 5, projectId = null }) {
    const memory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      content,
      tags,
      importance,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.memories.unshift(memory);
    return memory;
  }

  searchMemories(query, { category, limit = 10 } = {}) {
    let list = this.memories;
    if (category) {
      list = list.filter(m => m.category === category);
    }
    if (!query) {
      return list.slice(0, limit);
    }

    const terms = query.toLowerCase().split(/\s+/);
    return list
      .map(m => {
        const text = `${m.content} ${m.tags.join(' ')} ${m.category}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (text.includes(term)) score += 1;
        }
        return { memory: m, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.memory.importance - a.memory.importance)
      .slice(0, limit)
      .map(item => item.memory);
  }

  deleteMemory(id) {
    const initLen = this.memories.length;
    this.memories = this.memories.filter(m => m.id !== id);
    return { success: this.memories.length < initLen };
  }

  forgetMatching(query) {
    const terms = query.toLowerCase().split(/\s+/);
    const before = this.memories.length;
    this.memories = this.memories.filter(m => {
      const text = `${m.content} ${m.tags.join(' ')}`.toLowerCase();
      return !terms.some(t => text.includes(t));
    });
    return { deletedCount: before - this.memories.length };
  }

  getAll() {
    return [...this.memories];
  }
}

export const memorySystem = new MemorySystem();
