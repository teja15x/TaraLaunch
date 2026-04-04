export type ConfusionArchetype = 
  | 'parent_vs_passion' 
  | 'information_void' 
  | 'multi_potentialite' 
  | 'fear_of_failure' 
  | 'herd_mentality' 
  | 'unclear';

export interface DiagnosisResult {
  archetype: ConfusionArchetype;
  confidence: number;
  reasoning: string;
  counselingProtocol: string;
}

export function diagnoseConfusion(
  confusionText?: string,
  stressorsText?: string,
  familyPressureText?: string
): DiagnosisResult {
  const c = (confusionText || '').toLowerCase();
  const s = (stressorsText || '').toLowerCase();
  const f = (familyPressureText || '').toLowerCase();
  
  const combined = `${c} ${s} ${f}`;
  
  // Weights calculation
  let scores = {
    parent_vs_passion: 0,
    information_void: 0,
    multi_potentialite: 0,
    fear_of_failure: 0,
    herd_mentality: 0
  };

  // 1. Parent vs Passion
  if (combined.match(/parent|dad|mom|father|mother|family|force|pressure|want me to/)) scores.parent_vs_passion += 3;
  if (combined.match(/but i want|versus|vs|against my will|different/)) scores.parent_vs_passion += 2;

  // 2. Information Void
  if (combined.match(/don't know|clueless|no idea|what jobs|what options|what is|how to/)) scores.information_void += 3;
  if (combined.match(/lost|confused/)) scores.information_void += 1;

  // 3. Multi-potentialite
  if (combined.match(/many|multiple|everything|both|and also|too many interests/)) scores.multi_potentialite += 3;
  if (c.includes(',') || c.includes(' and ')) scores.multi_potentialite += 1;

  // 4. Fear of Failure
  if (combined.match(/fear|fail|bad at|terrible|low marks|backlogs|stress|scared|anxious|ruined|hopeless/)) scores.fear_of_failure += 3;

  // 5. Herd Mentality
  if (combined.match(/everyone is|my friends|peer|crowd|trending|package|everyone is doing/)) scores.herd_mentality += 3;
  if (combined.match(/safe|easy/)) scores.herd_mentality += 1;

  let highestScore = 0;
  let topArchetype: ConfusionArchetype = 'unclear';

  for (const [archetype, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      topArchetype = archetype as ConfusionArchetype;
    }
  }

  // If we don't have strong evidence, default to unclear
  if (highestScore < 3) {
    topArchetype = 'unclear';
  }

  // Protocols mapping
  const protocols: Record<ConfusionArchetype, string> = {
    parent_vs_passion: '[DIAGNOSIS: PARENT VS PASSION] The student is caught between family expectations and personal interest. Protocol: 1. Validate their feelings. 2. Do not villainize parents. 3. Help them build a data-backed case (salaries, growth) for their passion to convince parents, or find a middle-ground career.',
    information_void: '[DIAGNOSIS: INFORMATION VOID] The student lacks basic career awareness. Protocol: 1. Do not ask them what they want to do; they don\'t know. 2. Map out 3 broad, distinct industry landscapes (e.g., Tech, Creative, Operations). 3. Use "Day in the Life" descriptions to gauge their immediate reaction.',
    multi_potentialite: '[DIAGNOSIS: MULTI-POTENTIALITE] The student is overwhelmed by too many interests. Protocol: 1. Stop adding options. 2. Force elimination using constraints (e.g., "Which of these would you do even if it paid less?" or "Do you want to sit at a desk all day?"). 3. Merge interests (e.g., tech + design = UI/UX).',
    fear_of_failure: '[DIAGNOSIS: FEAR OF FAILURE] The student is paralyzed by academic pressure, low marks, or fear of the future. Protocol: 1. Perform emotional triage. Validate that marks/tier do not dictate their entire life. 2. De-stigmatize Tier-2/3 colleges. 3. Focus entirely on "Skill over Brand" and achievable, incremental 30-day goals.',
    herd_mentality: '[DIAGNOSIS: HERD MENTALITY] The student is following the crowd (e.g., CSE/IT) without intrinsic alignment. Protocol: 1. Challenge the status quo gently. 2. Highlight market saturation and extreme competition in mainstream roles. 3. Prompt them to discover lateral/niche careers that pay well but have less competition.',
    unclear: ''
  };

  return {
    archetype: topArchetype,
    confidence: highestScore > 5 ? 0.9 : highestScore >= 3 ? 0.7 : 0.2,
    reasoning: `Highest score (${highestScore}) for ${topArchetype}`,
    counselingProtocol: protocols[topArchetype]
  };
}