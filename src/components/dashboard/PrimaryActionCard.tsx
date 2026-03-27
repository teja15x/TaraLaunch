'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface PrimaryActionProps {
  gameTitle: string;
  gameId: string;
  description: string;
  skillsBuilt: string[];
  careerRelevance: string;
  estimatedTime: string;
}

export function PrimaryActionCard({
  gameTitle,
  gameId,
  description,
  skillsBuilt,
  careerRelevance,
  estimatedTime,
}: PrimaryActionProps) {
  const router = useRouter();

  return (
    <Card className="bg-gradient-to-br from-primary-700/40 to-accent-700/40 border-primary-600/60 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-primary-200 mb-2">🎮 Recommended Next</p>
          <h2 className="text-2xl font-bold text-white">{gameTitle}</h2>
          <p className="text-white/70 mt-2 max-w-3xl">{description}</p>
        </div>
        <div className="text-right text-sm text-white/60">
          <p>⏱️ {estimatedTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/10 border border-white/20 p-3">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Skills You'll Build</p>
          <div className="space-y-1">
            {skillsBuilt.map((skill) => (
              <p key={skill} className="text-sm text-white/85 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {skill}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white/10 border border-white/20 p-3">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Career Impact</p>
          <p className="text-sm text-white/85">{careerRelevance}</p>
        </div>
      </div>

      <Button
        onClick={() => router.push(`/games/${gameId}`)}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3"
      >
        Start Game Now
      </Button>
    </Card>
  );
}
