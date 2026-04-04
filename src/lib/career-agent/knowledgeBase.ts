import { careerDatabase, type CareerData } from '@/data/careers';
import rolesSeed from '@/data/knowledge/roles.seed.json';
import { detectRoleMentionFromText, getRoleKnowledgeSummary } from '@/lib/career-agent/roleKnowledge';
import type { RoleSeedCollection } from '@/lib/career-agent/knowledgeSchema';

export interface KnowledgeBaseInput {
  selectedRole?: string | null;
  latestMessage?: string;
  detectedStage?: string;
  counselingTrack?: 'career-counseling' | 'school-exam-support' | 'post-college-employability';
  studentIntake?: {
    currentSituation?: string;
    interests?: string;
    confusion?: string;
    stressors?: string;
    targetRole?: string;
    stateOrCity?: string;
  } | null;
  maxResults?: number;
  retrievalMode?: 'core' | 'expanded';
  currentTurnNumber?: number;
}

export interface RankedKnowledgeRole {
  id: string;
  title: string;
  category: string;
  score: number;
  reasons: string[];
  educationPath: string[];
  requiredSkills: string[];
  salaryRangeInr?: string;
  normalizedSalaryRangeInr?: string;
  normalizedSalaryContext?: string;
  growthOutlook: 'high' | 'medium' | 'low';
}

export interface KnowledgeDecision {
  rankedRoles: RankedKnowledgeRole[];
  confidence: number;
  clarifyingQuestion?: string;
  city?: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  retrievalMode: 'core' | 'expanded';
}

interface KnowledgeRoleRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  educationPath: string[];
  requiredSkills: string[];
  relatedCareers: string[];
  salaryRangeInr?: string;
  growthOutlook: 'high' | 'medium' | 'low';
}

interface CityTierProfile {
  city: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  salaryMultiplier: number;
}

const CITY_TIER_PROFILES: CityTierProfile[] = [
  { city: 'mumbai', tier: 'tier1', salaryMultiplier: 1.15 },
  { city: 'bangalore', tier: 'tier1', salaryMultiplier: 1.14 },
  { city: 'bengaluru', tier: 'tier1', salaryMultiplier: 1.14 },
  { city: 'delhi', tier: 'tier1', salaryMultiplier: 1.12 },
  { city: 'gurgaon', tier: 'tier1', salaryMultiplier: 1.12 },
  { city: 'noida', tier: 'tier1', salaryMultiplier: 1.1 },
  { city: 'pune', tier: 'tier1', salaryMultiplier: 1.08 },
  { city: 'hyderabad', tier: 'tier1', salaryMultiplier: 1.06 },
  { city: 'chennai', tier: 'tier1', salaryMultiplier: 1.06 },
  { city: 'kolkata', tier: 'tier1', salaryMultiplier: 1.03 },
  { city: 'ahmedabad', tier: 'tier2', salaryMultiplier: 0.95 },
  { city: 'coimbatore', tier: 'tier2', salaryMultiplier: 0.94 },
  { city: 'vijayawada', tier: 'tier2', salaryMultiplier: 0.93 },
  { city: 'visakhapatnam', tier: 'tier2', salaryMultiplier: 0.93 },
  { city: 'vizag', tier: 'tier2', salaryMultiplier: 0.93 },
  { city: 'indore', tier: 'tier2', salaryMultiplier: 0.92 },
  { city: 'jaipur', tier: 'tier2', salaryMultiplier: 0.92 },
  { city: 'lucknow', tier: 'tier2', salaryMultiplier: 0.9 },
  { city: 'bhubaneswar', tier: 'tier2', salaryMultiplier: 0.9 },
  { city: 'nagpur', tier: 'tier2', salaryMultiplier: 0.89 },
];

const DEFAULT_TIER_MULTIPLIERS = {
  tier1: 1.08,
  tier2: 0.92,
  tier3: 0.82,
};

