/**
 * Scenario Parser and Branching Engine for Career-Quest Game
 * Non-linear decision scenarios with trait extraction and consequence feedback
 */

export interface ScenarioChoice {
  id: string;
  text: string;
  traitWeights?: Record<string, number>; // RIASEC/Gardner weights by choice
  consequence: string; // 1-2 sentence feedback
  nextNodeId?: string | null; // Where this choice leads; null = end
}

export interface ScenarioNode {
  id: string;
  type: 'decision' | 'consequence' | 'end';
  title: string;
  description: string;
  choices: ScenarioChoice[];
}

export interface Scenario {
  id: string;
  name: string;
  emoji: string;
  description: string;
  theme: string; // "board-vs-stream", "coaching-dilemma", etc.
  duration: string;
  nodes: ScenarioNode[];
  traitTargets: Record<string, number>; // Traits this scenario focuses on
}

export interface ScenarioPlaythrough {
  scenarioId: string;
  pathTaken: string[]; // Chain of choice IDs
  traitsDetected: Record<string, number>; // Accumulated traits from path
  completedAt: string;
}

/**
 * Trait extraction from choice path.
 * Accumulates trait weights across all choices in the path.
 */
export function extractTraitsFromPath(
  scenario: Scenario,
  choiceIds: string[]
): Record<string, number> {
  const traits: Record<string, number> = {};

  // Walk through nodes, collect trait weights from chosen options
  let currentNodeId = scenario.nodes[0]?.id;
  const visitedNodes = new Set<string>();

  for (const choiceId of choiceIds) {
    if (visitedNodes.has(currentNodeId)) break; // Prevent infinite loops
    visitedNodes.add(currentNodeId);

    const currentNode = scenario.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) break;

    const chosenOption = currentNode.choices.find(c => c.id === choiceId);
    if (!chosenOption) break;

    // Accumulate trait weights from this choice
    if (chosenOption.traitWeights) {
      Object.entries(chosenOption.traitWeights).forEach(([trait, weight]) => {
        traits[trait] = (traits[trait] || 0) + weight;
      });
    }

    // Move to next node
    currentNodeId = chosenOption.nextNodeId || '';
  }

  return traits;
}

/**
 * India-First Scenario Library
 * Rooted in real Indian student decision contexts
 */
