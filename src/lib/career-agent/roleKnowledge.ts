import { CAREER_ROLE_OPTIONS } from '@/data/careerRoles';
import { careerDatabase } from '@/data/careers';

type RoleFamily =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'law-governance'
  | 'design-creative'
  | 'business-management'
  | 'engineering-core'
  | 'education-research'
  | 'hospitality-services'
  | 'sports-performance'
  | 'media-communication'
  | 'aviation-maritime'
  | 'psychology-counseling'
  | 'public-sector'
  | 'exploration';

interface FamilyProfile {
  roleSummary: string;
  dayToDay: string[];
  bestBooks: string[];
  salaryByTier: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  growthTo20LpaTimeline: string;
  companySwitchGuidance: string;
  effortLevers: string[];
  communitySignals: string[];
}

interface CollegeGuidanceProfile {
  preferredPrograms: string[];
  keyEntranceRoutes: string[];
  shortlistRules: string[];
}

export interface RoleKnowledgeSummary {
  roleTitle: string;
  roleFamily: RoleFamily;
  roleSummary: string;
  dayToDay: string[];
  bestBooks: string[];
  salaryByTier: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  growthTo20LpaTimeline: string;
  companySwitchGuidance: string;
  effortLevers: string[];
  communitySignals: string[];
  salaryRangeReference?: string;
  collegeGuidance: CollegeGuidanceProfile;
}

const DEFAULT_COLLEGE_SELECTION_RULES = [
  'Build shortlist as Reach, Match, and Safe buckets instead of one dream college list.',
  'Prioritize role-fit and branch quality before pure college brand obsession.',
  'Evaluate fees, scholarships, hostel and city living cost with realistic family affordability.',
  'Check placement quality by median outcomes, internship pipeline, and alumni depth, not only top outlier packages.',
  'Use exam-score fit first. If score is low, create parallel backup routes and skill-first alternatives.',
];

