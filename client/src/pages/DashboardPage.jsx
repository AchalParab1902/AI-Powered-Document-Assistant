import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileText, Trash2, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload and manage your PDF documents to ask questions and extract insights with AI.
        </p>
      </div>

      {/* Upload Dropzone Placeholder */}
      <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 bg-white text-center cursor-pointer transition group shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          Upload a PDF Document
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Drag and drop your file here, or click to browse. Max file size: 10MB.
        </p>
        <span className="inline-block mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition">
          Select PDF File
        </span>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Your Uploaded Documents</h2>
          <span className="text-xs text-slate-500">2 Documents Found</span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Document Row 1 */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">Rental_Agreement.pdf</p>
                <p className="text-xs text-slate-400">2.4 MB • 14 pages • Uploaded today</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready
              </span>
              <Link
                to="/chat/rental-agreement"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </Link>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Row 2 */}
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">Employee_Handbook_2026.pdf</p>
                <p className="text-xs text-slate-400">5.1 MB • 32 pages • Uploaded yesterday</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                <Clock className="w-3.5 h-3.5" />
                Processing
              </span>
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
