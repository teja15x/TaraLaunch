'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import { createClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import { calculateRiasec, getHollandCode, RIASEC_LABELS } from '@/lib/career-engine/riasec';
import { calculateGardner, getTopIntelligences, GARDNER_LABELS } from '@/lib/career-engine/gardner';
import { matchCareersAdvanced } from '@/lib/career-engine/matcher';
import { careerDatabase } from '@/data/careers';
import { buildCareerFitReasons } from '@/lib/guidance';
import type { TraitScores, RiasecScores, GardnerScores } from '@/types';

const traitLabels: Record<keyof TraitScores, { label: string; color: string }> = {
  analytical: { label: 'Analytical', color: 'bg-blue-500' },
  creative: { label: 'Creative', color: 'bg-pink-500' },
  leadership: { label: 'Leadership', color: 'bg-amber-500' },
  empathy: { label: 'Empathy', color: 'bg-emerald-500' },
  technical: { label: 'Technical', color: 'bg-cyan-500' },
  communication: { label: 'Communication', color: 'bg-violet-500' },
  adaptability: { label: 'Adaptability', color: 'bg-orange-500' },
  detail_oriented: { label: 'Detail Oriented', color: 'bg-teal-500' },
};

const growthColors: Record<string, string> = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' };
const growthLabels: Record<string, string> = { high: '📈 High Growth', medium: '📊 Moderate Growth', low: '📉 Low Growth' };

type Tab = 'overview' | 'riasec' | 'gardner' | 'careers';

interface AdvancedMatch {
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
  topAlignedTraits: string[];
  topAlignedIntelligences: string[];
  alignment: Record<string, number>;
}

type MentalityState = 'fragile' | 'neutral' | 'strong';

