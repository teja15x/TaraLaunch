/**
 * Role Knowledge Depth Test & Adaptive Module System
 * 
 * For students who claim to know a role already:
 * 1. Diagnostic test (5-7 questions) to assess actual understanding
 * 2. Score their knowledge depth (surface vs. intermediate vs. expert)
 * 3. Identify misconceptions and blind spots
 * 4. Recommend which modules to prioritize
 * 5. Calibrate confidence (is their confidence matched by actual knowledge?)
 */

export interface DepthTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  conceptTested: "fundamentals" | "career-paths" | "day-to-day" | "salary" | "growth" | "reality-check";
  misconceptionTarget?: string; // e.g., "coding-is-everything", "salary-expectations", "entry-barriers"
}

export interface DepthTestResult {
  roleId: string;
  roleTitle: string;
  questionsAsked: number;
  correctAnswers: number;
  depthScore: number; // 0-100
  depthLevel: "surface" | "intermediate" | "advanced";
  misconceptions: string[];
  confidenceCalibration: number; // -50 to +50 (negative = overconfident, positive = underconfident)
  recommendedModules: number[]; // Which of 10 modules to focus on
  modulesToSkip: number[];
  priorityGaps: string[]; // Key areas where student is weak
}

export interface AdaptiveModuleRecommendation {
  moduleNumber: number;
  moduleTitle: string;
  priority: "critical" | "high" | "medium" | "skip";
  reason: string;
}

// ===== KNOWLEDGE DEPTH TESTS BY ROLE =====

