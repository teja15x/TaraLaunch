import { buildRecommendationGateDecision } from '../src/lib/career-agent/recommendationGate';

type TestCase = {
  name: string;
  condition: boolean;
  detail: string;
};

const results: TestCase[] = [];

function assertCase(name: string, condition: boolean, detail: string) {
  results.push({ name, condition, detail });
}

console.log('\nRecommendation gate test run\n');

const discoveryDecision = buildRecommendationGateDecision({
  currentTurnNumber: 8,
  detectedStage: 'class 10',
  assessmentProgress: 20,
  completedGamesCount: 0,
  hasConstraintProfile: false,
  hasFamilyContext: false,
  unresolvedContradictionsCount: 0,
  unresolvedHighContradictionsCount: 0,
  hasRoleFocus: false,
  retrievalConfidence: 40,
});

assertCase(
  'Discovery should be locked',
  !discoveryDecision.isUnlocked,
  `isUnlocked=${discoveryDecision.isUnlocked}`
);
assertCase(
  'Discovery stage inferred',
  discoveryDecision.stage === 'discovery',
  `stage=${discoveryDecision.stage}`
);
assertCase(
  'Discovery has blockers',
  discoveryDecision.blockingGates.length > 0,
  `blockers=${discoveryDecision.blockingGates.length}`
);

const narrowingDecision = buildRecommendationGateDecision({
  currentTurnNumber: 34,
  detectedStage: 'in college',
  assessmentProgress: 82,
  completedGamesCount: 1,
  hasConstraintProfile: true,
  hasFamilyContext: false,
  unresolvedContradictionsCount: 1,
  unresolvedHighContradictionsCount: 0,
  hasRoleFocus: true,
  retrievalConfidence: 78,
});

assertCase(
  'Narrowing should still be locked due to blockers',
  !narrowingDecision.isUnlocked,
  `isUnlocked=${narrowingDecision.isUnlocked}`
);
assertCase(
  'Narrowing stage inferred',
  narrowingDecision.stage === 'narrowing',
  `stage=${narrowingDecision.stage}`
);
assertCase(
  'Contradiction blocker present',
  narrowingDecision.blockingGates.some((item) => item.name === 'contradictions'),
  `blockers=${narrowingDecision.blockingGates.map((item) => item.name).join(',')}`
);

const recommendationDecision = buildRecommendationGateDecision({
  currentTurnNumber: 52,
  detectedStage: 'graduated',
  assessmentProgress: 88,
  completedGamesCount: 3,
  hasConstraintProfile: true,
  hasFamilyContext: true,
  unresolvedContradictionsCount: 0,
  unresolvedHighContradictionsCount: 0,
  hasRoleFocus: true,
  retrievalConfidence: 84,
});

assertCase(
  'Recommendation should unlock when all gates are met',
  recommendationDecision.isUnlocked,
  `isUnlocked=${recommendationDecision.isUnlocked}`
);
assertCase(
  'Recommendation stage inferred',
  recommendationDecision.stage === 'recommendation',
  `stage=${recommendationDecision.stage}`
);
assertCase(
  'No blockers when unlocked',
  recommendationDecision.blockingGates.length === 0,
  `blockers=${recommendationDecision.blockingGates.length}`
);

const passed = results.filter((item) => item.condition).length;
const total = results.length;

results.forEach((item) => {
  console.log(`${item.condition ? 'PASS' : 'FAIL'} | ${item.name} | ${item.detail}`);
});

console.log(`\n${passed}/${total} checks passed`);

if (passed !== total) {
  process.exit(1);
}

console.log('Recommendation gate tests passed.');