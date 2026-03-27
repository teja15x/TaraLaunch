'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const GAMES_LIBRARY = [
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
  {
    id: 'story-weaver',
    title: 'Story Weaver 📖',
    description: 'Create narratives by making creative choices under constraints.',
    whyPlay: 'Unlocks verbal reasoning and creative problem-solving—critical for law, humanities, and communications roles.',
    skillsBuilt: ['Narrative Thinking', 'Verbal Reasoning', 'Creative Expression'],
    estimatedTime: '9-12 mins',
    difficulty: 'Core',
    careerAligns: ['Lawyer', 'Writer', 'Journalist', 'Diplomat'],
    unlocked: true,
  },
  {
    id: 'rhythm-match',
    title: 'Rhythm Match 🎵',
    description: 'Match patterns in music and rhythm sequences.',
    whyPlay: 'Builds auditory and temporal intelligence—foundation for music production, sound design, and rhythm-based careers.',
    skillsBuilt: ['Auditory Perception', 'Pattern Sequencing', 'Timing'],
    estimatedTime: '7-9 mins',
    difficulty: 'Advanced',
    careerAligns: ['Music Producer', 'Audio Engineer', 'Musician'],
    unlocked: false,
  },
  {
    id: 'debate-club',
    title: 'Debate Club 🎤',
    description: 'Argue both sides of a proposition with evidence-based reasoning.',
    whyPlay: 'Builds persuasion and critical thinking—essential for law, politics, business, and public advocacy.',
    skillsBuilt: ['Argumentation', 'Evidence-Based Thinking', 'Persuasion'],
    estimatedTime: '10-12 mins',
    difficulty: 'Advanced',
    careerAligns: ['Lawyer', 'Politician', 'Business Leader', 'Activist'],
    unlocked: false,
  },
  {
    id: 'creative-canvas',
    title: 'Creative Canvas 🎨',
    description: 'Design visual compositions using color, space, and composition principles.',
    whyPlay: 'Builds spatial and visual reasoning—foundation for design, architecture, and visual arts careers.',
    skillsBuilt: ['Spatial Reasoning', 'Aesthetic Judgment', 'Composition'],
    estimatedTime: '10-15 mins',
    difficulty: 'Advanced',
    careerAligns: ['Designer', 'Architect', 'Artist', 'UX/UI Developer'],
    unlocked: false,
  },
];

export default function GamesPage() {
  const router = useRouter();

  const coreGames = GAMES_LIBRARY.filter((g) => g.difficulty === 'Core');
  const advancedGames = GAMES_LIBRARY.filter((g) => g.difficulty === 'Advanced');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Games Lab</h1>
        <p className="text-white/70 max-w-2xl">
          Each game builds one core skill. Play the core games first (7-10 mins each). They're calibrated for India-first career mapping.
        </p>
      </div>

      {/* Progress */}
      <Card className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-primary-500/40 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider">Your Progress</p>
            <p className="text-2xl font-bold text-white mt-1">2 of 3 core games played</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-white/60">Confidence Boost</p>
              <p className="text-2xl font-bold text-white">+18%</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-primary-400 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-bold text-white">67%</p>
                <p className="text-xs text-white/60">Complete</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Games */}
      <section className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🎮 Core Games (Start Here)</span>
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Foundation skills. All students benefit from these 3. Total: ~25 mins.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {coreGames.map((game, index) => (
            <Card key={game.id} className="border-white/20 hover:border-white/40 transition flex flex-col md:flex-row gap-6 p-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{game.description}</p>
                  </div>
                  <span className="text-2xl">{index + 1}</span>
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
              </div>

              <div className="flex flex-col items-end justify-between min-w-fit">
                <div className="text-right mb-4">
                  <p className="text-2xl font-bold text-white">{game.estimatedTime}</p>
                  <p className="text-xs text-white/60">play time</p>
                </div>
                <Button onClick={() => router.push(`/games/${game.id}`)}>
                  {game.unlocked ? 'Play Now' : 'Unlock Soon'} →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Advanced Games */}
      <section className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚡ Advanced Games (After Core)</span>
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Specialized skills. Play these once core games are done. Unlock by maintaining a 3+ day streak.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {advancedGames.map((game) => (
            <Card key={game.id} className="border-white/20 hover:border-white/40 transition flex flex-col md:flex-row gap-6 p-6 opacity-60">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{game.description}</p>
                  </div>
                  <span className="text-2xl text-white/40">🔒</span>
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
              </div>

              <div className="flex flex-col items-end justify-between min-w-fit">
                <div className="text-right mb-4 text-white/60">
                  <p className="text-2xl font-bold">{game.estimatedTime}</p>
                  <p className="text-xs">play time</p>
                </div>
                <Button disabled>Unlock Soon</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How Scoring Works */}
      <Card className="bg-white/5 border-white/10 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">📊 How Scoring Works</h3>
        <div className="space-y-3 text-sm text-white/80">
          <p>
            <strong className="text-white">Confidence Score:</strong> Each game adds +5-15% depending on your performance. At 50%+ you unlock basic career matches. At 75%+ you unlock premium insights.
          </p>
          <p>
            <strong className="text-white">Streak:</strong> Play daily to build consistency. 7-day streak = eligible for counselor 1:1. 30-day= unlock advanced strategies.
          </p>
          <p>
            <strong className="text-white">Adaptive Routing:</strong> After each game, the system recommends your next move based on your performance and career goal.
          </p>
        </div>
      </Card>

      {/* Next Steps */}
      <div className="text-center space-y-4">
        <p className="text-white/70">Ready to start?</p>
        <Button onClick={() => router.push('/games/pattern-master')} className="px-8 py-3 text-lg">
          Play Pattern Master Now 🎮
        </Button>
        <p className="text-xs text-white/50">~8 mins. Zero pressure. Just explore.</p>
      </div>
    </div>
  );
}
