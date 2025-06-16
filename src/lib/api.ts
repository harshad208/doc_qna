import { DocumentMetadata, SearchQuery, SearchResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL environment variable");
}

/**
 * Fetches a list of all uploaded documents.
 */
export async function getDocuments(): Promise<DocumentMetadata[]> {
  const response = await fetch(`${API_BASE_URL}/documents/list`);
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

/**
 * Uploads a document file.
 */
export async function uploadDocument(file: File): Promise<DocumentMetadata> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(errorData.detail || "Failed to upload document");
  }
  return response.json();
}

/**
 * Deletes a document by its ID.
 */
export async function deleteDocument(docId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/docs/${docId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}

/**
 * Performs a semantic search and gets an answer from the LLM.
 */
export async function searchQuery(queryData: SearchQuery): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(queryData),
  });

  if (!response.ok) {
    throw new Error("Failed to perform search");
  }
  return response.json();
}


/**
 * Fetches the raw document file for preview.
 * Returns the file data as a Blob.
 */
export async function getDocumentPreview(docId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/documents/preview/${docId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch document preview");
  }

  return response.blob();
}