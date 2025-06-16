export interface DocumentMetadata {
  doc_id: string;
  filename: string;
  content_type: string;
  status: string;
  file_path: string | null;
  extracted_text_preview: string | null;
  num_chunks: number | null;
  embedding_dim: number | null;
  error_message: string | null;
}

export interface SearchQuery {
  query: string;
  doc_id?: string | null;
  top_n?: number;
}

export interface SearchResultItem {
  chunk_id: string;
  document_text: string;
  distance: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  search_results: SearchResultItem[];
  llm_answer: string | null;
}

// For our chat interface state
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}