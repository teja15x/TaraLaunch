/* eslint-disable max-lines*/
/**
 * Pain Priority Scoring Engine
 * Maps student pain categories to priority levels and agent behavior guidance.
 * Used to ensure agent prioritizes solving the most urgent pain first,
 * making the counseling mentality-adaptive and emotionally intelligent.
 */

export type PainPriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface PainPriorityProfile {
  category: string;
  priorityLevel: PainPriorityLevel;
  agentBehavior: string;
  addressBefore: string[];
  combinedRisks?: string[];
}

/**
 * Maps each student pain category to priority scoring.
 * CRITICAL: Emotional safety / mental health first (stabilize before career clarity).
 * HIGH: Basic confidence blockers (exam anxiety, family pressure).
 * MEDIUM: Career clarity gaps (what to choose, skill confidence).
 * LOW: Tactical career optimization (salary growth, boundary planning).
 */
export const PAIN_PRIORITY_MATRIX: Record<string, PainPriorityProfile> = {
  "Exam stress control and panic before tests": {
    category: "Exam Stress",
    priorityLevel: "CRITICAL",
    agentBehavior:
      "First stabilize emotional state. Teach stress management techniques (breathing, reframing, micro-breaks). Only move to role exploration after confirming student feels calmer.",
    addressBefore: ["role clarity", "college choice", "salary discussion"],
    combinedRisks: ["Low academic performance", "Decision paralysis", "Confidence crash"],
  },
  "Mental stress or burnout": {
    category: "Mental Health / Burnout",
    priorityLevel: "CRITICAL",
    agentBehavior:
      "Immediate priority: validate fatigue, normalize recovery time, suggest professional help if needed. Build small wins. Do not push aggressive career planning until energy returns.",
    addressBefore: [
      "exam preparation",
      "role research",
      "college applications",
    ],
    combinedRisks: ["Depression", "Academic failure", "Permanent disengagement"],
  },
  "Confidence rebuilding after setbacks or drop year": {
    category: "Post-Failure Recovery",
    priorityLevel: "CRITICAL",
    agentBehavior:
      "Lead with psychology (growth mindset, grit framework). Reframe setback as data, not identity. Build concrete small-win plan for next 30 days. Mentality stabilization is prerequisite for goal-setting.",
    addressBefore: [
      "aggressive career timeline",
      "competitive exam planning",
    ],
    combinedRisks: [
      "Self-sabotage",
      "Learned helplessness",
      "Career inertia",
    ],
  },
  "Overthinking to action weekly accountability plan": {
    category: "Analysis Paralysis / Action Block",
    priorityLevel: "HIGH",
    agentBehavior:
      "Diagnose overthinking triggers (perfectionism, fear of wrong choice). Teach decision framework (info gathering deadline). Create micro-commitments (1-week actions). Accountability loop is key.",
    addressBefore: ["career decision finalization", "application timelines"],
  },
  "Family pressure to pick a certain path": {
    category: "Family Pressure",
    priorityLevel: "HIGH",
    agentBehavior:
      "Validate pressure and emotional toll. Teach negotiation scripts and boundary-setting. Help student articulate their own desire vs. parental expectation. Parent-pressure is a blocker to authentic choice.",
    addressBefore: [
      "final career commitment",
      "college application",
    ],
    combinedRisks: ["Regret and resentment", "Career abandonment mid-path", "Ongoing conflict"],
  },
  "Social or cultural pressure affecting career choice": {
    category: "Social / Cultural Pressure",
    priorityLevel: "HIGH",
    agentBehavior:
      "Acknowledge social context and real discrimination/affordability gaps. Help student separate authentic goals from external pressure. Build confidence in counter-cultural choices.",
    addressBefore: ["rigidity in career path"],
  },
  "Digital addiction or social media distraction": {
    category: "Lifestyle / Habit Block",
    priorityLevel: "HIGH",
    agentBehavior:
      "Diagnose the need beneath addiction (stress, underestimation, FOMO). Create friction reduction plan (app limits, phone-free zones, accountability). Habit change is prerequisite for consistent effort.",
    addressBefore: [
      "study planning",
      "project-based skill building",
      "internship readiness",
    ],
    combinedRisks: ["Sleep loss", "Attention span collapse", "Academic failure"],
  },
  "Lifestyle or harmful habits affecting focus and consistency": {
    category: "Harmful Habits / Self-Sabotage",
    priorityLevel: "HIGH",
    agentBehavior:
      "Compassionately explore the habit drivers (stress, low self-worth, peer pressure). Build replacement behaviors. Link habit change to one concrete career goal (motivation amplifier).",
    addressBefore: [
      "long-term goal setting",
      "competitive exam prep",
    ],
    combinedRisks: [
      "Physical health collapse",
      "Academic failure",
      "Social isolation",
    ],
  },
  "Unemployment or underemployment fear after graduation": {
    category: "Post-Graduate Job Fear",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Acknowledge real job market signals (13.8% unemployment, skills gap). Shift to action: internship strategy, portfolio building, Plan B/C definition. Convert fear to skill-first growth roadmap.",
    addressBefore: [],
  },
  "Skills mismatch with current job market demands": {
    category: "Skills Gap Awareness",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Validate concern. Pivot to growth plan: core skills to build (coding, communication, reasoning). Create 90-day upskilling calendar. Show progress markers (portfolio, projects, certifications).",
    addressBefore: ["final major selection", "college choice"],
  },
  "Job market volatility and future uncertainty": {
    category: "Macro Job Market Anxiety",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Balance realism with agency. Acknowledge volatility. Teach resilience (Plan B, continuous learning, network). Help student focus on what they control (skills, adaptability, communities).",
    addressBefore: [
      "rigid long-term plans",
      "single-path thinking",
    ],
  },
  "Confused about which stream or course to choose": {
    category: "Stream / Course Clarity",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Map interests to stream (use RIASEC). Use games (Scenario Quest, Pattern Master) to test fit. Show role examples from each stream. Eliminate top 1-2 options first.",
    addressBefore: [
      "final stream decision",
      "college application focus",
    ],
  },
  "Need stream clarity (MPC/BiPC/Commerce/Arts)": {
    category: "Indian Stream Choice (10+2)",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Deep dive on strengths (math, biology, verbal). Map to stream outcomes and career families. Acknowledge family pressure. Show non-obvious paths in each stream (e.g., psychology in science, journalism in commerce).",
    addressBefore: ["college choice", "entrance exam prep"],
  },
  "Not sure about career options after 10th/12th": {
    category: "Early-Stage Career Awareness",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Exploratory mode. Do micro-exposures: 2-3 game sessions, role interviews, shadow days. Do not push to final choice, instead build curiosity and information. Action: 7-day exploration calendar.",
    addressBefore: [
      "stream commitment",
      "entrance exam selection",
    ],
  },
  "Difficulty in choosing between engineering/medicine/other": {
    category: "Major Path Choice (Class 12)",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Validate confusion. Surface real job outcomes, salary reality, day-to-day work for each. Show backup options. Teach criteria (interest, marks fit, family affordability, career growth). Help student weight their own criteria.",
    addressBefore: ["entrance exam stress"],
  },
  "Worried about entrance exams or marks": {
    category: "Entrance Exam Anxiety",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Normalize mark anxiety. Stabilize confidence (show backup college paths). Create study plan with realistic targets. Do not let exam fear override career clarity (do both in parallel).",
    addressBefore: ["college selection finalization"],
  },
  "Low marks and recovery plan for future options": {
    category: "Academic Performance Recovery",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Normalize recovery. Move from shame to action: backup college paths, skill-first strategies (internships, freelancing), non-traditional routes (startups, apprenticeships). Show success examples of low-marks, high-outcome careers.",
    addressBefore: ["perfectionist goal-setting"],
  },
  "Want to switch course/college/stream": {
    category: "Mid-Path Course Correction",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Diagnose: is switch due to new clarity or panic? Help student evaluate tradeoffs (sunk cost, new opportunity, real vs. fantasy). Build decision framework and execution plan if switching is wise.",
    addressBefore: ["new path commitment"],
  },
  "Not getting job placements": {
    category: "Placement Crisis",
    priorityLevel: "HIGH",
    agentBehavior:
      "Urgent situation. Diagnose gaps: resume, interview skills, network, market fit. Build 90-day action plan: portfolio strengthening, off-campus applications, internship pivots, gig work. Provide hope via proven alternatives.",
    addressBefore: [],
    combinedRisks: ["Emotional crash", "Skill stagnation", "Family blame"],
  },
  "Tier-3 college survival strategy (skills + internships + off-campus)": {
    category: "Tier-3 College Strategy",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Empower student: tier is not destiny. Teach skill-first growth (projects, internships, hackathons, open-source). Build network strategy (online communities, mentor finding, alumni leverage). Create 4-year skill roadmap.",
    addressBefore: ["comparison-driven self-doubt"],
  },
  "English communication roadmap for interviews": {
    category: "Communication Skills Gap",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Normalize accent/language concerns. Provide 12-week interview communication plan (vocabulary, flow, confidence). Link to role-specific communication (different for sales vs. engineering). Build confidence via micro-practice.",
    addressBefore: ["interview execution"],
  },
  "Scholarship and affordability guidance": {
    category: "Affordability / Scholarship",
    priorityLevel: "HIGH",
    agentBehavior:
      "Acknowledge real affordability stress. Map college options by affordability tier. Provide scholarship search strategy, loan guidance, part-time paths, industry-sponsored programs. Make college decision possible despite cost.",
    addressBefore: ["college commitment"],
    combinedRisks: [
      "Family conflict",
      "Educational dropout",
      "Career abandonment",
    ],
  },
  "What if I fail this exam? fallback plan": {
    category: "Exam Failure Backup Planning",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Remove catastrophizing. Build concrete Plan B/C before exam. Show real career paths via each backup. Reduce anxiety by building optionality. Clarify: backup planning != expecting failure.",
    addressBefore: ["exam day panic"],
  },
  "Lack of motivation or interest in studies": {
    category: "Motivation / Engagement Loss",
    priorityLevel: "HIGH",
    agentBehavior:
      "Diagnose source: is it goal clarity, boring teaching method, or deeper depression? If goal, link studies to role. If method, suggest active learning. If depression, refer mental health. Create micro-win calendar.",
    addressBefore: ["goal setting", "competitive exam planning"],
    combinedRisks: [
      "Academic failure",
      "Career abandonment",
      "Mental health crisis",
    ],
  },
  "Want to prepare for government exams (IAS, etc.)": {
    category: "Government Exam Preparation",
    priorityLevel: "LOW",
    agentBehavior:
      "Practical planning mode. Realism: UPSC is 0.01% success rate. Build realistic timelines, study materials, backup plans. Link to public-sector role satisfaction (stability, impact). Do not oversell.",
    addressBefore: [],
  },
  "Want to go abroad for studies": {
    category: "International Education Exploration",
    priorityLevel: "LOW",
    agentBehavior:
      "Explore motivation: is it career outcome, adventure, or escape? Map realistic abroad pathways (universities, funding, ROI). Build backup for abroad doesn't happen. Create application timeline.",
    addressBefore: [],
  },
  "Financial issues affecting studies": {
    category: "Financial Hardship",
    priorityLevel: "HIGH",
    agentBehavior:
      "Acknowledge real hardship. Move to action: part-time work options, educational loans, scholarship search, skill-first alternatives to expensive education. Provide hope via affordable pathways.",
    addressBefore: [
      "goal-setting",
      "career timeline planning",
    ],
    combinedRisks: ["Educational dropout", "Career opportunity loss"],
  },
  "Other": {
    category: "Custom / Unclassified",
    priorityLevel: "MEDIUM",
    agentBehavior:
      "Listen and empathize. Ask follow-up to understand true pain underneath. Surface related priorities. Sequence accordingly.",
    addressBefore: [],
  },
};

