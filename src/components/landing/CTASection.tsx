"use client";

import Link from "next/link";
import { cn } from "@/utils/helpers";

interface CTASectionProps {
  variant?: "primary" | "secondary";
}

export default function CTASection({ variant = "primary" }: CTASectionProps) {
  const isPrimary = variant === "primary";

  return (
    <section
      className={cn(
        "relative overflow-hidden py-20 sm:py-28",
        isPrimary ? "bg-transparent" : "bg-gradient-to-b from-black/60 via-[#050515] to-black"
      )}
      id={isPrimary ? undefined : "cta-final"}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute right-0 top-10 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1 text-xs font-semibold text-violet-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI-Powered Career Discovery
        </div>

        <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
            Your career journey starts here
          </span>
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-sm text-white/70 sm:text-base">
          Chat with an AI that understands you. Play games that reveal your strengths. Discover careers that genuinely fit who you are.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/roles"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold shadow-xl shadow-violet-800/40 transition hover:scale-[1.02] hover:from-violet-400 hover:to-fuchsia-400"
          >
            Start Your Journey
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-2.5 text-sm font-medium text-white/80 backdrop-blur-xl transition hover:bg-white/10"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

