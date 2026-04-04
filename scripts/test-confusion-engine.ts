import { diagnoseConfusion } from '../src/lib/career-engine/confusionMatrix';

function runConfusionTests() {
  console.log('--- TESTING CONFUSION DIAGNOSIS ENGINE ---');

  const cases = [
    {
      name: 'The Pressured Student',
      confusion: 'I want to be an artist but dad wants me to prepare for NEET',
      stressors: 'force me to study 10 hours',
      familyPressure: 'parents want a doctor in the family'
    },
    {
      name: 'The Clueless Student',
      confusion: 'I do not know what options exist outside engineering',
      stressors: 'I am lost',
      familyPressure: 'none really'
    },
    {
      name: 'The Paralyzed Student (Fear)',
      confusion: 'I am studying BTech but I have 3 backlogs',
      stressors: 'I feel like a failure, terrible at coding, hopeless',         
      familyPressure: 'scared of telling them'
    },
    {
      name: 'The Overwhelmed Stream',
      confusion: 'I like photography, digital marketing, AI, and also event management',
      stressors: 'too many interests to pick from',
      familyPressure: ''
    }
  ];

  cases.forEach((test, idx) => {
    console.log(`\n>> Case ${idx + 1}: ${test.name}`);
    const diag = diagnoseConfusion(test.confusion, test.stressors, test.familyPressure);
    console.log(`Archetype Diagnosed: ${diag.archetype} (Confidence: ${diag.confidence})`);
    console.log(`Reasoning: ${diag.reasoning}`);
    console.log(`Protocol to Inject:\n  ${diag.counselingProtocol}`);
  });

  console.log('\n--- DIAGNOSIS TEST COMPLETE ---');
}

runConfusionTests();

