'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

const GameLoading = () => (
  <div className="max-w-3xl mx-auto space-y-6 p-4">
    <Skeleton className="h-8 w-1/3 mb-2" />
    <Skeleton className="h-5 w-2/3 mb-6" />
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-pulse">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  </div>
);

// Lazy load all game components for better performance
const ScenarioQuest = dynamic(() => import('@/components/games/ScenarioQuest'), { loading: GameLoading });
const PatternMaster = dynamic(() => import('@/components/games/PatternMaster'), { loading: GameLoading });
const StoryWeaver = dynamic(() => import('@/components/games/StoryWeaver'), { loading: GameLoading });
const RhythmMatch = dynamic(() => import('@/components/games/RhythmMatch'), { loading: GameLoading });
const NatureDetective = dynamic(() => import('@/components/games/NatureDetective'), { loading: GameLoading });
const TheOrganizer = dynamic(() => import('@/components/games/TheOrganizer'), { loading: GameLoading });
const DebateClub = dynamic(() => import('@/components/games/DebateClub'), { loading: GameLoading });
const TeamLeader = dynamic(() => import('@/components/games/TeamLeader'), { loading: GameLoading });
const CreativeCanvas = dynamic(() => import('@/components/games/CreativeCanvas'), { loading: GameLoading });
const DecisionMaze = dynamic(() => import('@/components/games/DecisionMaze'), { loading: GameLoading });
const BudgetTradeoffLab = dynamic(() => import('@/components/games/BudgetTradeoffLab'), { loading: GameLoading });

const GAME_MAP: Record<string, React.ComponentType> = {
  'scenario-quest': ScenarioQuest,
  'pattern-master': PatternMaster,
  'story-weaver': StoryWeaver,
  'rhythm-match': RhythmMatch,
  'nature-detective': NatureDetective,
  'the-organizer': TheOrganizer,
  'debate-club': DebateClub,
  'team-leader': TeamLeader,
  'creative-canvas': CreativeCanvas,
  'decision-maze': DecisionMaze,
  'budget-tradeoff-lab': BudgetTradeoffLab,
};

export default function GamePage() {
  const params = useParams();
  const gameId = (params?.gameId as string) ?? '';
  const GameComponent = GAME_MAP[gameId];

  if (!GameComponent) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="text-5xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
        <p className="text-white/60">The game you&apos;re looking for doesn&apos;t exist. Head back to the games page.</p>
      </div>
    );
  }

  return <GameComponent />;
}
