import type { ExperienceDefinition } from '@/lib/tara/types';

export const TARA_EXPERIENCES: ExperienceDefinition[] = [
  {
    id: 'product-management-launch-crunch',
    version: 1,
    title: 'Launch Crunch: Product Management',
    domain: 'Product',
    career: 'Product Management',
    difficulty: 'intermediate',
    objective: 'Handle trade-offs under uncertainty while balancing users, business, and team constraints.',
    scenario:
      'You own a high-impact feature. Engineering says 3 weeks. Marketing promised next Friday. A major customer says this feature is critical. CEO asks if launch can still happen Friday.',
    reflectionQuestions: [
      'What mattered most when you made your first decision?',
      'What were you optimizing for?',
      'What information did you ignore?',
      'What would have changed your decision?',
      'What surprised you in the outcome?',
    ],
    steps: [
      {
        id: 'pm-1',
        prompt:
          'Friday launch is publicly announced. Engineering warns quality risk if rushed. What do you do first?',
        knownContext:
          'Known now: launch date announced, engineering estimate is 3 weeks, enterprise customer is waiting, CEO wants confidence.',
        choices: [
          {
            id: 'pm-1-a',
            label: 'Commit to Friday with reduced scope and strict rollback plan.',
            consequence:
              'Marketing keeps momentum, but engineering warns some critical edge cases will remain untested.',
            nextStepId: 'pm-2a',
            worldStatePatch: { strategy: 'speed', trustRisk: 'medium', marketSignal: 'strong' },
            observations: ['prioritization under pressure', 'risk acceptance', 'delivery focus'],
          },
          {
            id: 'pm-1-b',
            label: 'Negotiate delay and align all stakeholders on revised launch with quality threshold.',
            consequence:
              'Customer success says delay may upset key account, but engineering morale improves and defect risk drops.',
            nextStepId: 'pm-2b',
            worldStatePatch: { strategy: 'quality', trustRisk: 'low', marketSignal: 'mixed' },
            observations: ['stakeholder alignment', 'quality orientation', 'long-term thinking'],
          },
          {
            id: 'pm-1-c',
            label: 'Escalate to CEO and ask for decision without proposing a clear recommendation.',
            consequence:
              'You avoid ownership risk, but leadership questions your judgment under ambiguity.',
            nextStepId: 'pm-2c',
            worldStatePatch: { strategy: 'escalation', trustRisk: 'high', marketSignal: 'unclear' },
            observations: ['ambiguity discomfort', 'ownership hesitation', 'authority dependence'],
          },
        ],
      },
      {
        id: 'pm-2a',
        prompt:
          'Launch eve: QA reports a bug impacting 8% of users, including enterprise workflows. What now?',
        knownContext: 'Known now: you chose speed-first. Public expectation is high. Bug severity is moderate-to-high.',
        choices: [
          {
            id: 'pm-2a-a',
            label: 'Launch anyway, monitor, and patch within 48 hours.',
            consequence:
              'Launch happens on time, but enterprise customer reports workflow breakdown and trust dips.',
            nextStepId: 'pm-end',
            observations: ['bias for action', 'high risk tolerance', 'short-term commitment protection'],
          },
          {
            id: 'pm-2a-b',
            label: 'Pause launch by 5 days, communicate transparently, and ship tested build.',
            consequence:
              'Short-term backlash, but customer trusts your transparency and defect rate drops sharply.',
            nextStepId: 'pm-end',
            observations: ['adaptive correction', 'trust management', 'evidence-based pivot'],
          },
        ],
      },
      {
        id: 'pm-2b',
        prompt:
          'Two days later, competitor announces a similar feature. Sales panics. How do you respond?',
        knownContext: 'Known now: you chose quality-first and delayed launch. Competitive pressure has increased.',
        choices: [
          {
            id: 'pm-2b-a',
            label: 'Accelerate MVP slice for top customer segment while preserving core quality checks.',
            consequence:
              'You regain market narrative while containing quality risk in a smaller release scope.',
            nextStepId: 'pm-end',
            observations: ['balanced trade-off handling', 'segmentation thinking', 'adaptive planning'],
          },
          {
            id: 'pm-2b-b',
            label: 'Hold original timeline and focus on superior reliability over speed narrative.',
            consequence:
              'Short-term market noise rises, but retention improves after release due to reliability.',
            nextStepId: 'pm-end',
            observations: ['conviction under pressure', 'long-horizon judgment', 'stability preference'],
          },
        ],
      },
      {
        id: 'pm-2c',
        prompt:
          'CEO asks for your recommendation now. Team confidence is low due to mixed signals. What do you do?',
        knownContext:
          'Known now: leadership wants clarity, team is uncertain, and your earlier escalation reduced confidence in ownership.',
        choices: [
          {
            id: 'pm-2c-a',
            label: 'Present a decision framework with risks, then make a clear recommendation.',
            consequence:
              'Leadership sees recovery in your judgment and team alignment improves.',
            nextStepId: 'pm-end',
            observations: ['recovery behavior', 'structured thinking', 'communication under pressure'],
          },
          {
            id: 'pm-2c-b',
            label: 'Ask for more time and additional analysis before committing to a path.',
            consequence:
              'Risk of paralysis increases and key stakeholders seek direction elsewhere.',
            nextStepId: 'pm-end',
            observations: ['analysis paralysis risk', 'decision latency', 'risk avoidance'],
          },
        ],
      },
      {
        id: 'pm-end',
        prompt: 'The release phase is over. Time to reflect on your decision process and outcomes.',
        knownContext: 'Known now: outcomes are visible. Reflection quality now determines learning quality.',
        choices: [],
      },
    ],
  },
  {
    id: 'software-engineering-system-debug',
    version: 1,
    title: 'System Debug Sprint',
    domain: 'Engineering',
    career: 'Software Engineering',
    difficulty: 'starter',
    objective: 'Practice debugging and trade-off judgment in production scenarios.',
    scenario: 'A production outage appears only on high-load traffic and logs are incomplete.',
    reflectionQuestions: ['What debugging strategy did you choose and why?'],
    starterOnly: true,
    steps: [],
  },
  {
    id: 'data-ai-model-drift',
    version: 1,
    title: 'Model Drift Decision Lab',
    domain: 'Data / AI',
    career: 'Data & AI',
    difficulty: 'starter',
    objective: 'Balance model quality, fairness, and business urgency.',
    scenario: 'Your model accuracy dropped after user behavior shifted in a new region.',
    reflectionQuestions: ['How would you validate data shift before retraining?'],
    starterOnly: true,
    steps: [],
  },
  {
    id: 'design-research-conflict',
    version: 1,
    title: 'Design Research Conflict',
    domain: 'Design',
    career: 'Design / UX Research',
    difficulty: 'starter',
    objective: 'Navigate user needs vs business goals in design decisions.',
    scenario: 'User interviews conflict with executive assumptions before a release.',
    reflectionQuestions: ['How would you defend the user perspective with evidence?'],
    starterOnly: true,
    steps: [],
  },
  {
    id: 'entrepreneurship-runway-crisis',
    version: 1,
    title: 'Runway Crisis Simulation',
    domain: 'Entrepreneurship',
    career: 'Entrepreneurship',
    difficulty: 'starter',
    objective: 'Handle cash runway, growth pressure, and team morale decisions.',
    scenario: 'You have 4 months runway with rising churn and investor pressure.',
    reflectionQuestions: ['Which survival lever would you pull first and why?'],
    starterOnly: true,
    steps: [],
  },
];

export function getExperienceById(experienceId: string) {
  return TARA_EXPERIENCES.find((experience) => experience.id === experienceId);
}
