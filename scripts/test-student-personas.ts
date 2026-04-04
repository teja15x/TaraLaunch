import { buildCareerAgentSystemPrompt } from '../src/lib/career-agent/prompt';

function runPersonaTest() {
  console.log('--- TESTING STUDENT PERSONAS & CONTRADICTION GUARDRAILS ---');

  // Scenario 1: The Deluded Student
  const deludedPrompt = buildCareerAgentSystemPrompt({
    ageTier: 'navigator',
    preferredLanguage: 'en-IN',
    conversationStyle: 'neutral',
    scriptPreference: 'auto',
    currentTurnNumber: 3,
    studentName: 'Rahul',
    selectedRole: 'AI/ML Engineer',
    journeyDay: 1,
    studentIntakeContext: '- Current stage: BTech 2nd Year Tier-3\n- Financial constraints: High (Needs immediate earning)\n- Interests: Wants 40 LPA job but hates Math and Coding',
  });

  console.log('\n>> Scenario 1: The Deluded Student (Hates Math but wants AI/ML & 40LPA)');
  console.log('--- SYSTEM PROMPT SNIPPET ---');
  // Just print the lines that contain our cultural and contradiction rules
  const deludedLines = deludedPrompt.split('\n').filter(line => 
    line.includes('CULTURAL PERSONA') || 
    line.includes('CONTRADICTION') ||
    line.includes('TCS/Infosys') ||
    line.includes('foreign') ||
    line.includes('Student currently thinks')
  );
  console.log(deludedLines.join('\n'));

  // Scenario 2: The Confused Student
  const confusedPrompt = buildCareerAgentSystemPrompt({
    ageTier: 'discoverer',
    preferredLanguage: 'hi-IN',
    conversationStyle: 'hinglish',
    scriptPreference: 'auto',
    currentTurnNumber: 1,
    studentName: 'Priya',
    selectedRole: null,
    journeyDay: 1,
    studentIntakeContext: '- Current stage: Class 12th\n- Confusion: Parents want Medicine, I want Design\n- Stressors: High family pressure',
  });

  console.log('\n>> Scenario 2: The Confused Student (Parent Pressure vs Passion)');
  console.log('--- SYSTEM PROMPT SNIPPET ---');
  const confusedLines = confusedPrompt.split('\n').filter(line => 
    line.includes('CULTURAL') || 
    line.includes('family') ||
    line.includes('Student has not selected') ||
    line.includes('beta')
  );
  console.log(confusedLines.join('\n'));
}

runPersonaTest();
