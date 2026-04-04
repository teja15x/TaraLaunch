import { careerDatabase } from '../src/data/careers';
import { applyMarketRealities } from '../src/lib/career-engine/marketReality';

async function runEngineTest() {
  console.log('--- MARKET REALITY ENGINE TEST ---');
  
  // 1. Get our mock careers (Software Engineer, Data Scientist, etc.)
  const topRoles = careerDatabase.slice(0, 3);
  
  console.log('Testing with Top Roles:', topRoles.map(r => r.title).join(', '));
  
  // 2. Simulate a user from a Tier-3 college with tight affordability constraints
  console.log('\n>> Scenario 1: User from Tier-3 college, Tight Affordability (e.g. Needs immediate earning)');
  let results = applyMarketRealities(topRoles, {
    affordability_level: 'tight',
    tier: 'tier3'
  });
  
  results.forEach(r => {
    console.log(`\nRole ID: ${r.careerId}`);
    console.log(`Adjusted Salary: ${r.adjusted_salary_inr}`);
    console.log(`Reality Checks:`);
    r.reality_check_notes.forEach(note => console.log(`  - ${note}`));
    if (r.reality_check_notes.length === 0) console.log('  - OK (No critical market warnings)');
  });

  // 3. Simulate an aspirational / Tier-1 reality check
  console.log('\n>> Scenario 2: User from Tier-1 college, Aspirational / Accessible Affordability');
  let resultsTier1 = applyMarketRealities(topRoles, {
    affordability_level: 'accessible',
    tier: 'tier1'
  });
  
  resultsTier1.forEach(r => {
    console.log(`\nRole ID: ${r.careerId}`);
    console.log(`Adjusted Salary: ${r.adjusted_salary_inr}`);
    console.log(`Reality Checks:`);
    r.reality_check_notes.forEach(note => console.log(`  - ${note}`));
    if (r.reality_check_notes.length === 0) console.log('  - OK (No critical market warnings)');
  });

  console.log('\n--- END OF TEST ---');
}

runEngineTest();

