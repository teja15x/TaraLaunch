'use client';

import Link from 'next/link';
import JourneyScene from '@/components/landing/JourneyScene';
import { Button } from '@/components/ui/Button';

export function TaraOpeningExperience() {
  return (
    <div className="bg-slate-950 text-white">
      <JourneyScene totalScenes={8} />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Personal Navigation Intelligence</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">Tara</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
          Tara does not choose your future for you. Tara helps you understand yourself well enough to choose it.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/talk">
            <Button size="lg">Meet Tara</Button>
          </Link>
          <Link href="/experience">
            <Button variant="secondary" size="lg">Start First Experience</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