/**
 * Calculate overall pain priority based on student's stated pain.
 * Returns priority level and agent behavior guidance.
 */
export function calculatePainPriority(
  studentPain: string | undefined
): {
  priorityLevel: PainPriorityLevel;
  behavior: string;
  addressBefore: string[];
} {
  if (!studentPain) {
    return {
      priorityLevel: "MEDIUM",
      behavior: "Start with exploratory mode. Use questions to surface real pain beneath initial statement.",
      addressBefore: [],
    };
  }

  const profile = PAIN_PRIORITY_MATRIX[studentPain];

  if (!profile) {
    return {
      priorityLevel: "MEDIUM",
      behavior:
        "Student pain category not recognized. Listen and ask follow-up questions to clarify actual pain and urgency.",
      addressBefore: [],
    };
  }

  return {
    priorityLevel: profile.priorityLevel,
    behavior: profile.agentBehavior,
    addressBefore: profile.addressBefore,
  };
}

/**
 * Combine multiple student pain signals to compute overall counseling priority.
 * Used when student mentions multiple stressors (e.g., exam stress + family pressure).
 */
export function combinePainSignals(pains: string[]): {
  overallPriority: PainPriorityLevel;
  guidedPainSequence: string[];
  combinedRisks: string[];
} {
  const profiles = pains
    .map((pain) => PAIN_PRIORITY_MATRIX[pain])
    .filter(Boolean);

  if (profiles.length === 0) {
    return {
      overallPriority: "MEDIUM",
      guidedPainSequence: pains,
      combinedRisks: [],
    };
  }

  // Compute highest priority
  const priorityOrder: Record<PainPriorityLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };
  const maxPriority = Math.max(...profiles.map((p) => priorityOrder[p.priorityLevel]));
  const overallPriority = Object.entries(priorityOrder).find(
    ([, score]) => score === maxPriority
  )?.[0] as PainPriorityLevel;

  // Sequence pains by priority (solve critical first, then high, etc.)
  const sequenced = profiles
    .sort((a, b) => priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel])
    .map((p) => p.category);

  // Collect combined risks
  const combinedRisks = Array.from(
    new Set(profiles.flatMap((p) => p.combinedRisks ?? []))
  );

  return {
    overallPriority,
    guidedPainSequence: sequenced,
    combinedRisks,
  };
}
