'use client';

import Link from 'next/link';
import { LogOut, ArrowLeft } from 'lucide-react';

// Note: metadata doesn't work in 'use client' components
// This layout is kept minimal; metadata can be added in a separate non-client layout if needed

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = async () => {
    // Logout logic handled by auth provider
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-950">
      {/* Parent Zone Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-primary-400 transition">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white ml-4">👨‍👩‍👧 Parent Co-Pilot</h1>
            <span className="px-2 py-1 rounded-full bg-primary-600/30 text-primary-200 text-xs font-medium">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/50 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/60 text-xs">
          <p>Parent Co-Pilot • Accountability Partner for Your Child&apos;s Career Journey</p>
          <p>Secure • Private • India-First</p>
        </div>
      </footer>
    </div>
  );
}