const COLLEGE_GUIDANCE_BY_FAMILY: Record<RoleFamily, CollegeGuidanceProfile> = {
  technology: {
    preferredPrograms: ['BTech CSE/IT/AI/DS', 'BSc CS + MCA', 'BCA + strong internships'],
    keyEntranceRoutes: ['JEE Main/Advanced', 'State CET routes', 'Private entrance routes (institution specific)'],
    shortlistRules: [
      'For software/data tracks, branch and coding ecosystem often matter more than college name alone.',
      'Give preference to colleges with strong coding clubs, hackathons, internships, and active alumni network.',
    ],
  },
  finance: {
    preferredPrograms: ['BCom/BBA', 'CA/CS/CMA pathways', 'Economics/Finance programs'],
    keyEntranceRoutes: ['CUET and university-specific admissions', 'CA/CS/CMA foundation routes', 'MBA entrance routes later (CAT/XAT etc.)'],
    shortlistRules: [
      'For finance, credentials and consistency can outweigh tier after early years.',
      'Prefer colleges where internship exposure and commerce mentorship are active.',
    ],
  },
  healthcare: {
    preferredPrograms: ['MBBS/BDS', 'BPharm/PharmD', 'Nursing/Physiotherapy/Allied Health'],
    keyEntranceRoutes: ['NEET-UG', 'State counseling routes', 'Institution-specific allied-health admissions'],
    shortlistRules: [
      'For healthcare, accreditation, clinical exposure, and hospital tie-ups are critical.',
      'Do not choose only by campus glamour; evaluate patient load and training quality.',
    ],
  },
  'law-governance': {
    preferredPrograms: ['BA LLB integrated', 'LLB after graduation', 'Specialized legal diplomas'],
    keyEntranceRoutes: ['CLAT/AILET and related law entrances', 'State/private law college admissions'],
    shortlistRules: [
      'Law growth depends strongly on internships, writing quality, and mentoring chambers.',
      'Prefer colleges with active moot courts, internships, and litigation/corporate exposure.',
    ],
  },
  'design-creative': {
    preferredPrograms: ['BDes', 'BFA', 'Design-focused diploma pathways'],
    keyEntranceRoutes: ['NID/NIFT/UCEED and institution-specific design entrances'],
    shortlistRules: [
      'For design, portfolio outcomes and studio culture matter more than rank labels alone.',
      'Select institutions with strong industry projects, internships, and portfolio reviews.',
    ],
  },
  'business-management': {
    preferredPrograms: ['BBA/BMS', 'BCom + management minor', 'Any degree + management route later'],
    keyEntranceRoutes: ['CUET and institution-specific admissions', 'IPMAT and integrated management routes', 'MBA entrances later'],
    shortlistRules: [
      'Choose colleges with strong internship pipelines and industry mentoring.',
      'For business tracks, communication ecosystem and peer network quality matter a lot.',
    ],
  },
  'engineering-core': {
    preferredPrograms: ['BTech core branches', 'Diploma + lateral entry', 'Core plus software hybrid tracks'],
    keyEntranceRoutes: ['JEE/State CET routes', 'Polytechnic and lateral entry pathways'],
    shortlistRules: [
      'In core engineering, labs, faculty depth, and industry tie-ups are crucial.',
      'If college tier is lower, plan parallel skill stack early (CAD/data/software tools).',
    ],
  },
  'education-research': {
    preferredPrograms: ['BA/BSc with subject depth', 'BEd route', 'Integrated research pathways'],
    keyEntranceRoutes: ['CUET/university admissions', 'NET/SET and higher-study routes later'],
    shortlistRules: [
      'Pick institutions with strong subject faculty and teaching/research culture.',
      'Long-term growth depends on higher credentials and output consistency.',
    ],
  },
  'hospitality-services': {
    preferredPrograms: ['Hotel management programs', 'Culinary tracks', 'Event and service operations tracks'],
    keyEntranceRoutes: ['NCHM routes and institution-specific admissions'],
    shortlistRules: [
      'For hospitality, practical training and internship quality are major differentiators.',
      'Prefer institutions with strong brand tie-ups and placement channels.',
    ],
  },
  'sports-performance': {
    preferredPrograms: ['Sports science', 'Physical education', 'Performance coaching and analytics tracks'],
    keyEntranceRoutes: ['Sports quota routes and institution-specific admissions'],
    shortlistRules: [
      'Assess coaching quality, facilities, and competition access before selecting institute.',
      'Keep an adjacent backup track for income stability while building performance career.',
    ],
  },
  'media-communication': {
    preferredPrograms: ['Journalism/mass communication', 'Media production', 'Digital communication tracks'],
    keyEntranceRoutes: ['CUET and institution-specific media admissions'],
    shortlistRules: [
      'Portfolio and internships dominate outcomes; choose ecosystem over brochure claims.',
      'Prefer colleges with active media labs, student publications, and industry mentoring.',
    ],
  },
  'aviation-maritime': {
    preferredPrograms: ['Pilot training pathways', 'Aviation operations programs', 'Merchant navy pathways'],
    keyEntranceRoutes: ['Medical and licensing routes', 'NDA/CDS and maritime academy routes', 'Institution-specific aviation admissions'],
    shortlistRules: [
      'In aviation and maritime tracks, licensing quality and safety standards are non-negotiable.',
      'Evaluate total training cost and long-term ROI before committing.',
    ],
  },
  'psychology-counseling': {
    preferredPrograms: ['BA/BSc Psychology', 'Clinical psychology progression pathways', 'Counseling-focused programs'],
    keyEntranceRoutes: ['CUET and university admissions', 'Masters and supervised training routes later'],
    shortlistRules: [
      'For psychology tracks, supervision quality and practical exposure matter heavily.',
      'Long-term value comes from specialization and ethical practice depth.',
    ],
  },
  'public-sector': {
    preferredPrograms: ['Any strong graduation with exam strategy alignment', 'Public policy and governance-related programs'],
    keyEntranceRoutes: ['UPSC/State PSC and other government exam pathways'],
    shortlistRules: [
      'For public-sector ambitions, college tier is less important than exam consistency and writing discipline.',
      'Choose a degree path that supports long-term preparation stamina and affordability.',
    ],
  },
  exploration: {
    preferredPrograms: ['Use discovery semester before hard specialization', 'Choose flexible programs with broad option value'],
    keyEntranceRoutes: ['Use score-fit admissions while preserving optionality'],
    shortlistRules: [
      'Do not lock into a narrow branch before role clarity is built.',
      'Select colleges that allow experimentation, projects, and skill transitions.',
    ],
  },
};