interface EvidenceQuality {
  chatTurns: number;
  completedGames: number;
  assessmentProgress: number;
  reliabilityScore: number;
  mentality: MentalityState;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferMentalityFromMessages(messages: string[]): MentalityState {
  const corpus = messages.join(' ').toLowerCase();
  const fragileKeywords = ['stress', 'anxious', 'confused', 'panic', 'fear', 'pressure', 'lost', 'overwhelmed'];
  const strongKeywords = ['plan', 'consistent', 'completed', 'discipline', 'focus', 'improving', 'confident'];

  const fragileHits = fragileKeywords.reduce((sum, key) => sum + (corpus.includes(key) ? 1 : 0), 0);
  const strongHits = strongKeywords.reduce((sum, key) => sum + (corpus.includes(key) ? 1 : 0), 0);

  if (fragileHits >= strongHits + 2) return 'fragile';
  if (strongHits >= fragileHits + 2) return 'strong';
  return 'neutral';
}

function computeReliability(chatTurns: number, completedGames: number, assessmentProgress: number) {
  const chatComponent = Math.min(chatTurns, 12) / 12; // 40%
  const gameComponent = Math.min(completedGames, 5) / 5; // 35%
  const progressComponent = Math.min(Math.max(assessmentProgress, 0), 100) / 100; // 25%
  return clampScore(chatComponent * 40 + gameComponent * 35 + progressComponent * 25);
}

function calibrateScoreWithEvidence(rawScore: number, reliabilityScore: number) {
  const factor = 0.45 + (reliabilityScore / 100) * 0.55;
  return clampScore(50 + (rawScore - 50) * factor);
}

export default function ResultsPage() {
  const { traitScores, chatMessages } = useAppStore();
  const [matches, setMatches] = useState<AdvancedMatch[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<AdvancedMatch | null>(null);
  const [riasec, setRiasec] = useState<RiasecScores | null>(null);
  const [gardner, setGardner] = useState<GardnerScores | null>(null);
  const [hollandCode, setHollandCode] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [evidence, setEvidence] = useState<EvidenceQuality>({
    chatTurns: chatMessages.filter((m) => m.role === 'user').length,
    completedGames: 0,
    assessmentProgress: 0,
    reliabilityScore: 0,
    mentality: 'neutral',
  });
  const router = useRouter();

  useEffect(() => {
    const loadEvidence = async () => {
      const fallbackUserTexts = chatMessages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .slice(-20);

      const fallbackTurns = fallbackUserTexts.length;
      const fallbackMentality = inferMentalityFromMessages(fallbackUserTexts);

      if (!hasSupabaseBrowserConfig()) {
        setEvidence({
          chatTurns: fallbackTurns,
          completedGames: 0,
          assessmentProgress: 0,
          reliabilityScore: computeReliability(fallbackTurns, 0, 0),
          mentality: fallbackMentality,
        });
        return;
      }

      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          setEvidence({
            chatTurns: fallbackTurns,
            completedGames: 0,
            assessmentProgress: 0,
            reliabilityScore: computeReliability(fallbackTurns, 0, 0),
            mentality: fallbackMentality,
          });
          return;
        }

        const [{ count: userTurnCount }, { data: assessmentProfile }, { data: recentUserMessages }] = await Promise.all([
          supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('role', 'user'),
          supabase
            .from('assessment_profiles')
            .select('completed_games, assessment_progress')
            .eq('user_id', userId)
            .single(),
          supabase
            .from('chat_messages')
            .select('content')
            .eq('user_id', userId)
            .eq('role', 'user')
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

        const chatTurns = userTurnCount ?? fallbackTurns;
        const completedGames = assessmentProfile?.completed_games?.length ?? 0;
        const assessmentProgress = Number(assessmentProfile?.assessment_progress ?? 0);
        const mentality = inferMentalityFromMessages((recentUserMessages ?? []).map((m) => m.content));

        setEvidence({
          chatTurns,
          completedGames,
          assessmentProgress,
          reliabilityScore: computeReliability(chatTurns, completedGames, assessmentProgress),
          mentality,
        });
      } catch {
        setEvidence({
          chatTurns: fallbackTurns,
          completedGames: 0,
          assessmentProgress: 0,
          reliabilityScore: computeReliability(fallbackTurns, 0, 0),
          mentality: fallbackMentality,
        });
      }
    };

    loadEvidence();
  }, [chatMessages]);

  useEffect(() => {
    if (traitScores) {
      // Calculate psychometric profiles
      const riasecScores = calculateRiasec(traitScores);
      const gardnerScores = calculateGardner(traitScores);
      setRiasec(riasecScores);
      setGardner(gardnerScores);
      setHollandCode(getHollandCode(riasecScores));

      // Advanced career matching
      const advancedResults = matchCareersAdvanced(traitScores, careerDatabase).slice(0, 10);
      const formatted: AdvancedMatch[] = advancedResults.map(m => ({
        career: {
          title: m.career.title,
          category: m.career.category,
          description: m.career.description,
          salary_range: m.career.salary_range_inr,
          growth_outlook: m.career.growth_outlook,
          required_skills: m.career.required_skills,
          education: m.career.education_path[0],
          education_path: m.career.education_path,
          required_traits: m.career.required_traits,
        },
        score: calibrateScoreWithEvidence(m.overallScore, evidence.reliabilityScore),
        riasecScore: m.riasecScore,
        gardnerScore: m.gardnerScore,
        traitScore: m.traitScore,
        topAlignedTraits: m.topAlignedTraits,
        topAlignedIntelligences: m.topAlignedIntelligences,
        alignment: Object.fromEntries(
          m.topAlignedTraits.map(t => [t, traitScores[t as keyof TraitScores] || 0])
        ),
      }));
      setMatches(formatted);
      if (formatted.length > 0) setSelectedCareer(formatted[0]);
    }
  }, [traitScores, evidence.reliabilityScore]);

  if (!traitScores) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
        <Card className="max-w-md px-8 py-12 text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display mb-2 text-3xl text-white">No Results Yet</h2>
          <p className="mb-6 text-white/75">Chat with Career Buddy and play the assessment games to see your career matches.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/chat')}>Chat with Career Buddy</Button>
            <Button variant="secondary" onClick={() => router.push('/games')}>Play Games</Button>
          </div>
        </Card>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'riasec', label: 'RIASEC Profile', emoji: '🎯' },
    { id: 'gardner', label: 'Intelligences', emoji: '🧠' },
    { id: 'careers', label: 'Career Matches', emoji: '💼' },
  ];

