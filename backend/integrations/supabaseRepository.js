/**
 * ASTRA OS — Dedicated Supabase PostgreSQL & pgvector Repository Layer
 */

import { CONFIG } from '../config/env.js';

export class SupabaseRepository {
  constructor() {
    this.supabaseUrl = CONFIG.SUPABASE_URL;
    this.anonKey = CONFIG.SUPABASE_ANON_KEY;
  }

  isConfigured() {
    return Boolean(this.supabaseUrl && this.anonKey);
  }

  async searchSemanticMemories(embedding, matchThreshold = 0.75, matchCount = 5) {
    if (!this.isConfigured()) return [];
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/rpc/match_memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`
        },
        body: JSON.stringify({
          query_embedding: embedding,
          match_threshold: matchThreshold,
          match_count: matchCount
        })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[SupabaseRepository] Semantic search fallback:', err.message);
    }
    return [];
  }

  async saveAuditLog(logRecord) {
    if (!this.isConfigured()) return { local: true };
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/system_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`
        },
        body: JSON.stringify(logRecord)
      });
    } catch {
      // Local fallback logged
    }
  }
}

export const supabaseRepository = new SupabaseRepository();