function normalizeText(text?: string | null): string {
  return (text ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapCareerRecord(item: CareerData): KnowledgeRoleRecord {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    educationPath: item.education_path,
    requiredSkills: item.required_skills,
    relatedCareers: item.related_careers,
    salaryRangeInr: item.salary_range_inr,
    growthOutlook: item.growth_outlook,
  };
}

function mapSeedRecord(item: RoleSeedCollection['items'][number]): KnowledgeRoleRecord {
  const stageMappedPath = item.stageFit.join(' -> ');
  return {
    id: item.id,
    title: item.title,
    category: item.roleFamily,
    description: item.pathHint,
    educationPath: [item.pathHint, `Stage fit: ${stageMappedPath}`],
    requiredSkills: item.tags,
    relatedCareers: [],
    salaryRangeInr: undefined,
    growthOutlook: 'medium',
  };
}

function getExpandedKnowledgeRecords(mode: 'core' | 'expanded'): KnowledgeRoleRecord[] {
  const fromCareers = careerDatabase.map(mapCareerRecord);
  if (mode === 'core') {
    return fromCareers;
  }

  const seedCollection = rolesSeed as RoleSeedCollection;
  const fromSeeds = seedCollection.items.map(mapSeedRecord);

  // Keep the richer career database entry when duplicate titles appear.
  const byTitle = new Map<string, KnowledgeRoleRecord>();
  for (const role of [...fromCareers, ...fromSeeds]) {
    const key = normalizeText(role.title);
    if (!byTitle.has(key)) {
      byTitle.set(key, role);
      continue;
    }

    const existing = byTitle.get(key)!;
    const existingSignal = existing.requiredSkills.length + existing.educationPath.length + (existing.salaryRangeInr ? 2 : 0);
    const nextSignal = role.requiredSkills.length + role.educationPath.length + (role.salaryRangeInr ? 2 : 0);
    if (nextSignal > existingSignal) {
      byTitle.set(key, role);
    }
  }

  return Array.from(byTitle.values());
}

function tokenize(text?: string | null): string[] {
  return normalizeText(text)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function detectCityAndTier(input: KnowledgeBaseInput): { city?: string; tier: 'tier1' | 'tier2' | 'tier3'; salaryMultiplier: number } {
  const locationText = normalizeText([input.studentIntake?.stateOrCity, input.latestMessage].join(' '));
  if (!locationText) {
    return {
      city: undefined,
      tier: 'tier3',
      salaryMultiplier: DEFAULT_TIER_MULTIPLIERS.tier3,
    };
  }

  for (const profile of CITY_TIER_PROFILES) {
    if (locationText.includes(profile.city)) {
      return {
        city: profile.city,
        tier: profile.tier,
        salaryMultiplier: profile.salaryMultiplier,
      };
    }
  }

  if (
    locationText.includes('metro') ||
    locationText.includes('capital') ||
    locationText.includes('tier 1') ||
    locationText.includes('tier-1')
  ) {
    return {
      city: undefined,
      tier: 'tier1',
      salaryMultiplier: DEFAULT_TIER_MULTIPLIERS.tier1,
    };
  }

  if (locationText.includes('tier 2') || locationText.includes('tier-2')) {
    return {
      city: undefined,
      tier: 'tier2',
      salaryMultiplier: DEFAULT_TIER_MULTIPLIERS.tier2,
    };
  }

  return {
    city: undefined,
    tier: 'tier3',
    salaryMultiplier: DEFAULT_TIER_MULTIPLIERS.tier3,
  };
}

function parseSalaryLakhs(range?: string): { min: number; max: number } | null {
  if (!range) return null;
  const normalized = range.replace(/,/g, '');
  const lakhMatch = normalized.match(/₹\s*([\d.]+)\s*L\s*-\s*₹\s*([\d.]+)\s*L/i);
  if (lakhMatch) {
    return {
      min: Number.parseFloat(lakhMatch[1]),
      max: Number.parseFloat(lakhMatch[2]),
    };
  }

  const thousandMatch = normalized.match(/₹\s*([\d.]+)\s*K\s*-\s*₹\s*([\d.]+)\s*K/i);
  if (thousandMatch) {
    return {
      min: Number.parseFloat(thousandMatch[1]) / 100,
      max: Number.parseFloat(thousandMatch[2]) / 100,
    };
  }

  return null;
}

function formatLakhs(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

function normalizeSalaryRangeByTier(range: string | undefined, multiplier: number, tier: 'tier1' | 'tier2' | 'tier3', city?: string): { normalizedSalaryRangeInr?: string; normalizedSalaryContext: string } {
  const parsed = parseSalaryLakhs(range);
  if (!parsed) {
    return {
      normalizedSalaryRangeInr: range,
      normalizedSalaryContext: `No parseable salary range; using source estimate as directional (${tier}).`,
    };
  }

  const minAdj = parsed.min * multiplier;
  const maxAdj = parsed.max * multiplier;
  const locationLabel = city ? city : tier;

  return {
    normalizedSalaryRangeInr: `₹${formatLakhs(minAdj)}L - ₹${formatLakhs(maxAdj)}L per annum`,
    normalizedSalaryContext: `Adjusted for ${locationLabel} using multiplier ${multiplier.toFixed(2)}.`,
  };
}

function buildCorpus(role: KnowledgeRoleRecord): string {
  return normalizeText([
    role.title,
    role.category,
    role.description,
    ...(role.educationPath ?? []),
    ...(role.requiredSkills ?? []),
    ...(role.relatedCareers ?? []),
  ].join(' '));
}

function scoreRole(role: KnowledgeRoleRecord, contextTokens: string[], selectedRole?: string | null, detectedRoleFromMessage?: string | null, counselingTrack?: KnowledgeBaseInput['counselingTrack']): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const corpus = buildCorpus(role);

  // Exact role intent is the strongest signal.
  if (selectedRole?.trim()) {
    const selected = normalizeText(selectedRole);
    const title = normalizeText(role.title);
    if (title === selected) {
      score += 140;
      reasons.push('Exact selected role match');
    } else if (title.includes(selected) || selected.includes(title)) {
      score += 90;
      reasons.push('Strong selected role similarity');
    }
  }

  if (detectedRoleFromMessage?.trim()) {
    const detected = normalizeText(detectedRoleFromMessage);
    const title = normalizeText(role.title);
    if (title === detected) {
      score += 120;
      reasons.push('Role detected directly from latest message');
    } else if (title.includes(detected) || detected.includes(title)) {
      score += 70;
      reasons.push('Role text overlap with latest message');
    }
  }

  // Context token overlap (interests, confusion, situation, latest message).
  let overlap = 0;
  for (const token of contextTokens) {
    if (corpus.includes(token)) {
      overlap += 1;
    }
  }

  if (overlap > 0) {
    const tokenScore = Math.min(80, overlap * 8);
    score += tokenScore;
    reasons.push(`Matched ${overlap} context signals`);
  }

  // Track-specific weighting for better relevance.
  if (counselingTrack === 'school-exam-support') {
    const eduText = normalizeText((role.educationPath ?? []).join(' '));
    if (eduText.includes('neet') || eduText.includes('jee') || eduText.includes('foundation') || eduText.includes('class')) {
      score += 25;
      reasons.push('Aligned to exam-support track');
    }
  }

  if (counselingTrack === 'post-college-employability') {
    if (role.requiredSkills.length >= 4) {
      score += 20;
      reasons.push('Skill-rich role fit for employability planning');
    }
  }

  if (role.growthOutlook === 'high') {
    score += 8;
  }

  return { score, reasons };
}

function stageLabel(detectedStage?: string): string {
  const normalized = normalizeText(detectedStage);
  if (normalized.includes('pre12') || normalized.includes('pre 12')) return 'pre-12th';
  if (normalized.includes('post12') || normalized.includes('post 12')) return 'post-12th';
  if (normalized.includes('incollege') || normalized.includes('in college')) return 'in-college';
  if (normalized.includes('postcollege') || normalized.includes('post college')) return 'post-college';
  return 'unknown';
}

export function getRankedKnowledgeRoles(input: KnowledgeBaseInput): RankedKnowledgeRole[] {
  const detectedRoleFromMessage = detectRoleMentionFromText(input.latestMessage);
  const cityTier = detectCityAndTier(input);
  const mode = input.retrievalMode ?? 'expanded';
  const records = getExpandedKnowledgeRecords(mode);

  const contextText = [
    input.latestMessage,
    input.selectedRole,
    input.studentIntake?.targetRole,
    input.studentIntake?.interests,
    input.studentIntake?.confusion,
    input.studentIntake?.currentSituation,
    input.studentIntake?.stressors,
  ].join(' ');

  const contextTokens = unique(tokenize(contextText));

  const scored = records.map((role) => {
    const { score, reasons } = scoreRole(
      role,
      contextTokens,
      input.selectedRole,
      detectedRoleFromMessage,
      input.counselingTrack,
    );

    return {
      id: role.id,
      title: role.title,
      category: role.category,
      score,
      reasons,
      educationPath: role.educationPath,
      requiredSkills: role.requiredSkills,
      salaryRangeInr: role.salaryRangeInr,
      ...normalizeSalaryRangeByTier(role.salaryRangeInr, cityTier.salaryMultiplier, cityTier.tier, cityTier.city),
      growthOutlook: role.growthOutlook,
    } as RankedKnowledgeRole;
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, input.maxResults ?? 3));
}

function computeKnowledgeConfidence(input: KnowledgeBaseInput, ranked: RankedKnowledgeRole[]): number {
  if (!ranked.length) return 0;

  const top = ranked[0].score;
  const second = ranked[1]?.score ?? 0;
  const gap = top - second;

  let confidence = clamp(Math.round(top / 2), 10, 75);

  if (input.selectedRole?.trim()) confidence += 12;
  if (detectRoleMentionFromText(input.latestMessage)) confidence += 8;
  if (gap >= 30) confidence += 12;
  if (gap >= 60) confidence += 8;

  const hasWeakContext = !input.studentIntake?.interests && !input.studentIntake?.currentSituation && !input.studentIntake?.confusion;
  if (hasWeakContext) confidence -= 10;
  if (!input.studentIntake?.stateOrCity) confidence -= 6;

  return clamp(confidence, 0, 100);
}

function getClarifyingQuestion(input: KnowledgeBaseInput, confidence: number): string | undefined {
  if (confidence >= 60) return undefined;

  if (!input.selectedRole?.trim() && !input.studentIntake?.targetRole?.trim()) {
    return 'Which one role are you most seriously considering right now so I can give you a precise roadmap?';
  }

  if (!input.studentIntake?.stateOrCity?.trim()) {
    return 'Which city or state are you planning to study or work in? This affects realistic salary and college planning.';
  }

  if (!input.studentIntake?.currentSituation?.trim()) {
    return 'Can you tell me your current exact stage in one line (class/college year/graduated)?';
  }

  return 'What is your biggest blocker right now: skills, exams, money, confidence, or family pressure?';
}

export function buildKnowledgeDecision(input: KnowledgeBaseInput): KnowledgeDecision {
  const mode = input.retrievalMode ?? 'expanded';
  const cityTier = detectCityAndTier(input);
  const rankedRoles = getRankedKnowledgeRoles(input);
  const confidence = computeKnowledgeConfidence(input, rankedRoles);
  const clarifyingQuestion = getClarifyingQuestion(input, confidence);

  return {
    rankedRoles,
    confidence,
    clarifyingQuestion,
    city: cityTier.city,
    tier: cityTier.tier,
    retrievalMode: mode,
  };
}

export function buildKnowledgeBasePromptBlock(input: KnowledgeBaseInput): string {
  const decision = buildKnowledgeDecision(input);
  const ranked = decision.rankedRoles;
  const isDiscoveryPhase = (input.currentTurnNumber ?? 1) <= 25;
  const stage = stageLabel(input.detectedStage);
  const cityContext = input.studentIntake?.stateOrCity?.trim();
  const topRoleSummary = input.selectedRole ? getRoleKnowledgeSummary(input.selectedRole) : null;

  const lines: string[] = [
    'KNOWLEDGE BASE RETRIEVAL (Grounded Context):',
    `- Detected stage context: ${stage}`,
    `- Counseling track: ${input.counselingTrack ?? 'career-counseling'}`,
    `- Retrieval confidence: ${decision.confidence}/100`,
    `- Retrieval mode: ${decision.retrievalMode}`,
    `- Salary normalization tier: ${decision.tier}`,
  ];

  if (decision.city) {
    lines.push(`- Matched city profile: ${decision.city}`);
  }

  if (cityContext) {
    lines.push(`- Location context to respect: ${cityContext}`);
  }

  if (topRoleSummary) {
    lines.push(`- Student focused role: ${topRoleSummary.roleTitle} (${topRoleSummary.roleFamily})`);
    lines.push(`- Role trajectory insight: ${topRoleSummary.growthTo20LpaTimeline}`);
  }

  lines.push(isDiscoveryPhase
    ? '- Top exploratory role signals from internal knowledge base (no ranking disclosure in discovery):'
    : '- Top ranked role cards from internal knowledge base:');

  ranked.forEach((role, idx) => {
    const education = role.educationPath.slice(0, 2).join(' | ');
    const skills = role.requiredSkills.slice(0, 4).join(', ');
    const reasons = role.reasons.slice(0, 2).join(' | ');
    lines.push(`  ${idx + 1}. ${role.title} [${role.category}]`);
    if (!isDiscoveryPhase) {
      lines.push(`     - Match score: ${role.score}`);
    }
    lines.push(`     - Why retrieved: ${reasons || 'General relevance to context'}`);
    lines.push(`     - Typical paths: ${education || 'Path not available'}`);
    lines.push(`     - Core skills: ${skills || 'Skills not available'}`);
    lines.push(`     - Salary estimate (India): ${role.salaryRangeInr ?? 'Use role-family estimate only'}`);
    lines.push(`     - Salary estimate (location-normalized): ${role.normalizedSalaryRangeInr ?? role.salaryRangeInr ?? 'Not available'}`);
    lines.push(`     - Salary note: ${role.normalizedSalaryContext ?? 'No normalization note available'}`);
    lines.push(`     - Growth outlook: ${role.growthOutlook}`);
  });

  if (decision.clarifyingQuestion) {
    lines.push(`- Clarifying-question trigger (low confidence): ${decision.clarifyingQuestion}`);
    lines.push('- If role ambiguity remains, ask exactly this one clarifying question before narrowing options.');
  }

  if (isDiscoveryPhase) {
    lines.push('- Guardrail mode: Discovery phase is active (turn <= 25). Do not present final career ranking; use these as exploratory clusters only.');
  }

  lines.push('- Response policy with KB:');
  lines.push('  - Use retrieved roles as primary options before suggesting random alternatives.');
  lines.push('  - If confidence is low or context is ambiguous, ask one clarifying question before final narrowing.');
  lines.push('  - Keep salary values as estimates, mention city/tier/skill variance.');
  lines.push('  - Provide at least one low-risk backup path and one high-growth path when recommending choices.');

  return lines.join('\n');
}
