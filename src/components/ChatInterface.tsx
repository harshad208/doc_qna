'use client';

import { useState, FormEvent, useRef, useEffect } from "react";
import { ChatMessage, DocumentMetadata } from "@/types";
import { searchQuery } from "@/lib/api";
import { FiSend, FiUser, FiCpu, FiLoader, FiX, FiMessageSquare } from "react-icons/fi";

interface ChatInterfaceProps {
  selectedDoc: DocumentMetadata | null;
  onClearSelection: () => void;
}

export default function ChatInterface({ selectedDoc, onClearSelection }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [selectedDoc]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await searchQuery({ query: input, doc_id: selectedDoc?.doc_id || null });
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.llm_answer || "I found some information but couldn't generate a summary."
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-2xl border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Document Q&A</h2>
          {selectedDoc ? (
            <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-300 bg-teal-900/60 px-2 py-1 rounded">
                    Querying: <span className="font-semibold text-cyan-300">{selectedDoc.filename}</span>
                </p>
                <button onClick={onClearSelection} title="Query all documents" className="p-1 rounded-full text-slate-400 hover:bg-slate-600 transition-colors">
                    <FiX />
                </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Querying all available documents</p>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <FiMessageSquare className="text-6xl mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Ready to Answer</h3>
                <p>Select a source and ask a question below.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="p-2.5 bg-teal-600 rounded-full flex-shrink-0 shadow-lg"><FiCpu /></div>}
            <div
              className={`max-w-xl p-3 rounded-lg text-white/95 whitespace-pre-wrap shadow-md ${msg.role === 'user' ? 'bg-sky-800' : 'bg-slate-700'}`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && <div className="p-2.5 bg-slate-600 rounded-full flex-shrink-0 shadow-lg"><FiUser /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="p-2.5 bg-teal-600 rounded-full flex-shrink-0 shadow-lg"><FiLoader className="animate-spin"/></div>
             <div className="max-w-xl p-3 rounded-lg bg-slate-700 text-slate-300 shadow-md">
                Thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800/80 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedDoc ? "Ask about this document..." : "Ask about all documents..."}
            className="flex-1 p-3 bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}