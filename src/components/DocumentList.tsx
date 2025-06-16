'use client';

import { useState } from 'react';
import { DocumentMetadata } from "@/types";
import { FiClock, FiTrash2, FiLoader, FiCheckCircle, FiAlertTriangle, FiXCircle, FiGrid } from "react-icons/fi";
import { clsx } from 'clsx';
import ConfirmationModal from './ConfirmationModal';

interface DocumentListProps {
  documents: DocumentMetadata[];
  isLoading: boolean;
  selectedDocId: string | null;
  onSelectDoc: (docId: string | null) => void;
  onDeleteDoc: (docId: string) => Promise<void>;
}

const StatusIcon = ({ status }: { status: string }) => {
    const lowerCaseStatus = status.toLowerCase();
    if (lowerCaseStatus.includes('fail') || lowerCaseStatus.includes('error')) {
        return <FiAlertTriangle className="text-red-400 flex-shrink-0" title={`Status: ${status}`} />;
    }
    switch (lowerCaseStatus) {
        case 'ready':
            return <FiCheckCircle className="text-green-400 flex-shrink-0" title="Ready for Q&A" />;
        case 'processing': case 'embedding':
            return <FiLoader className="animate-spin text-cyan-400 flex-shrink-0" title="Processing..." />;
        case 'uploaded': default:
            return <FiClock className="text-slate-400 flex-shrink-0" title="Queued for processing" />;
    }
};

export default function DocumentList({ documents, isLoading, selectedDocId, onSelectDoc, onDeleteDoc }: DocumentListProps) {
  const [docToDelete, setDocToDelete] = useState<DocumentMetadata | null>(null);

  const handleConfirmDelete = () => {
    if (docToDelete) {
      onDeleteDoc(docToDelete.doc_id);
    }
    setDocToDelete(null);
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Select a Source for Q&A</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <FiLoader className="animate-spin text-3xl text-slate-500" />
          </div>
        ) : (
          <div className="space-y-2">
               <div
                onClick={() => onSelectDoc(null)}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-slate-700/60",
                  { "bg-teal-900/50 ring-2 ring-cyan-400 shadow-lg text-white": selectedDocId === null }
                )}
              >
                <div className="flex items-center gap-3">
                   <FiGrid />
                  <span className="font-medium text-sm">All Documents</span>
                </div>
                <FiCheckCircle className={clsx("transition-opacity duration-300", selectedDocId === null ? "opacity-100 text-cyan-300" : "opacity-0")} />
              </div>

              <hr className="border-slate-700 my-3"/>

              {documents.map((doc) => {
                const isSelectable = doc.status.toLowerCase() === 'ready';
                const isFailed = doc.status.toLowerCase().includes('fail') || doc.status.toLowerCase().includes('error');
                const isSelected = doc.doc_id === selectedDocId;

                return (
                  // Main row container. flex, items-center, and gap handle the alignment.
                  <div
                    key={doc.doc_id}
                    onClick={() => isSelectable && onSelectDoc(doc.doc_id)}
                    title={isSelectable ? `Query ${doc.filename}` : `Cannot query, status: ${doc.status}`}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      {
                          "cursor-pointer hover:bg-slate-700/60": isSelectable,
                          "cursor-not-allowed bg-slate-800/40 text-slate-500": !isSelectable,
                          "bg-teal-900/50 ring-2 ring-cyan-400 shadow-lg text-white": isSelected
                      }
                    )}
                  >
                    {/* Item 1: Status Icon (fixed width) */}
                    <StatusIcon status={doc.status} />
                    
                    {/* Item 2: Text block that grows to fill all available space */}
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-sm truncate" title={doc.filename}>{doc.filename}</p>
                      {isFailed && doc.error_message && (
                        <p className="text-xs text-red-400 truncate" title={doc.error_message}>
                          {doc.error_message}
                        </p>
                      )}
                    </div>
                    
                    {/* Item 3: Buttons block that never shrinks */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelected && <FiCheckCircle className="text-cyan-300" />}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete document"
                      >
                        <FiXCircle />
                      </button>
                    </div>
                  </div>
                );
              })}
              {documents.length === 0 && !isLoading && (
                  <p className="text-sm text-slate-400 text-center py-4">Upload a document to get started.</p>
              )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to permanently delete the document:
          <strong className="block text-center mt-2 text-cyan-400 break-all">
            {docToDelete?.filename}
          </strong>
        </p>
        <p className="mt-4 text-sm text-slate-400">
          This action cannot be undone. All associated data and embeddings will be removed.
        </p>
      </ConfirmationModal>
    </>
  );
}