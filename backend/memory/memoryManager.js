/**
 * ASTRA OS — Complete 15-Layer Memory Architecture
 * 
 * Layers:
 * 1. Working Memory (Active task context)
 * 2. Short-Term Memory (Recent dialog turns)
 * 3. Episodic Memory (Events & outcomes)
 * 4. Semantic Memory (Facts & pgvector embeddings)
 * 5. Procedural Memory (Workflows & recipes)
 * 6. Personal Memory (User identity & background)
 * 7. Preference Memory (UI/voice/style settings)
 * 8. Project Memory (Isolated per project)
 * 9. Conversational Memory (Raw transcript history)
 * 10. Environmental Memory (Time, weather, location, screen state)
 * 11. Tool Memory (Tool executions & metrics)
 * 12. Agent Memory (Active agent allocations)
 * 13. Knowledge Memory (Document chunks & PDFs)
 * 14. Relationship Memory (Knowledge Graph)
 * 15. Temporal Memory (valid_from / valid_until validity timestamps)
 */

import { knowledgeGraph } from './knowledgeGraph.js';

export const MEMORY_TIERS = {
  WORKING: 'WORKING',
  SHORT_TERM: 'SHORT_TERM',
  EPISODIC: 'EPISODIC',
  SEMANTIC: 'SEMANTIC',
  PROCEDURAL: 'PROCEDURAL',
  PERSONAL: 'PERSONAL',
  PREFERENCE: 'PREFERENCE',
  PROJECT: 'PROJECT',
  CONVERSATIONAL: 'CONVERSATIONAL',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  TOOL: 'TOOL',
  AGENT: 'AGENT',
  KNOWLEDGE: 'KNOWLEDGE',
  RELATIONSHIP: 'RELATIONSHIP',
  TEMPORAL: 'TEMPORAL'
};

export class MemoryManager {
  constructor() {
    this.vault = new Map();
    this.workingMemory = {
      activeGoal: null,
      activePlan: null,
      activeScreenState: null,
      currentToolOutputs: []
    };
    this.environmentalMemory = {
      location: 'Workstation',
      weather: 'Clear',
      timezone: 'UTC+5:30',
      activeWindow: 'ASTRA OS Workspace'
    };
    this.initDefaultMemories();
  }

  initDefaultMemories() {
    this.addMemory({
      tier: MEMORY_TIERS.PERSONAL,
      content: 'User is Vivek Rautela, creator and principal architect of ASTRA OS.',
      tags: ['user', 'identity'],
      importance: 10
    });

    this.addMemory({
      tier: MEMORY_TIERS.PREFERENCE,
      content: 'Address Vivek as Boss naturally. Maintain an intelligent, calm, confident tone.',
      tags: ['persona', 'style'],
      importance: 10
    });

    this.addMemory({
      tier: MEMORY_TIERS.SEMANTIC,
      content: 'ASTRA is a personal AI operating system featuring a custom backend kernel, Supabase pgvector, and robotics abstraction.',
      tags: ['architecture', 'facts'],
      importance: 9
    });

    this.addMemory({
      tier: MEMORY_TIERS.PROCEDURAL,
      content: 'Development procedure: Inspect -> Plan -> Git Branch -> Code -> Test -> Security Scan -> User Approval -> Deploy.',
      tags: ['workflow', 'best-practices'],
      importance: 9
    });

    this.addMemory({
      tier: MEMORY_TIERS.PROJECT,
      content: 'Project TOV Studio: Next.js + Supabase + Vercel stack. Status: Production.',
      projectId: 'prj-tov-studio',
      tags: ['tov-studio', 'stack'],
      importance: 8
    });
  }

  // 1. Working Memory Controls
  setWorkingContext(contextUpdate) {
    Object.assign(this.workingMemory, contextUpdate);
  }

  getWorkingContext() {
    return { ...this.workingMemory };
  }

  // 2. Environmental Memory Controls
  updateEnvironmentalMemory(envUpdate) {
    Object.assign(this.environmentalMemory, envUpdate);
  }

  getEnvironmentalMemory() {
    return { ...this.environmentalMemory };
  }

  // Core Multi-Tier Store & Retrieval
  addMemory({
    tier = MEMORY_TIERS.SHORT_TERM,
    content,
    tags = [],
    importance = 5,
    projectId = null,
    validFrom = new Date().toISOString(),
    validUntil = null
  }) {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record = {
      id,
      tier,
      content,
      tags,
      importance,
      projectId,
      validFrom,
      validUntil,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.vault.set(id, record);
    return record;
  }

  searchMemories(query = '', { tier, projectId, limit = 10, includeExpired = false } = {}) {
    const now = new Date().toISOString();
    let records = Array.from(this.vault.values());

    // Filter by Temporal Validity
    if (!includeExpired) {
      records = records.filter(r => {
        if (r.validFrom && r.validFrom > now) return false;
        if (r.validUntil && r.validUntil < now) return false;
        return true;
      });
    }

    if (tier) {
      records = records.filter(r => r.tier === tier);
    }
    if (projectId) {
      records = records.filter(r => r.projectId === projectId || !r.projectId);
    }

    if (!query) {
      return records.slice(0, limit);
    }

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return records
      .map(r => {
        const text = `${r.content} ${r.tags.join(' ')} ${r.tier}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (text.includes(t)) score += 1;
        }
        return { memory: r, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.memory.importance - a.memory.importance)
      .slice(0, limit)
      .map(item => item.memory);
  }

  deleteMemory(id) {
    return this.vault.delete(id);
  }

  forgetMatching(query) {
    const matching = this.searchMemories(query, { limit: 100 });
    let deletedCount = 0;
    for (const mem of matching) {
      if (this.vault.delete(mem.id)) {
        deletedCount += 1;
      }
    }
    return { deletedCount };
  }

  getAll() {
    return Array.from(this.vault.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getKnowledgeGraph() {
    return knowledgeGraph.exportGraph();
  }
}

export const memoryManager = new MemoryManager();
