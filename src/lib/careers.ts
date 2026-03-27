import type { CareerProfile, TraitScores } from '@/types';

export const careerDatabase: CareerProfile[] = [
  {
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain software applications and systems.',
    required_traits: { analytical: 80, technical: 85, detail_oriented: 70, adaptability: 60 },
    growth_outlook: 'high',
    salary_range: '$90,000 - $180,000',
    required_skills: ['Programming', 'Problem Solving', 'System Design', 'Debugging'],
    education: "Bachelor's in CS or related field",
  },
  {
    title: 'Product Manager',
    category: 'Business',
    description: 'Define product vision, strategy, and roadmap while working cross-functionally.',
    required_traits: { leadership: 80, communication: 85, analytical: 70, empathy: 65 },
    growth_outlook: 'high',
    salary_range: '$100,000 - $200,000',
    required_skills: ['Strategy', 'Stakeholder Management', 'Data Analysis', 'User Research'],
    education: "Bachelor's in Business, CS, or related",
  },
  {
    title: 'UX Designer',
    category: 'Design',
    description: 'Create intuitive, accessible digital experiences through research-driven design.',
    required_traits: { creative: 85, empathy: 80, communication: 65, detail_oriented: 70 },
    growth_outlook: 'high',
    salary_range: '$80,000 - $150,000',
    required_skills: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
    education: "Bachelor's in Design, HCI, or related",
  },
  {
    title: 'Data Scientist',
    category: 'Technology',
    description: 'Extract insights from complex data using statistical analysis and machine learning.',
    required_traits: { analytical: 90, technical: 80, detail_oriented: 75, creative: 50 },
    growth_outlook: 'high',
    salary_range: '$95,000 - $175,000',
    required_skills: ['Statistics', 'Python/R', 'Machine Learning', 'Data Visualization'],
    education: "Master's in Data Science, Statistics, or CS",
  },
  {
    title: 'Management Consultant',
    category: 'Business',
    description: 'Advise organizations on strategy, operations, and organizational challenges.',
    required_traits: { analytical: 80, communication: 85, leadership: 70, adaptability: 75 },
    growth_outlook: 'medium',
    salary_range: '$85,000 - $200,000',
    required_skills: ['Strategy', 'Presentations', 'Problem Solving', 'Client Management'],
    education: 'MBA or top-tier undergraduate',
  },
  {
    title: 'Clinical Psychologist',
    category: 'Healthcare',
    description: 'Diagnose and treat mental health disorders through therapy and assessment.',
    required_traits: { empathy: 90, communication: 80, analytical: 65, adaptability: 60 },
    growth_outlook: 'medium',
    salary_range: '$75,000 - $130,000',
    required_skills: ['Active Listening', 'Assessment', 'Treatment Planning', 'Empathy'],
    education: 'Doctorate in Psychology (PsyD/PhD)',
  },
  {
    title: 'Marketing Director',
    category: 'Business',
    description: 'Lead marketing strategy, brand development, and campaign execution.',
    required_traits: { creative: 80, communication: 85, leadership: 75, analytical: 60 },
    growth_outlook: 'medium',
    salary_range: '$90,000 - $170,000',
    required_skills: ['Brand Strategy', 'Digital Marketing', 'Team Leadership', 'Analytics'],
    education: "Bachelor's in Marketing or Business",
  },
  {
    title: 'Mechanical Engineer',
    category: 'Engineering',
    description: 'Design and develop mechanical systems, from consumer products to industrial equipment.',
    required_traits: { technical: 85, analytical: 80, detail_oriented: 80, creative: 55 },
    growth_outlook: 'medium',
    salary_range: '$75,000 - $140,000',
    required_skills: ['CAD', 'Thermodynamics', 'Materials Science', 'Prototyping'],
    education: "Bachelor's in Mechanical Engineering",
  },
  {
    title: 'Entrepreneur / Startup Founder',
    category: 'Business',
    description: 'Build and scale new ventures from ideation to market.',
    required_traits: { leadership: 85, adaptability: 90, creative: 75, communication: 70 },
    growth_outlook: 'high',
    salary_range: '$0 - $500,000+',
    required_skills: ['Vision', 'Fundraising', 'Team Building', 'Resilience'],
    education: 'No formal requirement',
  },
  {
    title: 'Technical Writer',
    category: 'Communication',
    description: 'Create clear documentation for complex technical products and processes.',
    required_traits: { communication: 85, detail_oriented: 85, technical: 60, analytical: 55 },
    growth_outlook: 'medium',
    salary_range: '$65,000 - $120,000',
    required_skills: ['Writing', 'Technical Understanding', 'Information Architecture', 'Editing'],
    education: "Bachelor's in English, Communications, or Technical field",
  },
  {
    title: 'Human Resources Manager',
    category: 'People',
    description: 'Oversee employee relations, talent acquisition, and organizational development.',
    required_traits: { empathy: 80, communication: 80, leadership: 70, adaptability: 65 },
    growth_outlook: 'medium',
    salary_range: '$70,000 - $130,000',
    required_skills: ['Conflict Resolution', 'Recruiting', 'Employee Development', 'Policy Design'],
    education: "Bachelor's in HR, Business, or Psychology",
  },
  {
    title: 'Financial Analyst',
    category: 'Finance',
    description: 'Analyze financial data, build models, and advise on investment decisions.',
    required_traits: { analytical: 90, detail_oriented: 85, technical: 60, communication: 50 },
    growth_outlook: 'medium',
    salary_range: '$70,000 - $150,000',
    required_skills: ['Financial Modeling', 'Excel', 'Valuation', 'Reporting'],
    education: "Bachelor's in Finance, Economics, or Accounting",
  },
];

export function matchCareers(userTraits: TraitScores): { career: CareerProfile; score: number; alignment: Record<string, number> }[] {
  return careerDatabase
    .map((career) => {
      const alignment: Record<string, number> = {};
      let totalWeight = 0;
      let weightedScore = 0;

      Object.entries(career.required_traits).forEach(([trait, required]) => {
        const userScore = userTraits[trait as keyof TraitScores] || 0;
        const diff = Math.abs(userScore - (required as number));
        const traitScore = Math.max(0, 100 - diff * 1.5);
        alignment[trait] = Math.round(traitScore);
        const weight = (required as number) / 100;
        weightedScore += traitScore * weight;
        totalWeight += weight;
      });

      const score = Math.round(totalWeight > 0 ? weightedScore / totalWeight : 0);
      return { career, score, alignment };
    })
    .sort((a, b) => b.score - a.score);
}
