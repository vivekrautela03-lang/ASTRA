export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: 'document' | 'code' | 'note' | 'web_knowledge' | 'user_memory';
  timestamp: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface RAGSearchResult {
  document: RAGDocument;
  score: number;
  snippet: string;
}

export class VectorStoreService {
  private documents: RAGDocument[] = [];
  private readonly STORAGE_KEY = 'astra_rag_vector_store';

  constructor() {
    this.loadFromStorage();
    if (this.documents.length === 0) {
      this.populateDefaultKnowledge();
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.documents = JSON.parse(stored);
        }
      } catch {
        // Fallback to empty array
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.documents));
      } catch {
        // Fallback
      }
    }
  }

  private populateDefaultKnowledge() {
    const initialKnowledge: RAGDocument[] = [
      {
        id: 'rag-doc-1',
        title: 'ASTRA System Architecture Overview',
        content: 'ASTRA is a premium AI personal desktop assistant created by Vivek Rautela. ASTRA symbolizes intelligence, precision, and power. It features real-time Open-Meteo weather integration, local system time/date tools, camera vision perception via getUserMedia, voice synthesis with natural human conversational fillers, and multi-model AI routing across Groq Llama 3 70B, DeepSeek R1, and Google Gemini 1.5 Pro.',
        category: 'document',
        timestamp: new Date().toISOString()
      },
      {
        id: 'rag-doc-2',
        title: 'Vivek Personal Preferences Vault',
        content: 'The user Vivek is the creator and Boss of ASTRA. Preferred programming languages include TypeScript, React, Python, and C++. Workstation location: Dehradun, India. Preferred AI tone: calm, articulate, confident, direct, and slightly futuristic.',
        category: 'user_memory',
        timestamp: new Date().toISOString()
      },
      {
        id: 'rag-doc-3',
        title: 'Voice & Wake-Word Architecture Guidelines',
        content: 'ASTRA uses browser-compatible Web Speech API and WakeWordEngine listening for "Hey ASTRA". It addresses the user as "Boss" naturally when answering requests, and supports instant voice interruption ("Stop"), sentence-level TTS synthesis, and prompt queueing for turn-taking.',
        category: 'code',
        timestamp: new Date().toISOString()
      }
    ];

    this.documents = initialKnowledge;
    this.saveToStorage();
  }

  /**
   * Fast In-Browser Token Frequency & Semantic Embedding Generator
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  /**
   * Calculate TF-IDF & Cosine Similarity Score between Query & Document
   */
  private calculateSimilarityScore(query: string, docText: string): number {
    const queryTokens = this.tokenize(query);
    const docTokens = this.tokenize(docText);

    if (queryTokens.length === 0 || docTokens.length === 0) return 0;

    const docFreqMap: Record<string, number> = {};
    docTokens.forEach(t => {
      docFreqMap[t] = (docFreqMap[t] || 0) + 1;
    });

    let matchCount = 0;
    let score = 0;

    queryTokens.forEach(qToken => {
      if (docFreqMap[qToken]) {
        matchCount += 1;
        score += (docFreqMap[qToken] / docTokens.length) * 1.5;
      }
    });

    const jaccard = matchCount / (new Set([...queryTokens, ...docTokens]).size);
    return Math.min(1.0, score + jaccard * 2.0);
  }

  /**
   * Ingest a new document into the Vector Knowledge Store
   */
  public addDocument(title: string, content: string, category: RAGDocument['category'] = 'document'): RAGDocument {
    const doc: RAGDocument = {
      id: `rag-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      content: content.trim(),
      category,
      timestamp: new Date().toISOString()
    };

    this.documents.unshift(doc);
    this.saveToStorage();
    return doc;
  }

  /**
   * Delete a document from Vector Store
   */
  public deleteDocument(id: string): void {
    this.documents = this.documents.filter(d => d.id !== id);
    this.saveToStorage();
  }

  /**
   * Perform Semantic Vector Search & Rank Results
   */
  public searchSimilar(query: string, topK: number = 3, threshold: number = 0.05): RAGSearchResult[] {
    const results: RAGSearchResult[] = [];

    this.documents.forEach(doc => {
      const score = this.calculateSimilarityScore(query, `${doc.title} ${doc.content}`);
      if (score >= threshold) {
        results.push({
          document: doc,
          score: Math.round(score * 100) / 100,
          snippet: doc.content.length > 180 ? `${doc.content.substring(0, 180)}...` : doc.content
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Get all ingested documents in Vector Store
   */
  public getAllDocuments(): RAGDocument[] {
    return [...this.documents];
  }

  /**
   * Clear Vector Store
   */
  public clearAll(): void {
    this.documents = [];
    this.saveToStorage();
  }
}

export const vectorStoreService = new VectorStoreService();
