'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { TraitScores } from '@/types';

interface CareerCardProps {
  career: {
    title: string;
    category: string;
    description: string;
    salary_range: string;
    growth_outlook: 'high' | 'medium' | 'low';
    required_skills: string[];
    education: string;
    education_path?: string[];
    required_traits: Partial<TraitScores>;
  };
  score: number;
  riasecScore: number;
  gardnerScore: number;
  traitScore: number;
  traitScores: TraitScores;
}

const growthColors: Record<string, string> = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' };
const growthLabels: Record<string, string> = { high: '📈 High Growth', medium: '📊 Moderate Growth', low: '📉 Low Growth' };

export function CareerCard({ career, score, riasecScore, gardnerScore, traitScore, traitScores }: CareerCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary-600/10 to-accent-600/10 border-primary-500/20">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-white">{career.title}</h3>
            <span className="px-2 py-1 bg-primary-600/30 rounded-lg text-primary-300 text-xs">{career.category}</span>
          </div>
          <p className="text-white/70 mb-4">{career.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-white/50 text-xs block mb-1">Salary Range (India)</span>
              <span className="text-white font-semibold text-sm">{career.salary_range}</span>
            </div>
            <div>
              <span className="text-white/50 text-xs block mb-1">Growth Outlook</span>
              <span className={`font-semibold text-sm ${growthColors[career.growth_outlook]}`}>
                {growthLabels[career.growth_outlook]}
              </span>
            </div>
            <div>
              <span className="text-white/50 text-xs block mb-1">Education Path</span>
              <span className="text-white/80 text-sm">{career.education}</span>
            </div>
            <div>
              <span className="text-white/50 text-xs block mb-1">Overall Match</span>
              <span className="text-white font-bold text-lg">{score}%</span>
            </div>
          </div>

          {/* Match Breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-primary-400 font-bold">{riasecScore}%</div>
              <div className="text-white/50 text-xs">RIASEC</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-accent-400 font-bold">{gardnerScore}%</div>
              <div className="text-white/50 text-xs">Gardner MI</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <div className="text-emerald-400 font-bold">{traitScore}%</div>
              <div className="text-white/50 text-xs">Traits</div>
            </div>
          </div>

          <div>
            <span className="text-white/50 text-xs block mb-2">Key Skills</span>
            <div className="flex flex-wrap gap-2">
              {career.required_skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs">{skill}</span>
              ))}
            </div>
          </div>

          {career.education_path && career.education_path.length > 1 && (
            <div className="mt-4">
              <span className="text-white/50 text-xs block mb-2">All Education Paths</span>
              <div className="space-y-1">
                {career.education_path.map((path, i) => (
                  <div key={i} className="text-white/70 text-sm flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:w-64">
          <span className="text-white/50 text-xs block mb-3">Trait Alignment</span>
          <div className="space-y-2">
            {Object.entries(career.required_traits).map(([trait, required]) => {
              const userVal = traitScores[trait as keyof TraitScores] || 0;
              const alignment = Math.max(0, 100 - Math.abs(userVal - (required as number)) * 1.5);
              return (
                <ProgressBar
                  key={trait}
                  label={trait.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={Math.round(alignment)}
                  color={alignment >= 70 ? 'bg-emerald-500' : alignment >= 50 ? 'bg-amber-500' : 'bg-red-500'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
