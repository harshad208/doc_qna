'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { uploadDocument } from '@/lib/api';
import { FiUploadCloud, FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

type Status = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Uploading document...');

    try {
      await uploadDocument(file);
      setStatus('success');
      setMessage(`Successfully uploaded ${file.name}! It is now being processed.`);
      onUploadSuccess();
      setFile(null);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const statusIcons = {
    uploading: <FiLoader className="animate-spin" />,
    success: <FiCheckCircle className="text-green-400" />,
    error: <FiXCircle className="text-red-400" />,
    idle: <FiUploadCloud />,
  }

  return (
    <div className="p-4 border-b border-slate-700">
      <h2 className="text-lg font-semibold mb-2 text-slate-100">Upload a Document</h2>
      <p className="text-sm text-slate-400 mb-4">Supports .pdf, .docx, .txt</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300">
            Select file
          </label>
          <div className="mt-1">
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all"
        >
          {statusIcons[status]}
          {status === 'uploading' ? 'Uploading...' : 'Upload & Process'}
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm text-center ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
          {message}
        </p>
      )}
    </div>
  );
}