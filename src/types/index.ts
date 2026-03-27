// Profile & Auth
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  date_of_birth: string;
  parent_email?: string | null;
  parent_name?: string | null;
  avatar_url?: string | null;
  subscription_tier: 'free' | 'starter' | 'pro';
  created_at: string;
  updated_at: string;
}

// RIASEC (Holland)
export interface RiasecScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

// Gardner's 8 intelligences
export interface GardnerScores {
  linguistic: number;
  logical_mathematical: number;
  spatial: number;
  musical: number;
  bodily_kinesthetic: number;
  interpersonal: number;
  intrapersonal: number;
  naturalistic: number;
}

// Big Five (OCEAN)
export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface AssessmentProfile {
  id: string;
  user_id: string;
  riasec: RiasecScores;
  gardner: GardnerScores;
  big_five: BigFiveScores;
  completed_games: string[];
  assessment_progress: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  timestamp?: number;
}

export interface GameResult {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  time_taken_seconds: number;
  assessment_scores: Record<string, number>;
  completed_at: string;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  career_title: string;
  career_description?: string | null;
  career_category?: string | null;
  match_score: number;
  match_reasons: string[];
  education_path: string[];
  generated_at: string;
}

// Career database entry (Indian careers)
export interface CareerEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  riasec_profile: RiasecScores;
  gardner_profile: Record<keyof GardnerScores, number>;
  big_five_profile: BigFiveScores;
  education_path: string[];
  salary_range: { min: number; max: number; currency: string };
  growth_outlook: 'high' | 'medium' | 'low';
  related_careers: string[];
}

// Legacy career profile (used by lib/careers matcher and results UI)
export interface CareerProfile {
  title: string;
  category: string;
  description: string;
  required_traits: Partial<TraitScores>;
  growth_outlook: 'high' | 'medium' | 'low';
  salary_range: string;
  required_skills: string[];
  education: string;
}

// Legacy trait scores (used by existing games; maps to RIASEC/Gardner/Big Five in backend)
export interface TraitScores {
  analytical: number;
  creative: number;
  leadership: number;
  empathy: number;
  technical: number;
  communication: number;
  adaptability: number;
  detail_oriented: number;
}

// Game types
export interface GameResponse {
  question_id: string;
  question: string;
  answer: string;
  timestamp: number;
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  responses: GameResponse[];
  isComplete: boolean;
  gameType: string;
}

// Store types
export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface CareerMatch {
  career: CareerProfile;
  score: number;
  alignment: Record<string, number>;
}

