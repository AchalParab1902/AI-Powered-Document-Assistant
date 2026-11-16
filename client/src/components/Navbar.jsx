import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Bot, User, LogIn } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 text-indigo-600 hover:text-indigo-700 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">DocuMind</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold uppercase tracking-wider">
              AI
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname === '/' || location.pathname === '/dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/chat/sample"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname.startsWith('/chat')
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Chat Preview
          </Link>
        </nav>

        {/* Right Auth Links */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <User className="w-4 h-4" />
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
