'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { DocumentMetadata } from "@/types";
import * as api from "@/lib/api";
import UploadForm from "@/components/UploadForm";
import DocumentList from "@/components/DocumentList";
import ChatInterface from "@/components/ChatInterface";
import DocumentPreview from "@/components/DocumentPreview";
import { FiGithub } from "react-icons/fi";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setError(null);
      setIsLoadingDocs(true);
      const docs = await api.getDocuments();
      const sortedDocs = docs.sort((a, b) => {
        if (a.status === 'ready' && b.status !== 'ready') return -1;
        if (a.status !== 'ready' && b.status === 'ready') return 1;
        return 0;
      });
      setDocuments(sortedDocs);
    } catch (err) {
      setError("Failed to fetch documents. Make sure the backend is running.");
      console.error(err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    const hasProcessingDocs = documents.some(doc => doc.status !== 'ready' && doc.status.toLowerCase().indexOf('fail') === -1);
    if (hasProcessingDocs) {
      const interval = setInterval(() => {
        fetchDocuments();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [documents, fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  const selectedDoc = useMemo(
    () => documents.find(doc => doc.doc_id === selectedDocId) || null,
    [documents, selectedDocId]
  );

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.doc_id !== docId));
      if (selectedDocId === docId) {
        setSelectedDocId(null);
      }
    } catch (err) {
      alert("Failed to delete document.");
      console.error(err);
    }
  };
  
  const handleClearSelection = () => {
      setSelectedDocId(null);
  }

  return (
    // CHANGE #1: Use a 4-column grid instead of 3
    <main className="grid grid-cols-1 lg:grid-cols-4 h-screen bg-slate-900 text-white font-sans">
      {/* Left Sidebar (still takes 1 column) */}
      <div className="col-span-1 flex flex-col bg-slate-800/50 border-r border-slate-700">
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <div className="flex-1 overflow-y-auto">
          {error && <p className="p-4 text-red-400 bg-red-900/50">{error}</p>}
          <DocumentList
            documents={documents}
            isLoading={isLoadingDocs}
            selectedDocId={selectedDocId}
            onSelectDoc={setSelectedDocId}
            onDeleteDoc={handleDeleteDoc}
          />
        </div>
        <footer className="p-4 text-xs text-slate-500 border-t border-slate-700 flex items-center justify-between">
            <p>Doc Q&A Interface</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                <FiGithub size={16} />
            </a>
        </footer>
      </div>

      {/* Main Content Area */}
      {/* CHANGE #2: This now takes 3 columns instead of 2 */}
      <div className="col-span-1 lg:col-span-3 p-4 h-screen max-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            
            {selectedDoc ? (
                <>
                    {/* Column 2: Chat Interface */}
                    <div className="h-full max-h-full">
                        <ChatInterface selectedDoc={selectedDoc} onClearSelection={handleClearSelection} />
                    </div>
                    {/* Column 1: Document Preview */}
                    <div className="h-full max-h-full">
                        <DocumentPreview selectedDoc={selectedDoc} />
                    </div>                    
                </>
            ) : (
                /* Full-width Chat when no doc is selected */
                <div className="lg:col-span-2 h-full max-h-full">
                    <ChatInterface selectedDoc={selectedDoc} onClearSelection={handleClearSelection} />
                </div>
            )}

        </div>
      </div>
    </main>
  );
}