const FAMILY_PROFILES: Record<RoleFamily, FamilyProfile> = {
  technology: {
    roleSummary: 'Build, ship, and improve software systems, data systems, and digital products.',
    dayToDay: [
      'Coding, debugging, code reviews, and shipping features',
      'Writing tests, documenting decisions, and using version control',
      'Working with product, design, and QA teams',
    ],
    bestBooks: [
      'Clean Code - Robert C. Martin',
      'The Pragmatic Programmer - David Thomas and Andrew Hunt',
      'Designing Data-Intensive Applications - Martin Kleppmann',
      'System Design Interview - Alex Xu',
      'Cracking the Coding Interview - Gayle Laakmann McDowell',
    ],
    salaryByTier: {
      tier1: 'INR 10L to 20L',
      tier2: 'INR 5L to 10L',
      tier3: 'INR 3L to 6L',
    },
    growthTo20LpaTimeline: 'Tier-3 to 18-20 LPA is usually possible in 4 to 7 years with strong projects, DSA/system design depth, and 2-3 strategic switches.',
    companySwitchGuidance: 'Switch every 18 to 30 months only after proving impact, not for random hopping.',
    effortLevers: ['DSA depth', 'real projects', 'internships', 'GitHub portfolio', 'communication and interview skill'],
    communitySignals: [
      'Big package stories are outliers; median outcomes are lower.',
      'Tier-3 students who build public proof often beat passive Tier-1 peers over time.',
    ],
  },
  finance: {
    roleSummary: 'Work with accounting, valuation, audit, analysis, and financial decision-making.',
    dayToDay: [
      'Financial statements, modeling, reporting, and compliance checks',
      'Client communication, spreadsheet analysis, and review cycles',
      'Deadlines around month-end, quarter-end, and audits',
    ],
    bestBooks: [
      'The Intelligent Investor - Benjamin Graham',
      'Financial Statement Analysis - Martin Fridson and Fernando Alvarez',
      'Common Stocks and Uncommon Profits - Philip Fisher',
      'CA/CS/CMA official study modules (current edition)',
      'Investment Valuation - Aswath Damodaran',
    ],
    salaryByTier: {
      tier1: 'INR 8L to 16L',
      tier2: 'INR 4.5L to 9L',
      tier3: 'INR 3L to 5.5L',
    },
    growthTo20LpaTimeline: 'Tier-3 to 18-20 LPA often takes 5 to 9 years depending on credentials (CA/CFA/MBA), domain depth, and role quality.',
    companySwitchGuidance: 'Switch after clear skill jumps, certifications, and measurable business impact.',
    effortLevers: ['accounting fundamentals', 'Excel/modeling speed', 'compliance accuracy', 'credential stack', 'communication'],
    communitySignals: [
      'Credentials strongly influence interview access in finance tracks.',
      'Early years are process-heavy; analytical decision roles open with proof of consistency.',
    ],
  },
  healthcare: {
    roleSummary: 'Deliver patient care, diagnosis, treatment support, and clinical decision-making.',
    dayToDay: [
      'Patient interaction, case review, and clinical protocol execution',
      'Documentation, rounds, and multidisciplinary coordination',
      'High emotional load, long hours, and strict ethical responsibility',
    ],
    bestBooks: [
      'Robbins and Cotran Pathologic Basis of Disease - Kumar, Abbas, Aster',
      'Harrisons Principles of Internal Medicine - Jameson et al.',
      'Where There Is No Doctor - David Werner',
      'The Man Who Mistook His Wife for a Hat - Oliver Sacks',
      'When Breath Becomes Air - Paul Kalanithi',
    ],
    salaryByTier: {
      tier1: 'INR 7L to 15L (early clinical roles; varies by specialty)',
      tier2: 'INR 4L to 9L',
      tier3: 'INR 3L to 6L',
    },
    growthTo20LpaTimeline: 'Reaching 18-20 LPA often takes 6 to 12 years and is highly dependent on specialization, location, and hospital ecosystem.',
    companySwitchGuidance: 'In healthcare, specialization and experience depth usually matter more than frequent switching.',
    effortLevers: ['exam stamina', 'clinical discipline', 'patient communication', 'specialization planning', 'consistency'],
    communitySignals: [
      'Income progression is slower in initial years but can improve strongly with specialization.',
      'Tier and brand help, but competence and patient outcomes matter long-term.',
    ],
  },
  'law-governance': {
    roleSummary: 'Interpret law, build arguments, and navigate legal, policy, or governance systems.',
    dayToDay: [
      'Legal reading, drafting, and case preparation',
      'Court/tribunal interactions or policy and compliance work',
      'Client communication and evidence-driven reasoning',
    ],
    bestBooks: [
      'Introduction to the Constitution of India - D.D. Basu',
      'The Rule of Law - Tom Bingham',
      'Legal Aptitude for CLAT and Other Law Entrance Exams - A.P. Bhardwaj',
      'India After Gandhi - Ramachandra Guha',
      'The Concept of Law - H.L.A. Hart',
    ],
    salaryByTier: {
      tier1: 'INR 8L to 18L (top firms and selective roles)',
      tier2: 'INR 4L to 10L',
      tier3: 'INR 3L to 6L',
    },
    growthTo20LpaTimeline: '18-20 LPA can take 5 to 10 years; litigation often grows slower initially than top corporate tracks.',
    companySwitchGuidance: 'Build specialization first; then move to better chambers, firms, or in-house roles.',
    effortLevers: ['legal writing', 'case law depth', 'courtroom confidence', 'network and internships', 'specialization'],
    communitySignals: [
      'Early legal careers can be low-paying without mentorship and strong chambers.',
      'Internship quality and writing quality are major accelerators.',
    ],
  },
  'design-creative': {
    roleSummary: 'Solve user and brand problems through visual, interaction, and narrative craft.',
    dayToDay: [
      'Research, concepting, wireframing, and visual execution',
      'Portfolio refinement and stakeholder feedback loops',
      'Iteration speed matters as much as pure creativity',
    ],
    bestBooks: [
      'The Design of Everyday Things - Don Norman',
      'Dont Make Me Think - Steve Krug',
      'Steal Like an Artist - Austin Kleon',
      'Creative Confidence - Tom Kelley and David Kelley',
      'Hooked - Nir Eyal',
    ],
    salaryByTier: {
      tier1: 'INR 6L to 14L',
      tier2: 'INR 3.5L to 8L',
      tier3: 'INR 2.5L to 5L',
    },
    growthTo20LpaTimeline: 'Reaching 18-20 LPA usually takes 5 to 8 years with high-quality portfolio, product thinking, and visible shipped work.',
    companySwitchGuidance: 'Switch with portfolio upgrades and measurable product outcomes, not title-only moves.',
    effortLevers: ['portfolio quality', 'user research skill', 'tool fluency', 'design storytelling', 'execution consistency'],
    communitySignals: [
      'Portfolio quality beats resume branding in many design interviews.',
      'Freelance and product tracks can diverge; choose based on strengths.',
    ],
  },
  'business-management': {
    roleSummary: 'Drive strategy, operations, product, and stakeholder outcomes in business settings.',
    dayToDay: [
      'Problem framing, coordination, and decision support',
      'Data interpretation, reporting, and roadmap planning',
      'Cross-functional communication with high ownership',
    ],
    bestBooks: [
      'The First 90 Days - Michael D. Watkins',
      'Good Strategy Bad Strategy - Richard Rumelt',
      'High Output Management - Andrew S. Grove',
      'The Lean Startup - Eric Ries',
      'Measure What Matters - John Doerr',
    ],
    salaryByTier: {
      tier1: 'INR 8L to 18L',
      tier2: 'INR 4.5L to 10L',
      tier3: 'INR 3L to 6L',
    },
    growthTo20LpaTimeline: '18-20 LPA is often possible in 5 to 8 years with business impact, leadership skill, and role-quality upgrades.',
    companySwitchGuidance: 'Switch when scope and ownership increase; avoid frequent lateral switches with no impact story.',
    effortLevers: ['communication', 'problem solving', 'ownership', 'analytics', 'stakeholder management'],
    communitySignals: [
      'Impact stories beat generic responsibility lists in interviews.',
      'MBA can accelerate for some paths but execution proof still dominates.',
    ],
  },
  'engineering-core': {
    roleSummary: 'Build and maintain physical systems, infrastructure, and industrial technology.',
    dayToDay: [
      'Design reviews, calculations, and site or plant coordination',
      'Safety, quality, and process documentation',
      'Cross-team work with operations and vendors',
    ],
    bestBooks: [
      'Shigleys Mechanical Engineering Design - Budynas and Nisbett',
      'Engineering Mechanics - R.C. Hibbeler',
      'The Goal - Eliyahu M. Goldratt',
      'Project Management Body of Knowledge (PMBOK Guide)',
      'To Engineer Is Human - Henry Petroski',
    ],
    salaryByTier: {
      tier1: 'INR 7L to 14L',
      tier2: 'INR 4L to 8L',
      tier3: 'INR 3L to 5L',
    },
    growthTo20LpaTimeline: '18-20 LPA often takes 6 to 10 years via specialization, domain certifications, and selective employer transitions.',
    companySwitchGuidance: 'Switch after deepening domain expertise; pure random hopping can hurt credibility in core tracks.',
    effortLevers: ['core fundamentals', 'CAD/tools', 'site discipline', 'problem solving', 'safety and quality mindset'],
    communitySignals: [
      'Core engineering pay can start modestly but rises with niche domain depth.',
      'Hybrid skills (core + software/data) can accelerate growth.',
    ],
  },
  'education-research': {
    roleSummary: 'Teach, mentor, and generate knowledge through pedagogy and research rigor.',
    dayToDay: [
      'Lesson/research planning and content development',
      'Student mentoring or experimental/research execution',
      'Assessment, writing, and publication or teaching feedback cycles',
    ],
    bestBooks: [
      'Make It Stick - Peter C. Brown, Henry L. Roediger III, Mark A. McDaniel',
      'How Learning Works - Susan A. Ambrose et al.',
      'The Craft of Research - Booth, Colomb, Williams',
      'A Mind for Numbers - Barbara Oakley',
      'The Courage to Teach - Parker J. Palmer',
    ],
    salaryByTier: {
      tier1: 'INR 5L to 12L',
      tier2: 'INR 3.5L to 8L',
      tier3: 'INR 2.5L to 5.5L',
    },
    growthTo20LpaTimeline: '18-20 LPA can take 7 to 12 years and usually needs strong credentials, institutional quality, and visible output.',
    companySwitchGuidance: 'Move for stronger institutions and better research/teaching ecosystems, not only salary.',
    effortLevers: ['subject mastery', 'teaching quality', 'research output', 'communication', 'consistency'],
    communitySignals: [
      'Credentials and institution type strongly affect compensation.',
      'Long-term growth comes from depth, not shortcuts.',
    ],
  },
  'hospitality-services': {
    roleSummary: 'Deliver service excellence through operations, guest management, and execution discipline.',
    dayToDay: [
      'Frontline guest or event interactions and issue handling',
      'Shift operations, vendor coordination, and quality control',
      'High stamina, timing discipline, and communication under pressure',
    ],
    bestBooks: [
      'Setting the Table - Danny Meyer',
      'The Heart of Hospitality - Micah Solomon',
      'Kitchen Confidential - Anthony Bourdain',
      'Unreasonable Hospitality - Will Guidara',
      'The Checklist Manifesto - Atul Gawande',
    ],
    salaryByTier: {
      tier1: 'INR 3.5L to 7L',
      tier2: 'INR 2.5L to 5L',
      tier3: 'INR 2L to 4L',
    },
    growthTo20LpaTimeline: '18-20 LPA is possible but often takes 7 to 12 years with leadership track progression and premium-brand exposure.',
    companySwitchGuidance: 'Switch for larger responsibility and stronger brand exposure after proving reliability.',
    effortLevers: ['service quality', 'operations discipline', 'communication', 'problem ownership', 'leadership growth'],
    communitySignals: [
      'Early compensation may feel low; growth improves with brand and managerial responsibilities.',
      'Professional communication and consistency create faster promotions.',
    ],
  },
  'sports-performance': {
    roleSummary: 'Compete, coach, or analyze in high-performance sports environments.',
    dayToDay: [
      'Training discipline, performance review, and injury management',
      'Video/data analysis and game strategy work',
      'Coach feedback loops and recovery planning',
    ],
    bestBooks: [
      'Mindset - Carol S. Dweck',
      'The Inner Game of Tennis - W. Timothy Gallwey',
      'Atomic Habits - James Clear',
      'Peak - Anders Ericsson and Robert Pool',
      'Relentless - Tim S. Grover',
    ],
    salaryByTier: {
      tier1: 'INR 4L to 12L (varies heavily by sport and level)',
      tier2: 'INR 2.5L to 7L',
      tier3: 'INR 2L to 4.5L',
    },
    growthTo20LpaTimeline: '18-20 LPA is highly non-linear in sports; 5 to 10+ years depending on performance level, league visibility, and brand value.',
    companySwitchGuidance: 'In sports, progression is performance-led; transitions to coaching/analysis can stabilize income.',
    effortLevers: ['training intensity', 'coaching quality', 'injury prevention', 'competition exposure', 'discipline'],
    communitySignals: [
      'Income volatility is common; backups in coaching or analytics reduce risk.',
      'Consistency and visibility matter as much as talent.',
    ],
  },
  'media-communication': {
    roleSummary: 'Create, communicate, and distribute information, stories, and audience-focused content.',
    dayToDay: [
      'Research, scripting, producing, editing, and publishing',
      'Audience analysis and iteration based on feedback',
      'Deadlines, creative cycles, and platform-specific execution',
    ],
    bestBooks: [
      'On Writing Well - William Zinsser',
      'Everybody Writes - Ann Handley',
      'Contagious - Jonah Berger',
      'Made to Stick - Chip Heath and Dan Heath',
      'The Elements of Journalism - Bill Kovach and Tom Rosenstiel',
    ],
    salaryByTier: {
      tier1: 'INR 4.5L to 11L',
      tier2: 'INR 3L to 7L',
      tier3: 'INR 2L to 5L',
    },
    growthTo20LpaTimeline: '18-20 LPA may take 5 to 9 years with audience proof, niche authority, and strong portfolio metrics.',
    companySwitchGuidance: 'Switch when your portfolio, audience, or specialization gives leverage.',
    effortLevers: ['writing/storytelling', 'distribution strategy', 'content consistency', 'analytics', 'brand building'],
    communitySignals: [
      'Creator/media outcomes are highly merit and consistency driven.',
      'Specialization plus platform literacy increases stability.',
    ],
  },
  'aviation-maritime': {
    roleSummary: 'Work in high-responsibility transport systems requiring technical precision and safety discipline.',
    dayToDay: [
      'Protocol-based operations with safety as top priority',
      'Training, compliance checks, and simulation or route preparation',
      'Shift-based work and high accountability decisions',
    ],
    bestBooks: [
      'Stick and Rudder - Wolfgang Langewiesche',
      'Pilots Handbook of Aeronautical Knowledge - FAA',
      'Fate Is the Hunter - Ernest K. Gann',
      'Bridge Team Management - A.J. Swift',
      'The Checklist Manifesto - Atul Gawande',
    ],
    salaryByTier: {
      tier1: 'INR 8L to 20L (role and license dependent)',
      tier2: 'INR 5L to 12L',
      tier3: 'INR 3L to 8L',
    },
    growthTo20LpaTimeline: '18-20 LPA can be reached in 4 to 9 years for some tracks, but depends heavily on licensing quality, training investment, and employer type.',
    companySwitchGuidance: 'Switch after license milestones and logged operational experience.',
    effortLevers: ['technical precision', 'medical/fitness standards', 'license progression', 'discipline', 'safety mindset'],
    communitySignals: [
      'Entry barriers and training costs are significant in aviation tracks.',
      'Credential quality and logged hours strongly affect opportunities.',
    ],
  },
  'psychology-counseling': {
    roleSummary: 'Support mental health, behavior change, and guidance through evidence-based methods.',
    dayToDay: [
      'Assessment, listening, and structured intervention planning',
      'Session documentation and ethical practice boundaries',
      'Continuous supervision, learning, and skill refinement',
    ],
    bestBooks: [
      'Man and His Symbols - Carl G. Jung',
      'The Body Keeps the Score - Bessel van der Kolk',
      'Counselling Skills and Theory - Margaret Hough',
      'Thinking Fast and Slow - Daniel Kahneman',
      'The Gift of Therapy - Irvin D. Yalom',
    ],
    salaryByTier: {
      tier1: 'INR 5L to 12L',
      tier2: 'INR 3.5L to 8L',
      tier3: 'INR 2.5L to 6L',
    },
    growthTo20LpaTimeline: '18-20 LPA usually takes 6 to 10 years through specialization, strong outcomes, and personal brand trust.',
    companySwitchGuidance: 'Growth is often practice-quality led; clinic, hospital, and private practice tracks differ.',
    effortLevers: ['deep listening', 'clinical/counseling frameworks', 'ethics', 'documentation', 'specialization'],
    communitySignals: [
      'Demand is increasing, but trust and credibility take time to build.',
      'Advanced credentials improve long-term income stability.',
    ],
  },
  'public-sector': {
    roleSummary: 'Serve through structured public institutions, policy execution, and regulated systems.',
    dayToDay: [
      'Policy/process execution and public-facing decision workflows',
      'Documentation, compliance, and accountability',
      'High exam gatekeeping and long preparation cycles',
    ],
    bestBooks: [
      'Indian Polity - M. Laxmikanth',
      'India Year Book - Publications Division',
      'Certificate Physical and Human Geography - G.C. Leong',
      'Ethics Integrity and Aptitude - Lexicon',
      'NCERT Class 6 to 12 core books',
    ],
    salaryByTier: {
      tier1: 'Not college-tier dependent once selected; pay is grade and cadre based',
      tier2: 'Not college-tier dependent once selected; pay is grade and cadre based',
      tier3: 'Not college-tier dependent once selected; pay is grade and cadre based',
    },
    growthTo20LpaTimeline: 'CTC-style comparisons are not always meaningful; growth is tied to pay commission structure, allowances, and seniority.',
    companySwitchGuidance: 'Focus on exam strategy and service progression, not private-sector switch frequency logic.',
    effortLevers: ['PYQ strategy', 'discipline', 'revision systems', 'answer writing', 'mental resilience'],
    communitySignals: [
      'Selection difficulty is high; consistency beats short bursts.',
      'Role stability and social impact are major advantages.',
    ],
  },
  exploration: {
    roleSummary: 'Use exploration mode to discover fit before committing to one role identity.',
    dayToDay: [
      'Short experiments, role shadowing, and reflection loops',
      'Aptitude-interest-constraint mapping',
      'Micro-projects to validate real-world fit quickly',
    ],
    bestBooks: [
      'Designing Your Life - Bill Burnett and Dave Evans',
      'So Good They Cant Ignore You - Cal Newport',
      'Range - David Epstein',
      'Atomic Habits - James Clear',
      'Wings of Fire - A.P.J. Abdul Kalam',
    ],
    salaryByTier: {
      tier1: 'Depends on selected final role',
      tier2: 'Depends on selected final role',
      tier3: 'Depends on selected final role',
    },
    growthTo20LpaTimeline: 'Timeline depends on final chosen role and execution quality.',
    companySwitchGuidance: 'First finalize direction, then optimize switch strategy for that track.',
    effortLevers: ['self-awareness', 'experimentation', 'mentor feedback', 'execution discipline', 'decision clarity'],
    communitySignals: [
      'Early confusion is normal; structured exploration reduces regret.',
      'Clarity grows from action, not overthinking alone.',
    ],
  },
};

