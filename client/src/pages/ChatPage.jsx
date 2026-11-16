import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Bot, User, FileText, Bookmark, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const { documentId } = useParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I have indexed your document. Ask me any question, and I will find the exact answer along with page citations.',
      sources: []
    },
    {
      id: 2,
      role: 'user',
      content: 'What is the required notice period for ending the lease agreement?',
      sources: []
    },
    {
      id: 3,
      role: 'assistant',
      content: 'According to Section 8.2 of the agreement, either party must provide at least 30 days written notice prior to terminating the lease.',
      sources: [
        {
          documentName: 'Rental_Agreement.pdf',
          pageNumber: 4,
          snippet: 'Section 8.2: Either party may terminate with 30 days prior written notice...'
        }
      ]
    }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to mock state
    const userMsg = { id: Date.now(), role: 'user', content: input, sources: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Mock assistant feedback for Phase 3
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'This is a frontend preview. Live AI completions and RAG retrieval will be wired in Phase 10 & 12!',
          sources: [
            {
              documentName: 'Rental_Agreement.pdf',
              pageNumber: 1,
              snippet: 'Document preview initialized.'
            }
          ]
        }
      ]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Chat Top Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            title="Back to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {documentId === 'sample' ? 'Rental_Agreement.pdf' : `${documentId}.pdf`}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">Ready for AI Q&A</p>
            </div>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          RAG Mode
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'
                }`}
              >
                {msg.content}
              </div>

              {/* Source References / Citation Pills */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((src, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs"
                      title={src.snippet}
                    >
                      <Bookmark className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold">{src.documentName}</span>
                      <span className="text-amber-700 font-medium">(Page {src.pageNumber})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input Box */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document (e.g., 'What are the main terms?')..."
            className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white transition disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          AI answers are strictly anchored to document content. Sources are verified automatically.
        </p>
      </form>
    </div>
  );
}