  const explainabilityReasons = selectedCareer
    ? buildCareerFitReasons(
        selectedCareer.career.title,
        selectedCareer.career.required_traits,
        traitScores,
        selectedCareer.career.education,
        selectedCareer.career.required_skills
      )
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="surface-panel glow-top animate-rise rounded-[1.7rem] p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Result Studio</p>
        <h1 className="font-display mt-2 text-4xl text-white">Your Career Profile</h1>
        <p className="mt-2 text-white/75">Multi-dimensional analysis based on RIASEC, Gardner MI, and personality traits</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Chat turns: {evidence.chatTurns}</div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Games: {evidence.completedGames}</div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Progress: {evidence.assessmentProgress}%</div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Mentality: {evidence.mentality}</div>
        </div>
        {evidence.reliabilityScore < 65 && (
          <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            Provisional prediction: evidence is still shallow. Complete more game rounds and continue guided chat before treating this as final path guidance.
          </div>
        )}

        {/* Confidence Gate: Retest or Unlock Progress */}
        {evidence.reliabilityScore < 75 && (
          <div className="mt-4 rounded-lg border border-blue-400/40 bg-blue-500/15 p-4">
            <p className="text-sm font-semibold text-blue-100 mb-3">Unlock Refined Predictions</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-100">Confidence Progress</span>
                <span className="text-blue-300 font-mono">{Math.round(evidence.reliabilityScore)} / 75</span>
              </div>
              <div className="h-2 rounded-full bg-blue-900/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min((evidence.reliabilityScore / 75) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-200 mt-2">
                {75 - Math.round(evidence.reliabilityScore) <= 0
                  ? '✅ Complete! Your predictions are now highly confident.'
                  : `${75 - Math.round(evidence.reliabilityScore)} points away from confident predictions.`}
              </p>
            </div>
            <button
              onClick={() => alert('Retest feature: Redirect to next recommended game or retake chat')}
              className="mt-3 w-full rounded-lg bg-blue-500 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-600 transition"
            >
              Continue to Refine Predictions
            </button>
          </div>
        )}

