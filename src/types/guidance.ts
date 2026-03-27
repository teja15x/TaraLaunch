export type JourneyAudience = 'school-student' | 'college-student' | 'graduate' | 'parent';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface JourneyTrack {
  id: string;
  audience: JourneyAudience;
  title: string;
  stage: string;
  focus: string;
  outcomes: string[];
}

export interface CareerRealityInsight {
  id: string;
  audience: JourneyAudience | 'all';
  theme: string;
  title: string;
  reality: string;
  whyItMatters: string;
  actionSteps: string[];
  hopefulTruth: string;
}

export interface StateCareerRoadmap {
  id: string;
  state: string;
  stream: string;
  targetRole: string;
  entrances: string[];
  courseRoutes: string[];
  collegeStrategy: string[];
  timeline: string[];
  backupPaths: string[];
  realityChecks: string[];
}

export interface CollegeEmployerTier {
  tier: string;
  label: string;
  outcomes: string;
  watchouts: string;
}

export interface SalaryBand {
  label: string;
  range: string;
}

export interface CollegeEmployerInsight {
  role: string;
  degreePaths: string[];
  employerTypes: string[];
  tierBreakdown: CollegeEmployerTier[];
  salaryBands: SalaryBand[];
  proofSignals: string[];
  firstJobReality: string[];
}

export interface ParentTranslator {
  id: string;
  situation: string;
  studentInterpretation: string;
  betterMessage: string;
  starterScript: string;
}

export interface RiskRescueMode {
  id: string;
  label: string;
  signals: string[];
  likelyRisks: string[];
  rescuePlan: string[];
  checkInQuestion: string;
}

export interface WeeklyMissionWeek {
  week: number;
  theme: string;
  actions: string[];
  successSignal: string;
}

export interface WeeklyMission {
  audience: JourneyAudience;
  goal: string;
  riskLevel: RiskLevel;
  weeks: WeeklyMissionWeek[];
}

export interface GuidanceMetrics {
  hubVisits: number;
  roadmapViews: number;
  knowledgeViews: number;
  rescueChecks: number;
  parentTranslationsViewed: number;
  plansCreated: number;
  savedPlans: number;
  explainabilityViews: number;
  feedbackSubmissions: number;
  positiveFeedback: number;
}