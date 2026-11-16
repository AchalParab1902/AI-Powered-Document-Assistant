import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <div className="flex-1 flex w-full">
        {!isAuthPage && <Sidebar />}
        <main className={`flex-1 ${!isAuthPage ? 'p-6 lg:p-8' : 'flex items-center justify-center p-4'}`}>
          <div className={`${!isAuthPage ? 'max-w-6xl mx-auto' : 'w-full'}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
