'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function GamesPage() {
  const router = useRouter();

  const coreGames = [
    {
      id: 'pattern-master',
      title: 'Pattern Master 🧩',
      description: 'Spot logical patterns and solve increasingly complex puzzles.',
      whyPlay: 'Foundation for analytical thinking—builds career readiness in tech, engineering, and research.',
      skillsBuilt: ['Logical Inference', 'Problem Decomposition', 'Pattern Recognition'],
      estimatedTime: '8-10 mins',
      difficulty: 'Core',
      careerAligns: ['Programmer', 'Data Analyst', 'Engineer', 'Researcher'],
      unlocked: true,
    },
    {
      id: 'scenario-quest',
      title: 'Scenario Quest 🌍',
      description: 'Navigate real career decisions: board vs. stream, parent pressure, competition vs. profile.',
      whyPlay: 'India-first branching scenarios. Explore what YOU actually want, not what others expect.',
      skillsBuilt: ['Self-Awareness', 'Decision-Making', 'Conflict Resolution'],
      estimatedTime: '6-8 mins',
      difficulty: 'Core',
      careerAligns: ['All Paths'],
      unlocked: true,
    },
  ];

  const advancedGames = [
    {
      id: 'story-weaver',
      title: 'Story Weaver 📖',
      description: 'Create narratives by making creative choices under constraints.',
      estimatedTime: '9-12 mins',
      unlocked: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Games Lab</h1>
        <p className="text-white/70 max-w-2xl">
          Each game builds one core skill. Play the core games first (7-10 mins each). They're calibrated for India-first career mapping.
        </p>
      </div>

      {/* Core Games */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-white">🎮 Core Games (Start Here)</h2>

        <div className="grid grid-cols-1 gap-4">
          {coreGames.map((game) => (
            <Card key={game.id} className="border-white/20 hover:border-white/40 transition p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{game.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{game.description}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-3 mb-4">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Why This Game?</p>
                <p className="text-sm text-white/85">{game.whyPlay}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Skills</p>
                  <div className="space-y-1">
                    {game.skillsBuilt.map((skill) => (
                      <p key={skill} className="text-xs text-white/80 flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> {skill}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Aligns With</p>
                  <div className="space-y-1">
                    {game.careerAligns.slice(0, 3).map((career) => (
                      <p key={career} className="text-xs text-primary-300">
                        {career}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{game.estimatedTime}</p>
                </div>
                <Button onClick={() => router.push(`/games/${game.id}`)}>
                  Play Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Advanced Games */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-white">⚡ Advanced Games (After Core)</h2>

        <div className="grid grid-cols-1 gap-4">
          {advancedGames.map((game) => (
            <Card key={game.id} className="border-white/20 opacity-60 p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{game.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{game.description}</p>
                </div>
              </div>

              <div className="flex items-end justify-between mt-4">
                <p className="text-2xl font-bold text-white">{game.estimatedTime}</p>
                <Button disabled>Unlock Soon</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <div className="text-center space-y-4">
        <p className="text-white/70">Ready to start?</p>
        <Button onClick={() => router.push('/games/pattern-master')} className="px-8 py-3 text-lg">
          Play Pattern Master Now
        </Button>
      </div>
    </div>
  );
}