export const ROLE_DEPTH_TESTS: Record<string, DepthTestQuestion[]> = {
  software_engineer: [
    {
      id: "se_1",
      question:
        "Software engineers spend most of their time writing new code. True or False?",
      options: [
        "True, new features are the primary focus",
        "False, most time is debugging, reviewing, and maintaining existing code",
        "True, but only in startups",
        "False, most time is in meetings",
      ],
      correctIndex: 1,
      conceptTested: "day-to-day",
      misconceptionTarget: "coding-is-everything",
    },
    {
      id: "se_2",
      question: "Which skill is MORE important for a senior engineer than coding?",
      options: [
        "Advanced algorithms",
        "System design and architecture",
        "Knowledge of every programming language",
        "Competitive programming performance",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
      misconceptionTarget: "technical-depth-only",
    },
    {
      id: "se_3",
      question:
        "What is the most common reason an engineer quits their job in India?",
      options: [
        "Low salary",
        "Lack of growth or learning",
        "Overwork and poor work-life balance",
        "Boredom with the role",
      ],
      correctIndex: 2,
      conceptTested: "reality-check",
      misconceptionTarget: "why-people-leave",
    },
    {
      id: "se_4",
      question:
        "At a tier-2 college, if you don't get campus placement, what is a realistic first move?",
      options: [
        "Start your own startup immediately",
        "Build 1-2 portfolio projects and apply off-campus",
        "Wait and apply to higher-paying internships",
        "Switch to a different career",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
      misconceptionTarget: "placement-is-everything",
    },
    {
      id: "se_5",
      question:
        "What typically happens to salary growth after 5-7 years as an engineer?",
      options: [
        "It plateaus unless you get promoted",
        "It keeps growing at the same rate as initial years",
        "It only grows if you change companies",
        "Most engineers are promoted to manager by then",
      ],
      correctIndex: 0,
      conceptTested: "salary",
      misconceptionTarget: "unlimited-salary-growth",
    },
    {
      id: "se_6",
      question:
        "Which of these is NOT a common career path for software engineers?",
      options: [
        "Backend engineer → Tech lead → Engineering manager",
        "Frontend developer → Product manager",
        "Software engineer → Data scientist (with upskilling)",
        "Software engineer → Management consultant (common pivot)",
      ],
      correctIndex: 3,
      conceptTested: "career-paths",
    },
    {
      id: "se_7",
      question:
        "In India, what is the realistic timeframe for a fresher to earn 20 LPA?",
      options: [
        "1-2 years if talented",
        "3-5 years with consistent growth and job switches",
        "Immediately at top companies",
        "10+ years, rare before that",
      ],
      correctIndex: 1,
      conceptTested: "reality-check",
      misconceptionTarget: "salary-expectations",
    },
  ],

  data_scientist: [
    {
      id: "ds_1",
      question:
        "What percentage of a data scientist's time is usually spent on data cleaning and preprocessing?",
      options: [
        "10-20%",
        "30-40%",
        "60-80%",
        "5% (most tools automate this)",
      ],
      correctIndex: 2,
      conceptTested: "day-to-day",
      misconceptionTarget: "all-ml-models",
    },
    {
      id: "ds_2",
      question: "What is the primary skill that separates a junior from a senior data scientist?",
      options: [
        "Knowledge of more machine learning algorithms",
        "Ability to communicate findings and drive business impact",
        "Ability to tune hyperparameters perfectly",
        "Experience with GPUs and big data frameworks",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
    },
    {
      id: "ds_3",
      question:
        "If your model has 95% accuracy but the business metric (revenue, conversion) doesn't improve, what likely went wrong?",
      options: [
        "The algorithm is weak",
        "You solved the wrong problem or didn't communicate insights well",
        "Hyperparameters need more tuning",
        "The dataset is too small",
      ],
      correctIndex: 1,
      conceptTested: "reality-check",
      misconceptionTarget: "accuracy-is-success",
    },
    {
      id: "ds_4",
      question:
        "What is a realistic entry path to data science in India for a student from a non-CS background?",
      options: [
        "You must have a CS degree",
        "Complete a data science bootcamp, build portfolio projects, apply to analyst roles first",
        "Learn Python and apply directly as data scientist",
        "Get an MBA in data science",
      ],
      correctIndex: 1,
      conceptTested: "fundamentals",
    },
    {
      id: "ds_5",
      question: "How has the entry-level data science market changed in 2024-2025?",
      options: [
        "More jobs, less competition",
        "Same as 3 years ago",
        "Fewer dedicated junior DS roles; more emphasis on full-stack data skills",
        "All DS jobs moved to AI/ML engineering",
      ],
      correctIndex: 2,
      conceptTested: "reality-check",
      misconceptionTarget: "saturated-field",
    },
    {
      id: "ds_6",
      question:
        "What is the most common reason data scientists struggle to get hired in India?",
      options: [
        "Lack of statistical knowledge",
        "Can't communicate findings; can't bridge tech and business",
        "Can't code in Python",
        "Don't know advanced algorithms",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
    },
    {
      id: "ds_7",
      question:
        "Which role is NOT typically a natural career progression from data scientist?",
      options: [
        "Data engineer",
        "ML ops / platform engineer",
        "Product manager",
        "Mechanical engineer",
      ],
      correctIndex: 3,
      conceptTested: "career-paths",
    },
  ],

  product_manager: [
    {
      id: "pm_1",
      question: "What is the primary responsibility of a product manager?",
      options: [
        "Writing technical specifications and code",
        "Defining what gets built and ensuring it solves real problems",
        "Managing the engineering team",
        "Marketing the product",
      ],
      correctIndex: 1,
      conceptTested: "fundamentals",
    },
    {
      id: "pm_2",
      question:
        "A feature you championed is live, but users are not adopting it. What should you do?",
      options: [
        "Market it harder",
        "Investigate why (did you solve the real problem?), talk to users, iterate",
        "Blame the engineering team for poor execution",
        "Move on to the next feature",
      ],
      correctIndex: 1,
      conceptTested: "reality-check",
      misconceptionTarget: "shipping-is-success",
    },
    {
      id: "pm_3",
      question:
        "What skill is LESS critical for becoming a product manager in India right now?",
      options: [
        "Communication and storytelling",
        "Data analysis",
        "Advanced software engineering",
        "User empathy and research",
      ],
      correctIndex: 2,
      conceptTested: "fundamentals",
    },
    {
      id: "pm_4",
      question: "What is a realistic entry point as a PM in India (2025)?",
      options: [
        "You can apply directly as PM from any graduation",
        "Analyst/Associate PM role after working 2-3 years in another role or bootcamp",
        "Only if you have an MBA",
        "Start as engineer, get promoted after 10 years",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
    },
    {
      id: "pm_5",
      question:
        "Which is the most important metric for a PM to track for a social app?",
      options: [
        "Number of features shipped",
        "Weekly active users and retention",
        "Engineering velocity",
        "Number of bugs fixed",
      ],
      correctIndex: 1,
      conceptTested: "day-to-day",
    },
    {
      id: "pm_6",
      question:
        "Is it better for a PM to be super technical or super user-focused?",
      options: [
        "Super technical always",
        "Super user-focused always",
        "User-focused FIRST, technical working knowledge SECOND",
        "Either one works",
      ],
      correctIndex: 2,
      conceptTested: "reality-check",
      misconceptionTarget: "engineer-to-pm",
    },
  ],

  mechanical_engineer: [
    {
      id: "me_1",
      question:
        "What is the largest source of job stagnation for mechanical engineers in India?",
      options: [
        "Lack of jobs",
        "Salary ceiling without MBA or specialized skills",
        "Too many jobs, not enough candidates",
        "Poor engineering education quality",
      ],
      correctIndex: 1,
      conceptTested: "reality-check",
      misconceptionTarget: "easy-growth",
    },
    {
      id: "me_2",
      question:
        "Which sector is offering the MOST growth for mechanical engineers in 2025?",
      options: [
        "Automobile (traditional)",
        "EV, renewable energy, robotics, automation",
        "Mining",
        "Construction equipment only",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
    },
    {
      id: "me_3",
      question:
        "For a mechanical engineer from a tier-2 college, what is the realistic first salary?",
      options: [
        "5-8 LPA",
        "3-5 LPA",
        "10-15 LPA",
        "1-3 LPA",
      ],
      correctIndex: 1,
      conceptTested: "salary",
    },
    {
      id: "me_4",
      question:
        "What skill gap do most mechanical engineers face when entering manufacturing?",
      options: [
        "Theoretical knowledge",
        "Practical problem-solving, troubleshooting, and communication on shop floor",
        "CAD skills",
        "Physical strength",
      ],
      correctIndex: 1,
      conceptTested: "day-to-day",
      misconceptionTarget: "college-prepares-fully",
    },
    {
      id: "me_5",
      question:
        "Which is NOT a realistic role for a mechanical engineer with 5-7 years experience?",
      options: [
        "Production engineer → Plant manager",
        "Design engineer → Senior designer / technical lead",
        "Mechanical engineer → Directly to C-suite",
        "Field engineer → Applications engineer",
      ],
      correctIndex: 2,
      conceptTested: "career-paths",
    },
  ],

  doctor: [
    {
      id: "doc_1",
      question:
        "What is the most common reason young doctors in India consider leaving medicine?",
      options: [
        "Low salary",
        "Burnout, long hours, emotional exhaustion, and student loan burden",
        "Too many patients",
        "Too much studying",
      ],
      correctIndex: 1,
      conceptTested: "reality-check",
      misconceptionTarget: "prestige-is-enough",
    },
    {
      id: "doc_2",
      question: "For a medical student, what determines specialty options?",
      options: [
        "Your passion alone",
        "NEET/FMGE score, merit, family expectations, financial ability for PG fees",
        "Only family doctor's advice",
        "Easiest specialization available",
      ],
      correctIndex: 1,
      conceptTested: "fundamentals",
    },
    {
      id: "doc_3",
      question:
        "Is private practice immediately an option after MBBS in India?",
      options: [
        "Yes, any MBBS graduate can open a clinic",
        "Yes, but limited scope (registration varies by state), internship/residency usually needed first",
        "No, you must work in hospital for 10 years first",
        "Only if you're in a metro city",
      ],
      correctIndex: 1,
      conceptTested: "fundamentals",
    },
    {
      id: "doc_4",
      question:
        "What is realistic salary growth for a doctor in India (0-10 years)?",
      options: [
        "Immediate high salary, exponential growth",
        "Government doctor: slow growth; Private: variable but potentially higher",
        "All doctors earn the same",
        "Doctors earn less than engineers always",
      ],
      correctIndex: 1,
      conceptTested: "salary",
    },
    {
      id: "doc_5",
      question:
        "A student asks, 'What if I don't rank high in NEET and can't get MBBS?' What is a good fallback?",
      options: [
        "There are no alternatives",
        "BPT (Physiotherapy), nursing, medical technician routes; different but rewarding healthcare careers",
        "They should forget healthcare entirely",
        "Wait and take NEET again indefinitely",
      ],
      correctIndex: 1,
      conceptTested: "career-paths",
    },
  ],
};

// ===== SCORING & INTERPRETATION =====

export function scoreDepthTest(
  roleId: string,
  answers: number[]
): DepthTestResult {
  const tests = ROLE_DEPTH_TESTS[roleId] || [];

  const correctAnswers = answers.filter(
    (answerIndex, idx) => answerIndex === tests[idx]?.correctIndex
  ).length;

  const depthScore = Math.round((correctAnswers / tests.length) * 100);

  // Categorize depth level
  let depthLevel: "surface" | "intermediate" | "advanced";
  if (depthScore < 40) depthLevel = "surface";
  else if (depthScore < 70) depthLevel = "intermediate";
  else depthLevel = "advanced";

  // Identify misconceptions (questions they got wrong on specific topics)
  const misconceptions = tests
    .filter((q, idx) => answers[idx] !== q.correctIndex && q.misconceptionTarget)
    .map((q) => q.misconceptionTarget!)
    .filter((v, i, a) => a.indexOf(v) === i);

  // Recommend modules based on depth level
  const {
    recommendedModules,
    modulesToSkip,
    priorityGaps,
  } = getAdaptiveModuleRecommendations(depthLevel, misconceptions);

  return {
    roleId,
    roleTitle: roleId.replace(/_/g, " ").toUpperCase(),
    questionsAsked: tests.length,
    correctAnswers,
    depthScore,
    depthLevel,
    misconceptions,
    confidenceCalibration: 0, // Will be set by agent after initial confidence claim
    recommendedModules,
    modulesToSkip,
    priorityGaps,
  };
}

function getAdaptiveModuleRecommendations(
  depthLevel: "surface" | "intermediate" | "advanced",
  misconceptions: string[]
): {
  recommendedModules: number[];
  modulesToSkip: number[];
  priorityGaps: string[];
} {
  const allModules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 10-module sequence: 1=role reality, 2=fit signals, 3=exam/entry, 4=college, 5=first-year skills, 6=internship, 7=placement, 8=salary growth, 9=work-life, 10=backup

  if (depthLevel === "advanced") {
    return {
      recommendedModules: [7, 8, 9, 10], // Advanced: placement reality, salary growth, work-life, backup
      modulesToSkip: [1, 2, 3, 4, 5, 6],
      priorityGaps: ["Work-life balance realities", "Salary negotiation", "Fallback planning"],
    };
  }

  if (depthLevel === "intermediate") {
    const moduleGaps: Record<string, number[]> = {
      "coding-is-everything": [4, 5, 6],
      "salary-expectations": [7, 8],
      "prestige-is-enough": [9],
      "placement-is-everything": [6, 7],
      "unlimited-salary-growth": [8, 9],
      "accurate-field": [7, 8],
      "shipping-is-success": [5, 6, 9],
      "engineer-to-pm": [5, 6],
      "easy-growth": [8, 9],
      "college-prepares-fully": [5, 6],
      "all-ml-models": [5, 6],
      "accuracy-is-success": [7, 8, 9],
      "why-people-leave": [9],
    };

    const gapModules = Array.from(new Set(
      misconceptions.flatMap((m) => moduleGaps[m] || [])
    )).sort((a, b) => a - b);

    return {
      recommendedModules: gapModules.length > 0 ? gapModules : [5, 6, 7, 8, 9],
      modulesToSkip: allModules.filter((m) => !gapModules.includes(m) && m !== 1 && m !== 2),
      priorityGaps: misconceptions,
    };
  }

  // Surface level: start from the beginning
  return {
    recommendedModules: allModules,
    modulesToSkip: [],
    priorityGaps: ["Need comprehensive understanding from fundamentals"],
  };
}

/**
 * Calibrate student confidence against actual test performance
 * Returns -50 to +50
 *  -50 = massively overconfident (thinks they know, but scored 10%)
 *  0 = perfectly calibrated
 *  +50 = underestimating themselves (thinks they're okay, but scored 95%)
 */
export function calibrateConfidence(
  studentClaimedConfidence: number, // 0-100
  depthScore: number // 0-100
): number {
  const diff = depthScore - studentClaimedConfidence;
  // Cap at -50 to +50
  return Math.max(-50, Math.min(50, diff));
}

/**
 * Generate feedback for the student based on test results
 */
export function generateDepthTestFeedback(
  result: DepthTestResult,
  studentClaimedConfidence: number
): string {
  const calibration = calibrateConfidence(studentClaimedConfidence, result.depthScore);

  const lines = [
    `## Your Role Knowledge Check: **${result.depthScore}/100**`,
    "",
  ];

  // Calibration feedback
  if (calibration < -30) {
    lines.push(
      `⚠️ **You're more confident than your actual knowledge.**`
    );
    lines.push(
      `You think you know this role, but the test shows gaps. That's super common — and fixable!`
    );
  } else if (calibration > 30) {
    lines.push(
      `✨ **You're underestimating yourself!** You scored higher than you thought.`
    );
  } else if (calibration === 0) {
    lines.push(`✓ **Your confidence matches your knowledge. Well-calibrated!**`);
  }

  lines.push("");

  // Knowledge level
  lines.push(`### What This Means`);
  if (result.depthLevel === "surface") {
    lines.push(
      `You have **surface-level knowledge**. You know the role name and basic idea, but miss day-to-day realities, salary ranges, growth paths, and common misconceptions. No worries — we'll build depth.`
    );
  } else if (result.depthLevel === "intermediate") {
    lines.push(
      `You have **intermediate knowledge**. You know quite a bit, but blind spots exist. Let's fix those specific gaps.`
    );
  } else {
    lines.push(
      `You have **advanced knowledge**. You understand this role well. We'll focus on work-life realities, salary growth specifics, and backup plans.`
    );
  }

  lines.push("");

  // Misconceptions
  if (result.misconceptions.length > 0) {
    lines.push(`### Key Misconceptions to Address`);
    const misconceptionLabels: Record<string, string> = {
      "coding-is-everything":
        "Coding skills ≠ Job success (communication + speed matter more)",
      "salary-expectations": "Salary growth is slower than expected initially",
      "prestige-is-enough":
        "Prestige doesn't prevent burnout or guarantee salary",
      "placement-is-everything":
        "No placement can be recovered; it's not a dead-end",
      "unlimited-salary-growth":
        "Salary growth plateaus without promotions or job switches",
      "saturated-field": "Market dynamics are changing; skills-first strategy works",
      "shipping-is-success":
        "Shipping a feature isn't success unless it solves a real problem",
      "engineer-to-pm":
        "Good engineers don't always make good PMs; different skills needed",
      "easy-growth":
        "Career growth requires intentional upskilling, not just experience",
      "college-prepares-fully":
        "College doesn't prepare for real work; learn on the job",
      "all-ml-models":
        "Most data science is data cleaning, not model building",
      "accuracy-is-success":
        "Model accuracy ≠ business impact; communication matters",
      "why-people-leave": "People leave great roles due to culture, growth, or lifestyle — not just money.",
    };

    result.misconceptions.forEach((m) => {
      lines.push(`- ${misconceptionLabels[m] || m}`);
    });
    lines.push("");
  }

  // Module recommendation
  lines.push(`### Your Personalized Learning Path`);
  lines.push(
    `We're skipping basics and focusing on these **${result.recommendedModules.length}** modules:`
  );
  const moduleNames = [
    "Role Reality",
    "Fit Signals",
    "Exam/Entry",
    "College Strategy",
    "First-Year Skills",
    "Internship Strategy",
    "Placement & First Job",
    "Salary Growth",
    "Work-Life Realities",
    "Backup Paths",
  ];
  result.recommendedModules.forEach((m) => {
    lines.push(`- Module ${m}: ${moduleNames[m - 1]}`);
  });

  lines.push("");
  lines.push(`This respects what you know while filling the gaps.`);

  return lines.join("\n");
}