// Payment types
export interface PaymentOrder {
  id: string;
  user_id: string;
  plan_id: 'starter' | 'pro';
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'captured' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EVIDENCE MODEL & COUNSELING STATE (Phase 0+)
 * ═══════════════════════════════════════════════════════════════
 * Implements guardrails for stage-gated, evidence-weighted counseling
 * See: src/docs/COUNSELING_OS_GUARDRAILS.md
 */

// Supported evidence sources
export type EvidenceSource = 'chat' | 'game' | 'assessment' | 'constraint' | 'roleDepthTest';

// Evidence item that contributes to recommendations
export interface EvidenceItem {
  id: string;
  user_id: string;
  source: EvidenceSource;
  source_id?: string;  // e.g., game_id, assessment_type
  signal: string;  // Human-readable signal (e.g., "ScenarioQuest 89%: Strong leadership in conflict resolution")
  career_dimension?: string;  // e.g., "investigative", "linguistic", "leadership"
  signal_value: number;  // Numeric value for this dimension (0-100 typically)
  weight: number;  // Contribution weight to final ranking (e.g., 0.12 for 12%)
  timestamp: string;
  resolved_contradiction?: string;  // If this evidence resolves a prior contradiction
  created_at: string;
}

// Contradiction detection & resolution
export interface Contradiction {
  id: string;
  user_id: string;
  signal_1: string;  // e.g., "Chat: 'I want to code'"
  signal_2: string;  // e.g., "Games: 8 creative, 0 logic"
  career_dimension?: string;  // Which dimension is conflicted
  severity: 'low' | 'medium' | 'high';  // low = tolerable, high = blocks progression
  is_resolved: boolean;
  resolution_move?: string;  // Counselor's re-probe that resolved it
  resolved_at?: string;
  created_at: string;
}

// Student constraints that gate career recommendations
export interface ConstraintProfile {
  id: string;
  user_id: string;
  location_flexibility: 'within_state' | 'metro_cities' | 'anywhere';
  affordability_level: 'aspirational' | 'accessible' | 'tight';
  language_preferences: string[];  // e.g., ["hi", "en", "te"]
  family_aspiration?: string;  // e.g., "IIT engineer", "stable government job"
  parent_risk_tolerance: 'low' | 'medium' | 'high';
  family_pressure_level: 'low' | 'moderate' | 'high';
  time_to_decision: string;  // e.g., "immediate", "1-2 years", "exploratory"
  created_at: string;
  updated_at: string;
}

// Early-stage career hypothesis
export interface Hypothesis {
  id: string;
  user_id: string;
  career_cluster: string;  // e.g., "IT/Tech", "Engineering", "Business"
  fit_reasoning: string;  // Why this cluster makes sense
  confidence_band: 'low' | 'medium' | 'high';
  supporting_dimensions: string[];  // e.g., ["investigative", "logical_mathematical"]
  stress_test_actions: string[];  // What to test this hypothesis (e.g., "Try PatternMaster", "Explore AI role depth")
  created_at: string;
  updated_at: string;
}

// Counseling stage constants
export type CounselingStage = 'discovery' | 'narrowing' | 'recommendation' | 'execution';

// Stage-gating information
export interface StageGateStatus {
  stage: CounselingStage;
  is_unlocked: boolean;
  progress_percent: number;
  blocking_gates: Array<{
    gate_name: string;
    requirement: string;
    current_status: string;
    is_met: boolean;
  }>;
  next_action: string;
}

// Final ranked recommendation with explainability
export interface RankedCareer {
  career_title: string;
  career_category?: string;
  confidence_band: 'low' | 'medium' | 'high';
  confidence_rationale: string;  // e.g., "Medium: 3/4 RIASEC dimensions aligned, role-depth test pending"
  match_score?: number;  // Deprecated: prefer confidence_band, kept for legacy compatibility
  
  // Explainability fields
  supporting_evidence: Array<{
    source: EvidenceSource;
    signal: string;
    weight: number;
    timestamp: string;
  }>;
  
  contradictions_resolved: Array<{
    conflict: string;
    resolution: string;
    counselor_move: string;
  }>;
  
  rejected_alternatives: Array<{
    career: string;
    reason_rejected: string;
    evidence: string;
  }>;
  
  // Next steps
  next_validation_action: string;
  estimated_clarity_timeline: string;
}

// Complete recommendation dossier (response for /api/career/match with stage=recommendation)
export interface RecommendationDossier {
  user_id: string;
  stage: CounselingStage;
  generated_at: string;
  
  // Ranked careers (if stage = recommendation)
  ranked_careers?: RankedCareer[];
  
  // Summary
  overall_clarity_band: 'low' | 'medium' | 'high';
  clarity_summary: string;
  evidence_quality_assessment: string;  // e.g., "Strong: 2 assessments + 3 games + role tests"
  
  // Context for student
  family_context_acknowledged: string;  // How family constraints/aspirations were honored
  constraint_impact_summary: string;  // e.g., "Affordability limited premium paths; recommended alternatives"
  
  // Confidence in this dossier
  total_evidence_sources: number;
  recommendation_blockers?: string[];  // If any gates still not fully met
}

// Complete counseling state snapshot (for resuming sessions)
export interface CounselingState {
  id: string;
  user_id: string;
  session_id: string;  // Unique per counseling engagement
  
  // Stage tracking
  current_stage: CounselingStage;
  stage_gates: StageGateStatus;
  turns_in_stage: number;
  
  // Evidence collection
  evidence_log: EvidenceItem[];
  contradictions_log: Contradiction[];
  
  // Student profile building
  constraints?: ConstraintProfile;  // Optional: captured progressively
  hypotheses: Hypothesis[];
  
  // Assessment progress
  riasec_progress: number;  // % of dimensions answered
  gardner_progress: number;  // % of dimensions answered
  big_five_progress: number;  // % of dimensions answered
  games_completed: string[];  // Game IDs completed
  roleDepthTests_completed: string[];  // Careers tested for depth understanding
  
  // Session metadata
  created_at: string;
  last_updated_at: string;
  total_turns: number;
  language: string;  // e.g., "te", "hi", "en-IN"
  age_tier: 'explorer' | 'discoverer' | 'navigator' | 'pivoter';
}