        {/* Gating: If confidence too low, show locked matches */}
        {evidence.reliabilityScore < 50 && (
          <div className="mt-4 rounded-lg border border-gray-500/40 bg-gray-600/15 p-4 text-center">
            <p className="text-sm text-gray-200 font-semibold">🔒 Career Matches Locked</p>
            <p className="text-xs text-gray-300 mt-1">
              Complete more assessments to unlock personalized career recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="surface-panel-soft animate-rise stagger-1 flex gap-2 overflow-x-auto rounded-2xl p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`interactive-card rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-orange-400 text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.32)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Holland Code Badge */}
          {hollandCode && (
            <Card className="bg-gradient-to-r from-primary-500/20 via-orange-300/10 to-accent-500/20 animate-rise stagger-1">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary-400 tracking-wider">{hollandCode}</div>
                <div>
                  <h3 className="text-white font-semibold">Your Holland Code</h3>
                  <p className="text-white/60 text-sm">Your top 3 RIASEC interest areas combined</p>
                </div>
              </div>
            </Card>
          )}

          {/* Personality Traits */}
          <Card className="animate-rise stagger-2">
            <h2 className="text-xl font-semibold text-white mb-4">Personality Traits</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(traitLabels) as (keyof TraitScores)[]).map((key) => (
                <div key={key} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={traitLabels[key].color.replace('bg-', 'text-')} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray={`${traitScores[key]}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{traitScores[key]}</span>
                  </div>
                  <span className="text-white/70 text-xs">{traitLabels[key].label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top 3 Career Matches Preview */}
          <Card className="animate-rise stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Top Career Matches</h2>
              <button onClick={() => setActiveTab('careers')} className="text-primary-400 text-sm hover:text-primary-300">
                View all →
              </button>
            </div>
            {evidence.reliabilityScore < 50 ? (
              <div className="rounded-lg border border-gray-500/40 bg-gray-600/15 p-6 text-center">
                <p className="text-sm text-gray-200 font-semibold mb-2">🔒 Career Matches Locked</p>
                <p className="text-xs text-gray-300">
                  Your evidence is still building. Complete more games and chat to unlock personalized matches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {matches.slice(0, 3).map((match, idx) => (
                  <Card key={match.career.title} hover onClick={() => { setSelectedCareer(match); setActiveTab('careers'); }} className="interactive-card">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400 mb-1">#{idx + 1}</div>
                      <h3 className="text-white font-semibold text-sm mb-1">{match.career.title}</h3>
                      <div className="text-2xl font-bold text-white">{match.score}%</div>
                      <span className="text-white/50 text-xs">match</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* RIASEC TAB */}
      {activeTab === 'riasec' && riasec && (
        <>
          <Card className="animate-rise stagger-2">
            <h2 className="text-xl font-semibold text-white mb-2">RIASEC Interest Profile</h2>
            <p className="text-white/50 text-sm mb-6">Holland&apos;s 6 occupational interest types — your career personality</p>
            <div className="space-y-4">
              {(Object.keys(riasec) as (keyof RiasecScores)[]).map((key) => {
                const info = RIASEC_LABELS[key];
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{info.emoji}</span>
                      <span className="text-white font-medium text-sm">{info.label}</span>
                      <span className="text-white/40 text-xs ml-auto">{riasec[key]}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-white/10">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-500"
                        style={{ width: `${riasec[key]}%` }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-1">{info.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-primary-500/15 to-accent-500/15 animate-rise stagger-3">
            <h3 className="text-white font-semibold mb-2">Your Holland Code: <span className="text-primary-400 text-xl">{hollandCode}</span></h3>
            <p className="text-white/60 text-sm">
              This 3-letter code represents your dominant interest areas. People with similar codes
              tend to thrive in similar career environments. Use this as a guide, not a limitation!
            </p>
          </Card>
        </>
      )}

      {/* GARDNER TAB */}
      {activeTab === 'gardner' && gardner && (
        <>
          <Card className="animate-rise stagger-2">
            <h2 className="text-xl font-semibold text-white mb-2">Multiple Intelligences Profile</h2>
            <p className="text-white/50 text-sm mb-6">Gardner&apos;s 8 types of intelligence — everyone is smart in different ways</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(gardner) as (keyof GardnerScores)[]).map((key) => {
                const info = GARDNER_LABELS[key];
                return (
                  <div key={key} className="surface-panel-soft interactive-card flex items-start gap-3 rounded-xl p-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{info.label}</span>
                        <span className="text-primary-400 font-bold text-sm">{gardner[key]}%</span>
                      </div>
                      <div className="mb-1 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-500"
                          style={{ width: `${gardner[key]}%` }}
                        />
                      </div>
                      <p className="text-white/40 text-xs">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Intelligences Highlight */}
          <Card className="bg-gradient-to-r from-primary-500/15 to-accent-500/15 animate-rise stagger-3">
            <h3 className="text-white font-semibold mb-3">Your Top Intelligences</h3>
            <div className="flex flex-wrap gap-3">
              {getTopIntelligences(gardner).map(({ key, label, score }) => (
                <div key={key} className="rounded-lg border border-primary-300/30 bg-primary-500/20 px-4 py-2">
                  <span className="text-lg mr-2">{GARDNER_LABELS[key].emoji}</span>
                  <span className="text-white font-medium">{label}</span>
                  <span className="text-primary-400 ml-2 font-bold">{score}%</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* CAREERS TAB */}
      {activeTab === 'careers' && (
        <>
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Top Career Matches</h2>
            {evidence.reliabilityScore < 50 ? (
              <Card className="rounded-lg border border-gray-500/40 bg-gray-600/15 p-6 text-center">
                <p className="text-sm text-gray-200 font-semibold mb-2">🔒 Full Career List Locked</p>
                <p className="text-xs text-gray-300 mb-4">
                  Your confidence level (${Math.round(evidence.reliabilityScore)}/100) is still building. 
                  Complete more games and guided chat to unlock the full career exploration.
                </p>
                <button
                  onClick={() => alert('Redirect to next game or chat')}
                  className="inline-block rounded-lg bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600 transition"
                >
                  Continue Building Your Profile
                </button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {matches.slice(0, 10).map((match, idx) => (
                  <Card
                    key={match.career.title}
                    hover
                    onClick={() => setSelectedCareer(match)}
                    className={`interactive-card ${selectedCareer?.career.title === match.career.title ? 'border-primary-300/60 bg-primary-500/20' : ''}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-400 mb-1">#{idx + 1}</div>
                    <h3 className="text-white font-semibold text-xs mb-1">{match.career.title}</h3>
                    <div className="text-xl font-bold text-white">{match.score}%</div>
                    <span className="text-white/50 text-xs">match</span>
                  </div>
                </Card>
              ))}
            </div>
            )}
          </div>

          {selectedCareer && (
            <Card className="bg-gradient-to-br from-primary-500/15 to-accent-500/15 animate-rise stagger-1">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-white">{selectedCareer.career.title}</h3>
                    <span className="rounded-lg bg-primary-500/30 px-2 py-1 text-xs text-primary-100">{selectedCareer.career.category}</span>
                  </div>
                  <p className="text-white/70 mb-4">{selectedCareer.career.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-white/50 text-xs block mb-1">Salary Range (India)</span>
                      <span className="text-white font-semibold text-sm">{selectedCareer.career.salary_range}</span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs block mb-1">Growth Outlook</span>
                      <span className={`font-semibold text-sm ${growthColors[selectedCareer.career.growth_outlook]}`}>
                        {growthLabels[selectedCareer.career.growth_outlook]}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs block mb-1">Education Path</span>
                      <span className="text-white/80 text-sm">{selectedCareer.career.education}</span>
                    </div>
                    <div>
                      <span className="text-white/50 text-xs block mb-1">Overall Match</span>
                      <span className="text-white font-bold text-lg">{selectedCareer.score}%</span>
                    </div>
                  </div>

                  {/* Match Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="surface-panel-soft interactive-card rounded-lg p-2 text-center">
                      <div className="text-primary-400 font-bold">{selectedCareer.riasecScore}%</div>
                      <div className="text-white/50 text-xs">RIASEC</div>
                    </div>
                    <div className="surface-panel-soft interactive-card rounded-lg p-2 text-center">
                      <div className="text-accent-400 font-bold">{selectedCareer.gardnerScore}%</div>
                      <div className="text-white/50 text-xs">Gardner MI</div>
                    </div>
                    <div className="surface-panel-soft interactive-card rounded-lg p-2 text-center">
                      <div className="text-emerald-400 font-bold">{selectedCareer.traitScore}%</div>
                      <div className="text-white/50 text-xs">Traits</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-white/50 text-xs block mb-2">Key Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCareer.career.required_skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/85">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {selectedCareer.career.education_path && selectedCareer.career.education_path.length > 1 && (
                    <div className="mt-4">
                      <span className="text-white/50 text-xs block mb-2">All Education Paths</span>
                      <div className="space-y-1">
                        {selectedCareer.career.education_path.map((path, i) => (
                          <div key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="mt-0.5 text-primary-300">-</span>
                            <span>{path}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-primary-300/30 bg-primary-500/15 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <span className="text-white/50 text-xs block mb-2">Why This Role Fits You</span>
                        <div className="space-y-2">
                          {explainabilityReasons.map((reason) => (
                            <div key={reason} className="text-white/85 text-sm">- {reason}</div>
                          ))}
                        </div>
                      </div>
                      <Link href="/guidance" className="inline-flex">
                        <Button variant="secondary" size="sm">Open Guidance Hub</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="md:w-64">
                  <span className="text-white/50 text-xs block mb-3">Trait Alignment</span>
                  <div className="space-y-2">
                    {Object.entries(selectedCareer.career.required_traits).map(([trait, required]) => {
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
          )}
        </>
      )}
    </div>
  );
}
