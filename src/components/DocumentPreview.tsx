'use client';

import { useEffect, useState } from "react";
import { DocumentMetadata } from "@/types";
import { getDocumentPreview } from "@/lib/api";
import { FiFile, FiLoader, FiAlertTriangle } from "react-icons/fi";

interface DocumentPreviewProps {
    selectedDoc: DocumentMetadata | null;
}

export default function DocumentPreview({ selectedDoc }: DocumentPreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Cleanup previous URL to prevent memory leaks
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        if (!selectedDoc) {
            return; // Do nothing if no document is selected
        }

        const fetchPreview = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const blob = await getDocumentPreview(selectedDoc.doc_id);
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
            } catch (err) {
                setError("Could not load document preview.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();

        // Final cleanup when the component unmounts or selectedDoc changes
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    // We only want to re-run this when the selected document object itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDoc]);

    return (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-2xl border border-slate-700">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <FiFile />
                    Document Preview
                </h2>
            </div>

            <div className="flex-1 p-2 bg-slate-900/50 rounded-b-lg">
                {isLoading && (
                    <div className="w-full h-full flex flex-col justify-center items-center text-slate-400">
                        <FiLoader className="animate-spin text-3xl mb-2" />
                        <p>Loading preview for {selectedDoc?.filename}...</p>
                    </div>
                )}
                {error && (
                     <div className="w-full h-full flex flex-col justify-center items-center text-red-400">
                        <FiAlertTriangle className="text-3xl mb-2" />
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && previewUrl && (
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-0 rounded"
                        title={`Preview of ${selectedDoc?.filename}`}
                    />
                )}
            </div>
        </div>
    );
}