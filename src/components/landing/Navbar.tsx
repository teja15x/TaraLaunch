"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-b from-black/80 via-black/50 to-transparent backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold shadow-lg shadow-violet-700/30">
            CA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Career Agent</p>
            <p className="text-[11px] text-white/50">AI-Powered Career Discovery</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/chat"
            className="hidden rounded-full px-4 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            Try Agent
          </Link>
          <Link
            href="/roles"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold shadow-lg shadow-violet-700/40 transition hover:scale-[1.02] hover:from-violet-400 hover:to-fuchsia-400"
          >
            Start Journey
          </Link>
        </div>
      </nav>
    </header>
  );
}
