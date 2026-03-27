'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  Compass,
  Gamepad2,
  GraduationCap,
  Languages,
  Menu,
  Palette,
  Scale,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

type StoryScene = {
  id: string;
  stepLabel: string;
  kicker: string;
  title: string;
  description: string;
  reflection: string;
  landmarkTitle: string;
  landmarkCopy: string;
  landmarkIcon: LucideIcon;
  chips: string[];
  statLabel: string;
  statValue: string;
  bgTop: string;
  bgBottom: string;
  glow: string;
  sunCore: string;
  horizonColor: string;
};

const topNavLinks = [
  { href: '/chat', label: 'Solution' },
  { href: '/guidance', label: 'Resources' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/roles', label: 'Careers' },
];

const storyScenes: StoryScene[] = [
  {
    id: 'dawn-ride',
    stepLabel: 'Scene 01',
    kicker: 'A quiet beginning',
    title: 'He starts riding before the city fully wakes up.',
    description:
      'One student. One cycle. One morning road. He does not yet know which career belongs to him, but the world ahead is already full of signals.',
    reflection: 'Every road is already carrying people toward purpose. He starts wondering where his road is going.',
    landmarkTitle: 'The city is already moving',
    landmarkCopy: 'Some people are reporting for duty. Some are building. Some are helping. He keeps riding.',
    landmarkIcon: Compass,
    chips: ['Curiosity', 'Possibility', 'Direction'],
    statLabel: 'Feeling',
    statValue: 'Searching',
    bgTop: '#f7f3eb',
    bgBottom: '#f1ddd0',
    glow: 'rgba(255, 137, 64, 0.42)',
    sunCore: '#ffd8ba',
    horizonColor: '#f28a3a',
  },
  {
    id: 'police-station',
    stepLabel: 'Scene 02',
    kicker: 'He passes the police station',
    title: 'He sees discipline, service, and courage on one side of the road.',
    description:
      'Officers move with urgency and structure. This is a life built on responsibility, public trust, and the ability to stay steady under pressure.',
    reflection: 'He asks himself whether he could ever become someone people rely on when things go wrong.',
    landmarkTitle: 'Protection is a career too',
    landmarkCopy: 'The uniform is not just authority. It is presence, discipline, and service in motion.',
    landmarkIcon: Shield,
    chips: ['Courage', 'Service', 'Structure'],
    statLabel: 'Career signal',
    statValue: 'Public Service',
    bgTop: '#f6f1e7',
    bgBottom: '#ead7c8',
    glow: 'rgba(255, 124, 47, 0.4)',
    sunCore: '#ffe0bd',
    horizonColor: '#f77b2f',
  },
  {
    id: 'hospital',
    stepLabel: 'Scene 03',
    kicker: 'Then he crosses a hospital stretch',
    title: 'He watches doctors and nurses carrying care, science, and urgency together.',
    description:
      'Some careers ask for intelligence. Some ask for empathy. This one demands both, every single day.',
    reflection: 'He wonders whether his future should be about solving problems, healing people, or maybe both.',
    landmarkTitle: 'Skill with a human heartbeat',
    landmarkCopy: 'Medicine is not only knowledge. It is calm, decision-making, and care under pressure.',
    landmarkIcon: Stethoscope,
    chips: ['Empathy', 'Science', 'Calm'],
    statLabel: 'Career signal',
    statValue: 'Medicine',
    bgTop: '#f5f0e8',
    bgBottom: '#eadfd1',
    glow: 'rgba(255, 123, 53, 0.38)',
    sunCore: '#ffe4c8',
    horizonColor: '#ff8d3d',
  },
  {
    id: 'court-and-office',
    stepLabel: 'Scene 04',
    kicker: 'The road bends near the court and civic offices',
    title: 'He notices that some people shape futures through law, policy, and difficult decisions.',
    description:
      'Inside these walls are arguments, judgement, process, and long-term consequence. Impact can come from thought, clarity, and the courage to decide.',
    reflection: 'Not every meaningful career looks loud. Some change lives through words, systems, and fairness.',
    landmarkTitle: 'Decisions create direction',
    landmarkCopy: 'Leadership is not always on a stage. Sometimes it lives inside law, administration, and policy.',
    landmarkIcon: Scale,
    chips: ['Judgement', 'Clarity', 'Impact'],
    statLabel: 'Career signal',
    statValue: 'Law + Policy',
    bgTop: '#f7f3ec',
    bgBottom: '#e8d7c6',
    glow: 'rgba(255, 111, 31, 0.36)',
    sunCore: '#ffddb6',
    horizonColor: '#f97222',
  },
  {
    id: 'studio-and-lab',
    stepLabel: 'Scene 05',
    kicker: 'Later he rides past a design studio and a tech lab',
    title: 'He sees ideas becoming products, visuals, code, and experiments.',
    description:
      'Some people create. Some people build. Some turn imagination into systems that millions can use.',
    reflection: 'He realizes a career can also be invention, design, startups, and new ways of solving old problems.',
    landmarkTitle: 'Creation is work too',
    landmarkCopy: 'Studios and labs prove that modern careers can be artistic, technical, and entrepreneurial at the same time.',
    landmarkIcon: Palette,
    chips: ['Creativity', 'Technology', 'Building'],
    statLabel: 'Career signal',
    statValue: 'Design + Tech',
    bgTop: '#f8f2e8',
    bgBottom: '#ecd8ca',
    glow: 'rgba(255, 102, 0, 0.42)',
    sunCore: '#ffd6ae',
    horizonColor: '#ff6a00',
  },
  {
    id: 'crossroads',
    stepLabel: 'Scene 06',
    kicker: 'At the final junction, he slows down',
    title: 'After seeing so many roles, he asks the question directly: what should I become?',
    description:
      'This is the point where admiration becomes reflection. He no longer wants to only watch careers go by. He wants a path of his own.',
    reflection: 'He is ready for guidance that is personal, practical, and based on who he actually is.',
    landmarkTitle: 'The decision point',
    landmarkCopy: 'Not all confusion means lack of ambition. Sometimes it means the student has finally started thinking seriously.',
    landmarkIcon: GraduationCap,
    chips: ['Pause', 'Reflection', 'Decision'],
    statLabel: 'Feeling',
    statValue: 'Ready',
    bgTop: '#f8f4ec',
    bgBottom: '#efddd1',
    glow: 'rgba(255, 108, 24, 0.46)',
    sunCore: '#ffe0b9',
    horizonColor: '#ff6400',
  },
  {
    id: 'agent-handoff',
    stepLabel: 'Scene 07',
    kicker: 'That is where Career Agent enters',
    title: 'The journey becomes a conversation, and the conversation becomes a plan.',
    description:
      'Instead of guessing alone, he can now talk to Career Agent, play assessment games, and discover a roadmap that fits his interests, strengths, and reality.',
    reflection: 'He stops watching the city and starts planning his own future inside it.',
    landmarkTitle: 'From story to strategy',
    landmarkCopy: 'Career Agent helps students turn exposure into insight, and insight into confident next steps.',
    landmarkIcon: Bot,
    chips: ['Conversation', 'Assessment', 'Roadmap'],
    statLabel: 'Next move',
    statValue: 'Meet Agent',
    bgTop: '#f7f2ea',
    bgBottom: '#edd8cb',
    glow: 'rgba(255, 100, 0, 0.52)',
    sunCore: '#ffe1c3',
    horizonColor: '#ff6400',
  },
];

const followupCards = [
  {
    href: '/chat',
    title: 'Talk to Career Agent',
    copy: 'Start with one honest conversation and let the agent guide the next question.',
    icon: Bot,
  },
  {
    href: '/games',
    title: 'Play the Discovery Games',
    copy: 'Use assessments and interactive games to understand behavior, interest, and working style.',
    icon: Gamepad2,
  },
  {
    href: '/results',
    title: 'See Your Career Match',
    copy: 'Get explainable career suggestions, fit reasons, and next-step guidance.',
    icon: ChartNoAxesCombined,
  },
  {
    href: '/parent',
    title: 'Bring Parents Into It',
    copy: 'Show parents a clearer picture of strengths, progress, and practical decisions.',
    icon: Users,
  },
];

export function StoryLandingExperience() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const activeScene = storyScenes[sceneIndex];
  const LandmarkIcon = activeScene.landmarkIcon;
  const isFirstScene = sceneIndex === 0;
  const isFinalScene = sceneIndex === storyScenes.length - 1;

  const goToNextScene = () => {
    if (isFinalScene) return;
    setSceneIndex((currentValue) => Math.min(currentValue + 1, storyScenes.length - 1));
  };

  const goToPreviousScene = () => {
    if (isFirstScene) return;
    setSceneIndex((currentValue) => Math.max(currentValue - 1, 0));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efede7] text-[#0f1115]">
      <div className="story-grid-lines pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,140,69,0.18),transparent_62%)]" />

      <header className="relative z-30 px-4 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 rounded-[1.7rem] border border-black/10 bg-white/76 px-4 py-3 shadow-[0_20px_48px_rgba(0,0,0,0.08)] backdrop-blur md:px-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-black/60 text-[10px] font-mono font-semibold tracking-[0.16em] text-black">
              CA
            </span>
            <div>
              <p className="font-display text-[1.9rem] leading-none tracking-tight text-black">Career Agent</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/44">Story-led guidance for students</p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-6 xl:flex">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-black/10 bg-[#f7f3ee] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-3 flex-1 truncate rounded-full bg-white px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-black/44">
                careeragent.ai / student-journey
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            {topNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 font-mono text-xs tracking-[0.08em] text-black/72 transition hover:bg-black/5 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/chat"
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-[#ff6400] px-5 py-3 font-mono text-xs tracking-[0.08em] text-black shadow-[0_14px_32px_rgba(255,100,0,0.25)] transition hover:translate-y-[-1px] hover:brightness-105"
            >
              Meet the agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-xl border border-black/15 bg-white/85 text-black lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-6 w-full max-w-[1380px] px-4 pb-14 sm:px-8 lg:px-12 lg:pb-20">
        <div className="grid gap-8 xl:grid-cols-[0.72fr_1.08fr] xl:gap-10">
          <div className="rounded-[2rem] border border-black/10 bg-white/68 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-8 xl:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-[#f8f3ed] px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-black/64">
                <Languages className="h-3.5 w-3.5" />
                Career Story Mode
              </span>
              <span className="rounded-full border border-black/10 px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-black/42">
                Press the arrows to move through the journey
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeScene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.34, ease: 'easeOut' }}
                className="mt-6"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-black/42">{activeScene.stepLabel}</p>
                <p className="mt-3 text-sm font-medium text-[#d15a00]">{activeScene.kicker}</p>
                <h1 className="mt-4 max-w-[12ch] font-display text-[3rem] leading-[0.92] tracking-tight text-black sm:text-[4rem] xl:text-[4.5rem]">
                  {activeScene.title}
                </h1>
                <p className="mt-6 max-w-xl text-[1.18rem] leading-relaxed text-black/74 sm:text-[1.32rem]">
                  {activeScene.description}
                </p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-black/56 sm:text-[1.02rem]">
                  {activeScene.reflection}
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {activeScene.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-black/12 bg-[#faf7f2] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-black/62"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={goToPreviousScene}
                disabled={isFirstScene}
                className="inline-flex items-center gap-2 rounded-2xl border border-black/12 bg-white px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#f8f4ef] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {!isFinalScene && (
                <button
                  type="button"
                  onClick={goToNextScene}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6400] px-6 py-4 text-sm font-semibold text-black shadow-[0_14px_32px_rgba(255,100,0,0.26)] transition hover:translate-y-[-1px] hover:brightness-105"
                >
                  Next scene
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {isFinalScene && (
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6400] px-6 py-4 text-sm font-semibold text-black shadow-[0_14px_32px_rgba(255,100,0,0.26)] transition hover:translate-y-[-1px] hover:brightness-105"
                >
                  Start with Career Agent
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <Link href="/chat" className="font-mono text-xs uppercase tracking-[0.12em] text-black/52 underline-offset-4 hover:text-black hover:underline">
                Skip to agent
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {storyScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setSceneIndex(index)}
                  className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                    sceneIndex === index
                      ? 'border-[#ff6400]/40 bg-[#fff5ee] shadow-[0_12px_28px_rgba(255,100,0,0.12)]'
                      : 'border-black/10 bg-white/72 hover:border-black/18 hover:bg-white'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/42">{scene.stepLabel}</span>
                  <span className="mt-2 block text-base font-semibold leading-snug text-black">{scene.kicker}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="story-stage-shell">
            <div className="w-full rounded-[2rem] border border-black/10 bg-white/62 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur md:p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene.id}
                  className="story-stage"
                  style={{
                    background: `linear-gradient(180deg, ${activeScene.bgTop} 0%, ${activeScene.bgBottom} 76%, #d6c0b2 100%)`,
                  }}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div
                    className="story-stage-haze"
                    style={{ background: `radial-gradient(circle at 50% 80%, ${activeScene.glow}, transparent 68%)` }}
                  />
                  <div
                    className="story-stage-sun"
                    style={{
                      ['--story-sun-core' as string]: activeScene.sunCore,
                      ['--story-sun-glow' as string]: activeScene.glow,
                    } as CSSProperties}
                  />
                  <div
                    className="story-stage-horizon"
                    style={{ background: `linear-gradient(180deg, ${activeScene.horizonColor}, rgba(255,255,255,0))` }}
                  />
                  <div className="story-stage-cityline">
                    {[22, 34, 48, 58, 62, 44, 28, 38, 52, 41].map((height, index) => (
                      <span
                        key={`${activeScene.id}-${height}-${index}`}
                        className="story-building"
                        style={{ height: `${height}%`, width: index % 2 === 0 ? '7.8%' : '5.4%' }}
                      />
                    ))}
                  </div>

                  <div className="story-stage-road" />

                  <motion.div
                    className="story-cyclist"
                    animate={{ x: [-4, 12, -4], y: [0, -5, 0] }}
                    transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  >
                    <div className="story-wheel story-wheel-left" />
                    <div className="story-wheel story-wheel-right" />
                    <div className="story-bike-frame" />
                    <div className="story-bike-seat" />
                    <div className="story-bike-handle" />
                    <div className="story-rider-head" />
                    <div className="story-rider-body" />
                    <div className="story-rider-leg story-rider-leg-front" />
                    <div className="story-rider-leg story-rider-leg-back" />
                  </motion.div>

                  <motion.div
                    className="story-landmark-card"
                    initial={{ opacity: 0, x: 30, rotate: 3 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ duration: 0.36, ease: 'easeOut', delay: 0.08 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/44">{activeScene.stepLabel}</p>
                        <h2 className="mt-2 max-w-[14ch] font-display text-[2rem] leading-[0.92] text-black">
                          {activeScene.landmarkTitle}
                        </h2>
                      </div>
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                        <LandmarkIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-black/72">{activeScene.landmarkCopy}</p>
                  </motion.div>

                  {!isFinalScene && (
                    <motion.div
                      className="story-insight-card"
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.36, ease: 'easeOut', delay: 0.12 }}
                    >
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/46">{activeScene.statLabel}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-black">{activeScene.statValue}</p>
                        <Sparkles className="h-4 w-4 text-[#ff6400]" />
                      </div>
                    </motion.div>
                  )}

                  {isFinalScene && (
                    <motion.div
                      className="story-agent-reveal"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.38, ease: 'easeOut', delay: 0.12 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff6400] text-black shadow-[0_12px_24px_rgba(255,100,0,0.26)]">
                          <Bot className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-black/44">Agent handoff</p>
                          <h3 className="font-display text-2xl text-black">Career Agent is ready</h3>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-black/72">
                        Continue with a real conversation, assessment games, and a roadmap built around the student instead of generic advice.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href="/chat"
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6400] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105"
                        >
                          Talk to the agent
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                          href="/games"
                          className="inline-flex items-center gap-2 rounded-2xl border border-black/14 bg-white/84 px-5 py-3 text-sm font-semibold text-black transition hover:bg-white"
                        >
                          Play discovery games
                          <Gamepad2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  <div className="absolute inset-x-6 top-6 flex items-start justify-between gap-3">
                    <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-black/44 backdrop-blur">
                      {sceneIndex + 1} / {storyScenes.length}
                    </div>
                    <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-black/44 backdrop-blur">
                      Student journey view
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="rounded-[2rem] border border-black/10 bg-white/68 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur sm:p-7 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-black/42">After the story</p>
              <h2 className="mt-2 font-display text-[2.4rem] leading-[0.95] tracking-tight text-black sm:text-[3rem]">
                Turn inspiration into a real career plan.
              </h2>
            </div>
            <Link href="/chat" className="inline-flex items-center gap-2 text-sm font-semibold text-black hover:text-[#ff6400]">
              Open the full experience
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {followupCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`interactive-card rounded-[1.6rem] border border-black/10 bg-white/82 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.06)] animate-rise ${
                    index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-black/44" />
                  </div>
                  <h3 className="mt-5 font-display text-[1.75rem] leading-none text-black">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/64">{card.copy}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
