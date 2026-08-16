import { ragEngine } from '../rag/ragEngine';
import { vectorStoreService } from '../rag/vectorStore';

export class RAGTool {
  public name = 'RAGTool';
  public description = 'Search or ingest knowledge into ASTRA in-browser Vector Store Knowledge Base';

  public async search(query: string): Promise<string> {
    const res = await ragEngine.retrieveAndAugment(query);
    if (!res.hasRetrievedKnowledge) {
      return `No matching documents found in ASTRA RAG knowledge store for "${query}", Boss.`;
    }
    return `Boss, ${res.citationSummary}\n\nTop Knowledge Snippet: "${res.searchResults[0]?.snippet || ''}"`;
  }

  public addDocument(title: string, content: string): string {
    const doc = ragEngine.ingestKnowledge(title, content, 'document');
    return `Successfully ingested "${doc.title}" into ASTRA RAG Vector Knowledge Store, Boss. (${vectorStoreService.getAllDocuments().length} total documents indexed).`;
  }
}

export const ragTool = new RAGTool();
