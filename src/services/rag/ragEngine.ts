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
    const searchResults = vectorStoreService.searchSimilar(query, 3, 0.08);

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
      `[Source: "${r.document.title}" (Score: ${r.score})]\n${r.document.content}`
    ).join('\n\n');

    const contextPromptBlock = `[RETRIEVED RAG KNOWLEDGE BASE CONTEXT]
${docSnippets}

${memorySnippets.length > 0 ? `[PERSISTENT USER MEMORIES]:\n${memorySnippets.join('\n')}` : ''}
Use the above authoritative retrieved knowledge to answer the user accurately, Boss.`;

    const citationSummary = searchResults.length > 0
      ? `Retrieved ${searchResults.length} RAG Knowledge Source${searchResults.length > 1 ? 's' : ''}: ${searchResults.map(s => `"${s.document.title}" (${Math.round(s.score * 100)}% relevance)`).join(', ')}`
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
  public ingestKnowledge(title: string, content: string, category: 'document' | 'code' | 'note' | 'web_knowledge' = 'document') {
    return vectorStoreService.addDocument(title, content, category);
  }
}

export const ragEngine = new RAGEngine();