const ROLE_FAMILY_KEYWORDS: Array<{ family: RoleFamily; keywords: string[] }> = [
  { family: 'technology', keywords: ['software', 'data', 'ai', 'ml', 'cyber', 'cloud', 'devops', 'game developer'] },
  { family: 'finance', keywords: ['accountant', 'financial', 'investment', 'ca', 'company secretary', 'cost accountant', 'cma'] },
  { family: 'healthcare', keywords: ['doctor', 'dentist', 'pharmacist', 'nurse', 'physiotherapist', 'nutritionist', 'biotechnologist'] },
  { family: 'psychology-counseling', keywords: ['psychologist', 'counselor'] },
  { family: 'law-governance', keywords: ['lawyer', 'judge', 'judicial'] },
  { family: 'public-sector', keywords: ['civil services', 'public service', 'defense officer', 'upsc'] },
  { family: 'design-creative', keywords: ['designer', 'animator', 'fashion', 'architect', 'interior', 'game designer'] },
  { family: 'business-management', keywords: ['entrepreneur', 'manager', 'analyst', 'product manager', 'event manager'] },
  { family: 'engineering-core', keywords: ['mechanical', 'civil engineer', 'electrical', 'electronics', 'robotics', 'automobile', 'agricultural scientist', 'environmental scientist', 'urban planner'] },
  { family: 'education-research', keywords: ['teacher', 'professor', 'lecturer', 'research scientist'] },
  { family: 'hospitality-services', keywords: ['hotel', 'chef', 'cabin crew'] },
  { family: 'sports-performance', keywords: ['sports'] },
  { family: 'media-communication', keywords: ['journalist', 'creator', 'youtuber', 'musician', 'actor', 'photographer', 'videographer', 'translator'] },
  { family: 'aviation-maritime', keywords: ['pilot', 'air traffic', 'merchant navy'] },
];

