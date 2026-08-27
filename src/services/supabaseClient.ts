import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export class SupabaseService {
  private static instance: SupabaseService;
  public client: SupabaseClient | null = null;
  public isConnected: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private initialize() {
    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.isConnected = true;
        console.log('[SupabaseService] Connected to Supabase backend:', SUPABASE_URL);
      } else {
        console.warn('[SupabaseService] Missing Supabase URL or Anon Key. Running in offline memory mode.');
      }
    } catch (err) {
      console.error('[SupabaseService] Initialization failed:', err);
      this.isConnected = false;
    }
  }

  // --- 1. CONVERSATIONS & MESSAGES ---
  public async logMessage(conversationId: string | null, sender: 'user' | 'astra' | 'system', content: string, modelUsed?: string) {
    if (!this.client) return null;
    try {
      let convId = conversationId;
      if (!convId) {
        const { data: newConv } = await this.client
          .from('conversations')
          .insert([{ title: content.slice(0, 40) + '...' }])
          .select('id')
          .single();
        convId = newConv?.id || null;
      }

      const { data, error } = await this.client
        .from('messages')
        .insert([{
          conversation_id: convId,
          sender,
          content,
          model_used: modelUsed || 'default'
        }])
        .select()
        .single();

      if (error) throw error;
      return { conversationId: convId, message: data };
    } catch (err) {
      console.warn('[SupabaseService] logMessage sync error:', err);
      return null;
    }
  }

  // --- 2. LONG-TERM MEMORIES ---
  public async saveMemory(content: string, category: string = 'conversation', tags: string[] = []) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('memories')
        .insert([{ content, category, tags }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SupabaseService] saveMemory sync error:', err);
      return null;
    }
  }

  public async getMemories(limit: number = 20) {
    if (!this.client) return [];
    try {
      const { data, error } = await this.client
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[SupabaseService] getMemories error:', err);
      return [];
    }
  }

  // --- 3. RAG DOCUMENTS ---
  public async saveDocument(title: string, content: string, category: string = 'document', metadata: Record<string, unknown> = {}) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('rag_documents')
        .insert([{ title, content, category, metadata }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SupabaseService] saveDocument sync error:', err);
      return null;
    }
  }

  public async getDocuments(limit: number = 30) {
    if (!this.client) return [];
    try {
      const { data, error } = await this.client
        .from('rag_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[SupabaseService] getDocuments error:', err);
      return [];
    }
  }

  // --- 4. SYSTEM LOGS ---
  public async logSystemEvent(eventType: string, details: Record<string, unknown> = {}, status: string = 'SUCCESS') {
    if (!this.client) return;
    try {
      await this.client
        .from('system_logs')
        .insert([{ event_type: eventType, details, status }]);
    } catch (err) {
      console.warn('[SupabaseService] logSystemEvent error:', err);
    }
  }
}

export const supabaseService = SupabaseService.getInstance();
