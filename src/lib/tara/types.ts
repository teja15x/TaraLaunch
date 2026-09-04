export type TaraLanguage = 'en' | 'hi' | 'te';

export type MemoryCategory =
  | 'fact'
  | 'goal'
  | 'value'
  | 'preference'
  | 'constraint'
  | 'experience'
  | 'decision'
  | 'observation'
  | 'evidence'
  | 'reflection'
  | 'hypothesis'
  | 'outcome';

export type ConfidenceLevel = 'early-signal' | 'building' | 'strong';

export interface TaraProfile {
  name: string;
  age?: number;
  lifeStage: 'school' | 'college' | 'graduate' | 'working' | 'switcher' | 'entrepreneur' | 'unspecified';
  education?: string;
  location?: string;
  language: TaraLanguage;
}

export interface TaraMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface TaraMemory {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: ConfidenceLevel;
  source: 'conversation' | 'experience' | 'reflection' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface DecisionRecord {
  stepId: string;
  prompt: string;
  choiceId: string;
  choiceLabel: string;
  consequence: string;
  knownAtDecision: string;
  reason?: string;
}

export interface ReflectionRecord {
  id: string;
  experienceId: string;
  answers: Record<string, string>;
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  experienceId: string;
  observation: string;
  evidence: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  unknown: string;
  nextExperiment: string;
  createdAt: string;
}

export interface HypothesisRecord {
  id: string;
  title: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
  unknown: string;
  nextTest: string;
  updatedAt: string;
}

export interface JourneyEvent {
  id: string;
  type: 'conversation' | 'experience' | 'insight' | 'action' | 'reflection' | 'memory';
  title: string;
  description: string;
  date: string;
}

export interface NextAction {
  id: string;
  title: string;
  reason: string;
  status: 'todo' | 'in_progress' | 'done';
  deadline?: string;
  result?: string;
  reflection?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceChoice {
  id: string;
  label: string;
  consequence: string;
  nextStepId?: string;
  worldStatePatch?: Record<string, string | number | boolean>;
  observations: string[];
}

export interface ExperienceStep {
  id: string;
  prompt: string;
  knownContext: string;
  choices: ExperienceChoice[];
}

export interface ExperienceDefinition {
  id: string;
  version: number;
  title: string;
  domain: string;
  career: string;
  difficulty: 'starter' | 'intermediate' | 'advanced';
  objective: string;
  scenario: string;
  reflectionQuestions: string[];
  starterOnly?: boolean;
  steps: ExperienceStep[];
}

export interface ExperienceAttempt {
  id: string;
  experienceId: string;
  startedAt: string;
  updatedAt: string;
  currentStepId: string;
  worldState: Record<string, string | number | boolean>;
  decisions: DecisionRecord[];
  completedAt?: string;
}

export interface TaraMoment {
  id: string;
  text: string;
  createdAt: string;
}