const SPECIAL_ROLE_OVERRIDES: Record<string, Partial<FamilyProfile>> = {
  'civil services ias ips': {
    salaryByTier: {
      tier1: 'Not tier based after selection; governed by pay commission and cadre',
      tier2: 'Not tier based after selection; governed by pay commission and cadre',
      tier3: 'Not tier based after selection; governed by pay commission and cadre',
    },
    growthTo20LpaTimeline: 'Use long-term service compensation view (basic pay + allowances + housing), not private CTC comparison.',
  },
  entrepreneur: {
    salaryByTier: {
      tier1: 'Can be zero to high; depends on business model and traction',
      tier2: 'Can be zero to high; depends on business model and traction',
      tier3: 'Can be zero to high; depends on business model and traction',
    },
    growthTo20LpaTimeline: 'Entrepreneur outcomes are non-linear; focus on runway, revenue proof, and unit economics.',
    companySwitchGuidance: 'For founders, role pivots and business model iteration matter more than classic company switching.',
  },
  'not sure yet': {
    roleSummary: 'This is exploration mode. The immediate goal is to discover fit through guided experiments.',
  },
};

const ROLE_ID_ALIAS_MAP: Record<string, string> = {
  'software engineer': 'software-engineer',
  'data scientist': 'data-scientist',
  'ai ml engineer': 'ai-ml-engineer',
  'cybersecurity analyst': 'cybersecurity-analyst',
  'ui ux designer': 'ui-ux-designer',
  'chartered accountant': 'chartered-accountant',
  'financial analyst': 'financial-analyst',
  'investment banker': 'investment-banker',
  doctor: 'doctor-mbbs',
  psychologist: 'clinical-psychologist',
  'clinical psychologist': 'clinical-psychologist',
  'mechanical engineer': 'mechanical-engineer',
  'civil engineer': 'civil-engineer',
  'graphic designer': 'graphic-designer',
  journalist: 'journalist',
  animator: 'animator',
  lawyer: 'lawyer',
  'civil services ias ips': 'civil-services',
  teacher: 'teacher-professor',
  'professor lecturer': 'teacher-professor',
  'research scientist': 'research-scientist',
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferRoleFamily(roleTitle: string): RoleFamily {
  const normalized = normalizeText(roleTitle);

  if (normalized === 'not sure yet') return 'exploration';

  for (const mapping of ROLE_FAMILY_KEYWORDS) {
    if (mapping.keywords.some((keyword) => normalized.includes(keyword))) {
      return mapping.family;
    }
  }

  return 'business-management';
}

function resolveRoleTitle(rawRoleTitle: string): string {
  const normalizedInput = normalizeText(rawRoleTitle);

  const exact = CAREER_ROLE_OPTIONS.find((role) => normalizeText(role.title) === normalizedInput);
  if (exact) return exact.title;

  const closest = CAREER_ROLE_OPTIONS.find((role) => {
    const normalizedRoleTitle = normalizeText(role.title);
    return normalizedInput.includes(normalizedRoleTitle) || normalizedRoleTitle.includes(normalizedInput);
  });

  return closest?.title ?? rawRoleTitle.trim();
}

function resolveSalaryReference(roleTitle: string): string | undefined {
  const normalized = normalizeText(roleTitle);
  const alias = ROLE_ID_ALIAS_MAP[normalized];

  if (alias) {
    const fromAlias = careerDatabase.find((career) => career.id === alias);
    if (fromAlias?.salary_range_inr) return fromAlias.salary_range_inr;
  }

  const byTitle = careerDatabase.find((career) => {
    const normalizedCareerTitle = normalizeText(career.title);
    return normalizedCareerTitle.includes(normalized) || normalized.includes(normalizedCareerTitle);
  });

  return byTitle?.salary_range_inr;
}

function mergeProfileWithOverride(profile: FamilyProfile, roleTitle: string): FamilyProfile {
  const overrideKey = normalizeText(roleTitle);
  const override = SPECIAL_ROLE_OVERRIDES[overrideKey];
  if (!override) return profile;

  return {
    ...profile,
    ...override,
    salaryByTier: override.salaryByTier ?? profile.salaryByTier,
    dayToDay: override.dayToDay ?? profile.dayToDay,
    bestBooks: override.bestBooks ?? profile.bestBooks,
    effortLevers: override.effortLevers ?? profile.effortLevers,
    communitySignals: override.communitySignals ?? profile.communitySignals,
  };
}

export function detectRoleMentionFromText(text?: string | null): string | null {
  if (!text) return null;
  const normalizedText = normalizeText(text);
  if (!normalizedText) return null;

  const orderedRoles = [...CAREER_ROLE_OPTIONS]
    .map((role) => role.title)
    .sort((a, b) => b.length - a.length);

  for (const roleTitle of orderedRoles) {
    const normalizedRoleTitle = normalizeText(roleTitle);
    if (!normalizedRoleTitle || normalizedRoleTitle === 'not sure yet') continue;
    if (normalizedText.includes(normalizedRoleTitle)) {
      return roleTitle;
    }
  }

  const aliases: Record<string, string> = {
    'ias': 'Civil Services (IAS/IPS)',
    'ips': 'Civil Services (IAS/IPS)',
    'ui ux': 'UI/UX Designer',
    'ml engineer': 'AI / ML Engineer',
    'data science': 'Data Scientist',
    'chartered accountant': 'Chartered Accountant',
  };

  for (const [alias, title] of Object.entries(aliases)) {
    if (normalizedText.includes(alias)) return title;
  }

  return null;
}

export function getRoleKnowledgeSummary(selectedRole?: string | null): RoleKnowledgeSummary | null {
  if (!selectedRole?.trim()) return null;

  const roleTitle = resolveRoleTitle(selectedRole);
  const roleFamily = inferRoleFamily(roleTitle);
  const baseProfile = FAMILY_PROFILES[roleFamily];
  const profile = mergeProfileWithOverride(baseProfile, roleTitle);

  return {
    roleTitle,
    roleFamily,
    roleSummary: profile.roleSummary,
    dayToDay: profile.dayToDay,
    bestBooks: profile.bestBooks,
    salaryByTier: profile.salaryByTier,
    growthTo20LpaTimeline: profile.growthTo20LpaTimeline,
    companySwitchGuidance: profile.companySwitchGuidance,
    effortLevers: profile.effortLevers,
    communitySignals: profile.communitySignals,
    salaryRangeReference: resolveSalaryReference(roleTitle),
    collegeGuidance: COLLEGE_GUIDANCE_BY_FAMILY[roleFamily],
  };
}

export function buildRoleKnowledgePromptBlock(selectedRole?: string | null): string {
  const summary = getRoleKnowledgeSummary(selectedRole);
  if (!summary) {
    return 'No role selected yet. Once a role is known, provide role-specific books, salary tiers, and growth plan.';
  }

  const salaryReference = summary.salaryRangeReference
    ? `Known salary reference in existing dataset: ${summary.salaryRangeReference}.`
    : 'No exact dataset salary for this role title; use family-level estimate ranges below.';

  return [
    `Role intelligence pack for ${summary.roleTitle}:`,
    `- Role family: ${summary.roleFamily}`,
    `- Core explainer: ${summary.roleSummary}`,
    `- Day-to-day reality cues: ${summary.dayToDay.join(' | ')}`,
    `- Entry salary estimates by college tier (freshers, India, approximate): Tier-1 ${summary.salaryByTier.tier1}; Tier-2 ${summary.salaryByTier.tier2}; Tier-3 ${summary.salaryByTier.tier3}`,
    `- Growth to 18-20 LPA: ${summary.growthTo20LpaTimeline}`,
    `- Switch strategy: ${summary.companySwitchGuidance}`,
    `- Effort levers to stress: ${summary.effortLevers.join(', ')}`,
    `- Best books for this role (choose 2 to 4 if relevant): ${summary.bestBooks.join('; ')}`,
    `- Community reality signals (aggregated): ${summary.communitySignals.join(' | ')}`,
    `- College selection priorities: ${DEFAULT_COLLEGE_SELECTION_RULES.join(' | ')}`,
    `- Preferred program routes: ${summary.collegeGuidance.preferredPrograms.join(' | ')}`,
    `- Entrance/exam routes to evaluate: ${summary.collegeGuidance.keyEntranceRoutes.join(' | ')}`,
    `- Family-specific college shortlist rules: ${summary.collegeGuidance.shortlistRules.join(' | ')}`,
    '- If student asks for college shortlist, produce Reach, Match, and Safe buckets. If score, budget, location, and category data are missing, ask one focused question for the most important missing field first.',
    `- ${salaryReference}`,
    '- Source discipline: use aggregated trends from AmbitionBox, Glassdoor, LinkedIn jobs, and Quora-style community discussions only as directional signals. Never present individual anecdotes as verified facts.',
    '- Always label salary and timeline numbers as estimates with company, city, market-cycle, and individual-skill variance.',
  ].join('\n');
}
