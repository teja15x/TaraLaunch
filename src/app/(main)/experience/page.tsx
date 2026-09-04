'use client';

import Link from 'next/link';
import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TARA_EXPERIENCES } from '@/data/tara/experiences';

export default function ExperienceIndexPage() {
  return (
    <TaraPageShell
      title="Experience"
      subtitle="EXPERIENCE BEFORE COMMITMENT. Choose one world, make decisions, observe consequences, then reflect."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {TARA_EXPERIENCES.map((experience) => (
          <Card key={experience.id} className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-white/60">{experience.domain}</p>
            <h2 className="text-2xl font-bold text-white">{experience.title}</h2>
            <p className="text-sm text-white/75">{experience.scenario}</p>
            <p className="text-xs text-white/60">Objective: {experience.objective}</p>
            {experience.steps.length ? (
              <Link href={`/experience/${experience.id}`}>
                <Button>Enter world</Button>
              </Link>
            ) : (
              <Button variant="secondary" disabled>Seeded architecture (coming soon)</Button>
            )}
          </Card>
        ))}
      </div>
    </TaraPageShell>
  );
}
