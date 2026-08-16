import { vectorStoreService, type RAGSearchResult } from './vectorStore';
import { memoryEngine } from '../memoryEngine';

export interface RAGAugmentationResult {
  hasRetrievedKnowledge: boolean;
  contextPromptBlock: string;
  searchResults: RAGSearchResult[];
  citationSummary: string;
}

export class RAGEngine {
  /**
   * Perform RAG retrieval for user prompt and generate augmented system context
   */
  public async retrieveAndAugment(query: string): Promise<RAGAugmentationResult> {
    const searchResults = vectorStoreService.searchSimilar(query, 3, 0.05);

    // Also pull relevant memories from memoryEngine
    const memories = memoryEngine.getMemories().slice(0, 3);
    const memorySnippets = memories.map(m => `- Memory: ${m.content}`);

    if (searchResults.length === 0 && memorySnippets.length === 0) {
      return {
        hasRetrievedKnowledge: false,
        contextPromptBlock: '',
        searchResults: [],
        citationSummary: ''
      };
    }

    const docSnippets = searchResults.map(r => 
      `[Source: "${r.document.title}" (Relevance: ${Math.round(r.score * 100)}%)]\n${r.document.content}`
    ).join('\n\n');

    const contextPromptBlock = `[RETRIEVED RAG VECTOR KNOWLEDGE BASE CONTEXT]
${docSnippets}

${memorySnippets.length > 0 ? `[PERSISTENT USER MEMORY VAULT]:\n${memorySnippets.join('\n')}` : ''}
Use the above retrieved vector knowledge to answer accurately, Boss.`;

    const citationSummary = searchResults.length > 0
      ? `Retrieved ${searchResults.length} RAG Source${searchResults.length > 1 ? 's' : ''}: ${searchResults.map(s => `"${s.document.title}" (${Math.round(s.score * 100)}%)`).join(', ')}`
      : 'Retrieved relevant user memory context.';

    return {
      hasRetrievedKnowledge: true,
      contextPromptBlock,
      searchResults,
      citationSummary
    };
  }

  /**
   * Ingest text directly into RAG Vector Store
   */
  public ingestKnowledge(title: string, content: string, category: 'document' | 'code' | 'note' | 'web_knowledge' | 'user_memory' = 'document') {
    return vectorStoreService.addDocument(title, content, category);
  }

  /**
   * Continuous Auto-Learning Engine: Automatically save user question and response into RAG Vector Store & Memory Vault
   */
  public async learnFromInteraction(prompt: string, responseText: string): Promise<void> {
    if (!prompt.trim() || !responseText.trim()) return;

    // 1. Auto-ingest into Vector Store
    const docTitle = `Q&A: "${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}"`;
    const docContent = `User Question: ${prompt}\nASTRA Verified Response: ${responseText}`;
    vectorStoreService.addDocument(docTitle, docContent, 'user_memory');

    // 2. Auto-save into Memory Engine Vault
    memoryEngine.addMemory(
      `User asked: "${prompt}" | ASTRA answered: "${responseText.substring(0, 150)}..."`,
      'conversation',
      ['auto-learning', 'rag-ingested']
    );
  }
}

export const ragEngine = new RAGEngine();
