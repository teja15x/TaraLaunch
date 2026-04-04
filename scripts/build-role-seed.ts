import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CAREER_ROLE_OPTIONS } from '../src/data/careerRoles';

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

type StageFit = 'pre-12th' | 'post-12th' | 'in-college' | 'post-college';

interface RoleSeed {
  id: string;
  title: string;
  roleFamily: RoleFamily;
  pathHint: string;
  tags: string[];
  source: 'career-role-options' | 'manual-curation' | 'hybrid';
  confidence: number;
  stageFit: StageFit[];
}

const MANUAL_EXTRA_ROLES: Array<{ title: string; pathHint: string }> = [
  { title: 'Frontend Developer', pathHint: 'HTML, CSS, JavaScript, React, UI implementation and internship portfolio' },
  { title: 'Backend Developer', pathHint: 'APIs, databases, server logic, cloud deployment and system reliability' },
  { title: 'Full Stack Developer', pathHint: 'Frontend and backend stack, product thinking, deployment and debugging' },
  { title: 'QA Engineer', pathHint: 'Test planning, automation, bug tracking, quality gates and release confidence' },
  { title: 'Site Reliability Engineer', pathHint: 'Monitoring, incident response, reliability, automation and cloud systems' },
  { title: 'Prompt Engineer', pathHint: 'LLM prompting, evaluation, safety, workflow design and iterative optimization' },
  { title: 'AI Product Manager', pathHint: 'AI feature planning, metrics, user value, model tradeoffs and governance' },
  { title: 'Blockchain Developer', pathHint: 'Smart contracts, security, protocol understanding and decentralized app stack' },
  { title: 'Network Engineer', pathHint: 'Routing, switching, firewalls, troubleshooting and enterprise infrastructure' },
  { title: 'SOC Analyst', pathHint: 'Threat monitoring, SIEM tools, incident triage and security operations workflow' },
  { title: 'Actuary', pathHint: 'Probability, statistics, risk modeling, insurance domain exams and financial analysis' },
  { title: 'Tax Consultant', pathHint: 'Direct and indirect taxes, compliance, filings and advisory for clients' },
  { title: 'Equity Research Analyst', pathHint: 'Company analysis, valuation, financial modeling and markets insight' },
  { title: 'Portfolio Manager', pathHint: 'Investment strategy, risk balancing, asset allocation and performance tracking' },
  { title: 'Financial Planner', pathHint: 'Personal finance, goal planning, insurance, investments and client advisory' },
  { title: 'Risk Analyst', pathHint: 'Risk frameworks, compliance, analytics and decision support for institutions' },
  { title: 'Physician Assistant', pathHint: 'Clinical support, diagnostics assistance, patient care and protocol-based treatment' },
  { title: 'Public Health Specialist', pathHint: 'Epidemiology, community health, policy implementation and prevention programs' },
  { title: 'Occupational Therapist', pathHint: 'Rehabilitation planning, daily functioning support and patient care pathways' },
  { title: 'Speech Therapist', pathHint: 'Communication therapy, speech correction, pediatric and clinical intervention' },
  { title: 'Medical Lab Technologist', pathHint: 'Diagnostics labs, sample analysis, quality standards and reporting systems' },
  { title: 'Biomedical Engineer', pathHint: 'Medical devices, instrumentation, healthcare systems and engineering integration' },
  { title: 'Corporate Lawyer', pathHint: 'Contracts, compliance, mergers, legal drafting and business law practice' },
  { title: 'Criminal Lawyer', pathHint: 'Litigation, court practice, legal research and client representation' },
  { title: 'Legal Analyst', pathHint: 'Case research, compliance documents, legal summaries and advisory support' },
  { title: 'Patent Attorney', pathHint: 'IP law, technical writing, innovation protection and legal prosecution workflows' },
  { title: 'UX Researcher', pathHint: 'User interviews, usability studies, behavior analysis and product insights' },
  { title: 'Motion Designer', pathHint: 'Animation, storytelling, visual systems and digital brand communication' },
  { title: 'Industrial Designer', pathHint: 'Product design, ergonomics, materials, prototyping and manufacturing fit' },
  { title: 'Game Artist', pathHint: '2D/3D art, visual assets, style consistency and production collaboration' },
  { title: 'Brand Strategist', pathHint: 'Market positioning, messaging frameworks, campaigns and growth storytelling' },
  { title: 'Operations Manager', pathHint: 'Process optimization, team coordination, delivery efficiency and execution control' },
  { title: 'Supply Chain Analyst', pathHint: 'Procurement, logistics, forecasting, inventory systems and analytics' },
  { title: 'Sales Manager', pathHint: 'Pipeline management, client acquisition, target achievement and team leadership' },
  { title: 'Digital Growth Manager', pathHint: 'Funnel optimization, paid ads, analytics and growth experimentation' },
  { title: 'Civil Engineer (Structures)', pathHint: 'Structural design, construction standards, site coordination and safety checks' },
  { title: 'Electrical Engineer (Power Systems)', pathHint: 'Power distribution, grid systems, maintenance and industrial reliability' },
  { title: 'Embedded Systems Engineer', pathHint: 'Microcontrollers, firmware, electronics integration and hardware debugging' },
  { title: 'Mechatronics Engineer', pathHint: 'Automation systems, sensors, controls, mechanical-electrical integration' },
  { title: 'Renewable Energy Engineer', pathHint: 'Solar/wind systems, energy optimization and sustainability deployment' },
  { title: 'Data Engineer', pathHint: 'ETL pipelines, warehousing, distributed processing and data platform reliability' },
  { title: 'Cloud Security Engineer', pathHint: 'Cloud hardening, IAM, threat prevention and compliance architecture' },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferFamily(title: string, hint: string): RoleFamily {
  const text = `${title} ${hint}`.toLowerCase();

  if (/software|data|ai|ml|cyber|cloud|devops/.test(text)) return 'technology';
  if (/account|finance|bank|investment|ca|cma|cs/.test(text)) return 'finance';
  if (/doctor|dentist|nurse|physio|pharma|nutrition|clinical/.test(text)) return 'healthcare';
  if (/law|judge|judicial|civil services|ias|ips|upsc|public service/.test(text)) return 'law-governance';
  if (/designer|ux|ui|graphic|animator|fashion|interior/.test(text)) return 'design-creative';
  if (/product manager|entrepreneur|manager|consultant|analyst/.test(text)) return 'business-management';
  if (/mechanical|civil engineer|electrical|electronics|robotics|automobile/.test(text)) return 'engineering-core';
  if (/teacher|professor|lecturer|research/.test(text)) return 'education-research';
  if (/hotel|chef|event|service/.test(text)) return 'hospitality-services';
  if (/sports|athlete|coach/.test(text)) return 'sports-performance';
  if (/journalist|content|creator|youtuber|photographer|videographer|translator/.test(text)) return 'media-communication';
  if (/pilot|cabin crew|air traffic|merchant navy/.test(text)) return 'aviation-maritime';
  if (/psycholog|counselor/.test(text)) return 'psychology-counseling';
  if (/defense|government/.test(text)) return 'public-sector';
  return 'exploration';
}

function inferStageFit(title: string, hint: string): StageFit[] {
  const text = `${title} ${hint}`.toLowerCase();

  if (/neet|jee|foundation|stream|class 10|class 12/.test(text)) {
    return ['pre-12th', 'post-12th'];
  }

  if (/internship|portfolio|placements|interview/.test(text)) {
    return ['in-college', 'post-college'];
  }

  return ['post-12th', 'in-college', 'post-college'];
}

function tagsFrom(title: string, hint: string): string[] {
  const base = new Set<string>();
  base.add(slugify(title));

  for (const part of hint.split(/[ ,/]+/)) {
    const normalized = slugify(part);
    if (normalized.length >= 3) base.add(normalized);
    if (base.size >= 8) break;
  }

  return Array.from(base).slice(0, 8);
}

const seeds: RoleSeed[] = CAREER_ROLE_OPTIONS
  .filter((item) => item.title.toLowerCase() !== 'not sure yet')
  .map((item) => ({
    id: slugify(item.title),
    title: item.title,
    roleFamily: inferFamily(item.title, item.pathHint),
    pathHint: item.pathHint,
    tags: tagsFrom(item.title, item.pathHint),
    source: 'career-role-options',
    confidence: 0.78,
    stageFit: inferStageFit(item.title, item.pathHint),
  }));

for (const extra of MANUAL_EXTRA_ROLES) {
  seeds.push({
    id: slugify(extra.title),
    title: extra.title,
    roleFamily: inferFamily(extra.title, extra.pathHint),
    pathHint: extra.pathHint,
    tags: tagsFrom(extra.title, extra.pathHint),
    source: 'manual-curation',
    confidence: 0.83,
    stageFit: inferStageFit(extra.title, extra.pathHint),
  });
}

const deduped: RoleSeed[] = [];
const seen = new Set<string>();
for (const seed of seeds) {
  if (seen.has(seed.id)) continue;
  seen.add(seed.id);
  deduped.push(seed);
}

const result = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  minTarget: 100,
  items: deduped,
};

const outPath = join(process.cwd(), 'src', 'data', 'knowledge', 'roles.seed.json');
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf-8');

console.log(`Wrote ${deduped.length} role seeds to ${outPath}`);
if (deduped.length < 100) {
  console.log('Warning: fewer than 100 seeds. Add manual-curation items to reach target.');
}