export const INDIA_FIRST_SCENARIOS: Scenario[] = [
  {
    id: 'board-vs-stream',
    name: 'Board vs. Stream Path',
    emoji: '📚',
    description: 'Decide between JEE/NEET track, Commerce/Arts, or alternative paths.',
    theme: 'board-vs-stream',
    duration: '5 min',
    traitTargets: {
      realistic: 0.3,
      investigative: 0.4,
      enterprising: 0.3,
    },
    nodes: [
      {
        id: 'start-board',
        type: 'decision',
        title: 'What matters most for your future?',
        description:
          'Your 10th boards are done. Now you choose a stream for 11-12. What drives your decision?',
        choices: [
          {
            id: 'choice-high-salary',
            text: '💰 Highest possible salary (Engineering or Medicine)',
            traitWeights: { enterprising: 0.4, realistic: 0.3, investigative: 0.3 },
            consequence:
              'You lean toward JEE or NEET. This reveals ambition + focus on market demand.',
            nextNodeId: 'decision-coaching',
          },
          {
            id: 'choice-passion',
            text: '❤️ A subject I\'m truly passionate about',
            traitWeights: { artistic: 0.4, investigative: 0.2, social: 0.2 },
            consequence:
              'You value intrinsic motivation. This reveals creativity + alignment with personal values.',
            nextNodeId: 'decision-coaching',
          },
          {
            id: 'choice-flexibility',
            text: '🎯 A path with multiple exit options',
            traitWeights: { social: 0.3, conventional: 0.3, enterprising: 0.2 },
            consequence:
              'You prioritize flexibility. This reveals adaptability + risk awareness.',
            nextNodeId: 'decision-coaching',
          },
        ],
      },
      {
        id: 'decision-coaching',
        type: 'decision',
        title: 'How will you prepare?',
        description:
          'Now that you\'ve picked your stream, coaching or self-study: which fits your learning style?',
        choices: [
          {
            id: 'choice-coaching-center',
            text: '🏫 Coaching center (2 hours daily, structured)',
            traitWeights: { conventional: 0.4, social: 0.3, realistic: 0.3 },
            consequence:
              'You chose structure + peer support. This reveals discipline + collaborative learning.',
            nextNodeId: 'end-board',
          },
          {
            id: 'choice-self-study',
            text: '📖 Self-study (YouTube, books, online)',
            traitWeights: { investigative: 0.4, artistic: 0.2, enterprising: 0.2 },
            consequence:
              'You chose independence. This reveals self-confidence + liking for personalized pacing.',
            nextNodeId: 'end-board',
          },
          {
            id: 'choice-hybrid',
            text: '⚡ Mix of coaching + self-study (flexible)',
            traitWeights: { enterprising: 0.3, investigative: 0.3, realistic: 0.3 },
            consequence:
              'You chose a balanced approach. This reveals pragmatism + ability to adapt.',
            nextNodeId: 'end-board',
          },
        ],
      },
      {
        id: 'end-board',
        type: 'end',
        title: 'Your Path is Locked In',
        description:
          'Based on your choices, your stream and prep style are now clear. Next: Build your entrance exam roadmap.',
        choices: [],
      },
    ],
  },
  {
    id: 'parent-pressure',
    name: 'Family vs. Passion',
    emoji: '👨‍👩‍👧',
    description:
      'Navigate conflict between family expectations (engineering/medicine) and personal interest.',
    theme: 'parent-pressure',
    duration: '6 min',
    traitTargets: {
      social: 0.3,
      enterprising: 0.3,
      conventional: 0.4,
    },
    nodes: [
      {
        id: 'start-parent',
        type: 'decision',
        title: 'Family vs. Your Dream',
        description:
          'Your parents want Engineering. You\'re drawn to psychology or design. How do you respond to their pressure?',
        choices: [
          {
            id: 'choice-comply',
            text: '✅ Follow their path (Engineering) — I\'ll adjust later',
            traitWeights: { conventional: 0.5, social: 0.3, realistic: 0.2 },
            consequence:
              'You chose family harmony. This reveals loyalty + willingness to delay personal needs.',
            nextNodeId: 'conflict-resolve',
          },
          {
            id: 'choice-negotiate',
            text: '🤝 Negotiate: Take engineering + pursue design as hobby',
            traitWeights: { enterprising: 0.4, social: 0.3, artistic: 0.3 },
            consequence:
              'You sought a middle ground. This reveals diplomacy + creative problem-solving.',
            nextNodeId: 'conflict-resolve',
          },
          {
            id: 'choice-assert',
            text: '💪 Stand firm: Follow my passion, ask for time to prove it',
            traitWeights: { investigative: 0.3, artistic: 0.4, enterprising: 0.3 },
            consequence:
              'You chose authenticity. This reveals courage + confidence in your judgment.',
            nextNodeId: 'conflict-resolve',
          },
        ],
      },
      {
        id: 'conflict-resolve',
        type: 'decision',
        title: 'How do you move forward?',
        description:
          'Whatever you chose, how will you handle the ongoing tension with your family?',
        choices: [
          {
            id: 'choice-counselor',
            text: '💬 Involve a counselor or elder to mediate',
            traitWeights: { social: 0.5, conventional: 0.3 },
            consequence: 'You sought external support. This reveals wisdom + emotional intelligence.',
            nextNodeId: 'end-parent',
          },
          {
            id: 'choice-performance',
            text: '📊 Let your performance speak for itself',
            traitWeights: { realistic: 0.4, investigative: 0.3, enterprising: 0.3 },
            consequence:
              'You chose action over words. This reveals confidence + results-orientation.',
            nextNodeId: 'end-parent',
          },
          {
            id: 'choice-timeout',
            text: '⏸️ Take a gap year to explore before deciding',
            traitWeights: { artistic: 0.3, investigative: 0.4, social: 0.2 },
            consequence: 'You chose time for reflection. This reveals maturity + willingness to pause.',
            nextNodeId: 'end-parent',
          },
        ],
      },
      {
        id: 'end-parent',
        type: 'end',
        title: 'Your Choice Reflects Your Values',
        description:
          'Your decision reveals how you balance family, passion, and practicality. This will guide your career path.',
        choices: [],
      },
    ],
  },
  {
    id: 'competition-vs-profile',
    name: 'Internship vs. Certificate Dilemma',
    emoji: '🏆',
    description:
      'Choose between competitive internship, resume certificate, or entrance exam focus in limited time.',
    theme: 'competition-vs-profile',
    duration: '5 min',
    traitTargets: {
      enterprising: 0.4,
      realistic: 0.3,
      investigative: 0.3,
    },
    nodes: [
      {
        id: 'start-competition',
        type: 'decision',
        title: 'You have 6 weeks. Which investment pays off?',
        description:
          'Option 1: Apply for competitive startup internship (10% acceptance). Option 2: Complete a resume certificate (2 weeks, guaranteed). Option 3: Focus all 6 weeks on mock exams.',
        choices: [
          {
            id: 'choice-risk-internship',
            text: '🚀 Go for the competitive startup internship (risky, high reward)',
            traitWeights: { enterprising: 0.5, investigative: 0.2, realistic: 0.2 },
            consequence:
              'You bet on optionality. This reveals ambition + comfort with risk. If successful, massive boost to profile.',
            nextNodeId: 'outcome-competition',
          },
          {
            id: 'choice-safe-cert',
            text: '✅ Play it safe: Complete the guaranteed certificate (reliable)',
            traitWeights: { conventional: 0.4, realistic: 0.4 },
            consequence:
              'You chose reliability. This reveals pragmatism + risk aversion. Safer resume boost.',
            nextNodeId: 'outcome-competition',
          },
          {
            id: 'choice-exam-focus',
            text: '📖 Laser focus: All 6 weeks on mock exams + entrance prep',
            traitWeights: { investigative: 0.5, conventional: 0.3, realistic: 0.2 },
            consequence:
              'You prioritized immediate goal. This reveals discipline + focus. Score improvement likely.',
            nextNodeId: 'outcome-competition',
          },
        ],
      },
      {
        id: 'outcome-competition',
        type: 'end',
        title: 'Your Decision Shapes Your Odds',
        description:
          'Your choice reflects how much you&apos;re willing to risk for a stronger profile. Both paths lead to success; timing and risk appetite matter.',
        choices: [],
      },
    ],
  },
];

/**
 * Find a scenario by ID
 */
export function getScenario(scenarioId: string): Scenario | undefined {
  return INDIA_FIRST_SCENARIOS.find(s => s.id === scenarioId);
}

/**
 * Get all scenario summaries for display (without full nodes)
 */
export function getScenarioSummaries() {
  return INDIA_FIRST_SCENARIOS.map(s => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    description: s.description,
    duration: s.duration,
  }));
}
