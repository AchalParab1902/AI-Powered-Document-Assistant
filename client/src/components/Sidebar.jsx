import React from 'react';
import { NavLink } from 'react-router-dom';
import { Files, MessageSquare, PlusCircle, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] p-4">
      {/* Action CTA */}
      <div className="mb-6">
        <NavLink
          to="/dashboard"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload PDF</span>
        </NavLink>
      </div>

      {/* Main Nav Items */}
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Navigation
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <Files className="w-4 h-4" />
          <span>Documents</span>
        </NavLink>

        <NavLink
          to="/chat/sample"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`
          }
        >
          <MessageSquare className="w-4 h-4" />
          <span>Active Chat</span>
        </NavLink>
      </div>

      {/* Recent History Placeholder */}
      <div className="mt-8 flex-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Recent Documents
        </p>
        <div className="space-y-1">
          <div className="px-3 py-2 rounded-lg text-xs text-slate-500 bg-slate-50 border border-slate-100">
            <p className="font-medium text-slate-700 truncate">Rental_Agreement.pdf</p>
            <span className="text-[10px] text-emerald-600">Ready</span>
          </div>
          <div className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 cursor-pointer transition">
            <p className="font-medium text-slate-600 truncate">Employment_Contract.pdf</p>
            <span className="text-[10px] text-emerald-600">Ready</span>
          </div>
        </div>
      </div>

      {/* Footer info card */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>v1.0 Foundations</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">Phase 3</span>
      </div>
    </aside>
  );
}
