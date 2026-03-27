"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-white/50 sm:flex-row sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white/80">Career Agent</span>
          <span className="hidden text-white/40 sm:inline">
            – AI-Powered Career Discovery
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="#features" className="hover:text-white/80">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white/80">
            How It Works
          </Link>
          <Link href="/chat" className="hover:text-white/80">
            Try Agent
          </Link>
          <Link href="/roles" className="hover:text-white/80">
            Start Journey
          </Link>
        </div>
        <p className="text-center text-[11px] text-white/40 sm:text-xs">
          Built with ❤️ for Indian students.
        </p>
      </div>
    </footer>
  );
}

