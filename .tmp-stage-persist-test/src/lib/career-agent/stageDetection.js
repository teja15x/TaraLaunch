"use strict";
/**
 * Stage Detection Engine for Career Agent
 * Automatically detects which life stage a student is in based on intake signals
 *
 * Stages:
 * - PRE_12TH: Class 9-10, deciding on stream (PCM/PCB/Commerce/Arts)
 * - POST_12TH: Class 11-12, preparing for entrance exams (JEE/NEET)
 * - IN_COLLEGE: Year 1-3 of college, may be regretting choice
 * - POST_COLLEGE: Recently graduated, dealing with employment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentStage = void 0;
exports.deriveCounselingTrack = deriveCounselingTrack;
exports.detectStudentStage = detectStudentStage;
exports.getStageName = getStageName;
exports.getStageEmoji = getStageEmoji;
exports.detectStageOverride = detectStageOverride;
var StudentStage;
(function (StudentStage) {
    StudentStage["PRE_12TH"] = "pre12th";
    StudentStage["POST_12TH"] = "post12th";
    StudentStage["IN_COLLEGE"] = "inCollege";
    StudentStage["POST_COLLEGE"] = "postCollege";
    StudentStage["UNKNOWN"] = "unknown";
})(StudentStage || (exports.StudentStage = StudentStage = {}));
function mapDeclaredStage(currentStage) {
    const normalized = (currentStage ?? '').trim().toLowerCase();
    if (!normalized)
        return null;
    if (normalized === 'class 10')
        return StudentStage.PRE_12TH;
    if (normalized.includes('intermediate'))
        return StudentStage.POST_12TH;
    if (normalized.includes('diploma') ||
        normalized.includes('polytechnic') ||
        normalized.includes('degree 1st') ||
        normalized.includes('degree 2nd') ||
        normalized.includes('btech 1st') ||
        normalized.includes('btech 2nd') ||
        normalized.includes('final year') ||
        normalized.includes('placement stage')) {
        return StudentStage.IN_COLLEGE;
    }
    if (normalized.includes('graduated'))
        return StudentStage.POST_COLLEGE;
    return null;
}
function normalizeStageText(value) {
    return (value ?? '').trim().toLowerCase();
}
function deriveCounselingTrack(input) {
    const stageText = `${normalizeStageText(input.currentStage)} ${normalizeStageText(input.detectedStage)}`.trim().toLowerCase();
    const situationText = normalizeStageText(input.currentSituation);
    // Handle StudentStage enum values directly
    if (stageText.includes('postcollege') ||
        stageText.includes('post-college') ||
        situationText.includes('unemploy') ||
        situationText.includes('no job') ||
        situationText.includes('graduated') ||
        situationText.includes('passed out')) {
        return 'post-college-employability';
    }
    // School-exam support for class/intermediate and exam-heavy contexts
    // This includes pre-12th and post-12th students
    if (stageText.includes('pre12th') ||
        stageText.includes('pre-12th') ||
        stageText.includes('post12th') ||
        stageText.includes('post-12th') ||
        stageText.includes('class 10') ||
        stageText.includes('class 11') ||
        stageText.includes('class 12') ||
        stageText.includes('class-10') ||
        stageText.includes('class-11') ||
        stageText.includes('class-12') ||
        stageText.includes('intermediate') ||
        situationText.includes('exam') ||
        situationText.includes('marks') ||
        situationText.includes('syllabus')) {
        return 'school-exam-support';
    }
    // Degree/BTech/final-year/placement stays in core counseling until graduated
    return 'career-counseling';
}
// ============================================================================
// STAGE SIGNALS - KEYWORD PATTERNS
// ============================================================================
const STAGE1_SIGNALS = {
    class: ['class 9', 'class 10', '9th grade', '10th grade', 'class 9th', 'class 10th', 'ix', 'x'],
    board: ['board exam', 'board exams', 'board coming', 'board next', 'boards'],
    streamConfusion: [
        'pcm or pcb',
        'pcm vs pcb',
        'stream choice',
        'which stream',
        'science vs commerce',
        'science or commerce',
        'arts or science',
        'which branch to choose',
        'should i choose',
    ],
};
const STAGE2_SIGNALS = {
    class: ['class 11', 'class 12', '11th grade', '12th grade', 'class 11th', 'class 12th', 'xi', 'xii'],
    entranceExam: [
        'jee',
        'neet',
        'jee prep',
        'neet prep',
        'entrance exam',
        'entrance exams',
        'mock test',
        'mock exams',
        'scoring',
        'rank',
        'all india rank',
        'air',
    ],
    collegeChoice: ['which college', 'college tier', 'iit', 'nit', 'tier-1', 'tier-2', 'tier-3', 'should i take'],
    timeline: ['months left', 'weeks left', 'days left', 'countdown', 'after 12th', 'after board'],
    coachingStress: [
        'coaching',
        'coaching center',
        'tuition',
        'hours daily',
        'study hours',
        'pressure',
        'competitive',
        'intense',
    ],
};
const STAGE3_SIGNALS = {
    year: ['year 1', 'year 2', 'year 3', 'year 4', 'first year', 'second year', 'third year', 'final year'],
    college: ['college', 'university', 'nit', 'iit', 'bits', 'vit', 'dcet', 'engineering college'],
    regret: ['regret', 'wrong choice', 'should have', 'cannot switch', 'can i switch', 'not enjoying'],
    placement: [
        'placement',
        'placements',
        'campus interview',
        'internship',
        'job offer',
        'recruitment',
        'hr',
        'salary package',
    ],
    hostel: ['hostel', 'dorm', 'college life', 'semester', 'exam', 'assignment'],
};
const STAGE4_SIGNALS = {
    graduation: [
        'graduated',
        'passed out',
        'post-grad',
        'after graduation',
        'recently graduated',
        'just finished',
        'degree in hand',
    ],
    employment: [
        'job hunting',
        'unemployed',
        'no job',
        'rejected',
        'applications',
        'cv',
        'interview',
        'freelance',
        'freelancing',
        'consultant',
    ],
    timeline: ['6 months', '3 months', 'since graduation', 'after college', 'since i graduated'],
    despair: ['why no job', 'my degree is useless', 'tier-4 stigma', 'reskill', 'startup'],
};
// ============================================================================
// SCORING FUNCTIONS
// ============================================================================
function scoreSignals(signals, intake) {
    const allIntakeText = Object.values(intake)
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    const matchedSignals = [];
    let score = 0;
    for (const [category, keywords] of Object.entries(signals)) {
        for (const keyword of keywords) {
            if (allIntakeText.includes(keyword.toLowerCase())) {
                matchedSignals.push(`${category}:${keyword}`);
                score += 10; // Base per-signal score
            }
        }
    }
    return [score, matchedSignals];
}
function detectPre12th(intake) {
    const [score] = scoreSignals(STAGE1_SIGNALS, intake);
    let finalScore = score;
    // Penalty if college signals present
    const allText = Object.values(intake).join(' ').toLowerCase();
    if (allText.includes('college') ||
        allText.includes('jee') ||
        allText.includes('neet') ||
        allText.includes('year ')) {
        finalScore -= 50;
    }
    return Math.max(0, finalScore);
}
function detectPost12th(intake) {
    const [score] = scoreSignals(STAGE2_SIGNALS, intake);
    let finalScore = score;
    // Strong signal boost
    const allText = Object.values(intake).join(' ').toLowerCase();
    if ((allText.includes('class 12') || allText.includes('class 11')) &&
        (allText.includes('jee') || allText.includes('neet'))) {
        finalScore += 30;
    }
    // Penalty if already in college
    if (allText.includes('year') && (allText.includes('college') || allText.includes('university'))) {
        finalScore -= 40;
    }
    return Math.max(0, finalScore);
}
function detectInCollege(intake) {
    const [score] = scoreSignals(STAGE3_SIGNALS, intake);
    let finalScore = score;
    // Strong signal boost
    const allText = Object.values(intake).join(' ').toLowerCase();
    if ((allText.match(/year [1-4]/gi) || allText.includes('first year') || allText.includes('second year')) &&
        (allText.includes('college') || allText.includes('university') || allText.includes('nit') || allText.includes('iit'))) {
        finalScore += 40;
    }
    // Regret + college = very strong
    if (allText.includes('regret') && (allText.includes('year') || allText.includes('college'))) {
        finalScore += 30;
    }
    // Penalty if graduated
    if (allText.includes('graduated') || allText.includes('passed out')) {
        finalScore -= 60;
    }
    return Math.max(0, finalScore);
}
function detectPostCollege(intake) {
    const [score] = scoreSignals(STAGE4_SIGNALS, intake);
    let finalScore = score;
    const allText = Object.values(intake).join(' ').toLowerCase();
    // Strong signal boost
    if ((allText.includes('graduated') || allText.includes('passed out') || allText.includes('degree in hand')) &&
        (allText.includes('job') || allText.includes('unemployed') || allText.includes('freelance'))) {
        finalScore += 40;
    }
    // Despair language boost
    if (allText.includes('why no job') || allText.includes('reskill')) {
        finalScore += 20;
    }
    // Penalty if pre-college
    if (allText.includes('class') && (allText.includes('9') || allText.includes('10') || allText.includes('11'))) {
        finalScore -= 60;
    }
    return Math.max(0, finalScore);
}
// ============================================================================
// CLARIFYING QUESTIONS
// ============================================================================
const CLARIFYING_QUESTIONS = {
    [StudentStage.PRE_12TH]: 'To give you the best guidance, are you currently: (A) In Class 9-10, deciding on a stream (PCM/PCB/Commerce/Arts)? (B) Something else?',
    [StudentStage.POST_12TH]: 'I want to make sure I help the right way. Are you currently: (A) In Class 11-12, preparing for entrance exams like JEE or NEET? (B) Something else?',
    [StudentStage.IN_COLLEGE]: 'Just to clarify: Are you currently: (A) In college (Year 1-3), studying your chosen field? (B) Already graduated?',
    [StudentStage.POST_COLLEGE]: 'So you graduated and are now: (A) Looking for a job or dealing with no job offers so far? (B) Something different?',
    [StudentStage.UNKNOWN]: `To give you the best guidance, which of these is closest to you right now?
    - (A) Class 9-10: Deciding which stream to choose (PCM/PCB/Commerce/Arts)
    - (B) Class 11-12: Preparing for entrance exams (JEE/NEET/Others)
    - (C) In College: Year 1-3 of your degree
    - (D) Recently Graduated: Looking for a job or dealing with no offers yet
    - (E) Not sure`,
};
// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================
function detectStudentStage(intake) {
    const declaredStage = mapDeclaredStage(intake.currentStage);
    if (declaredStage) {
        return {
            stage: declaredStage,
            confidence: 96,
            reasoning: 'Detected directly from selected intake stage.',
            signalsFound: [`declared-stage:${intake.currentStage ?? ''}`],
            detectedAt: new Date().toISOString(),
        };
    }
    const scores = {
        [StudentStage.PRE_12TH]: detectPre12th(intake),
        [StudentStage.POST_12TH]: detectPost12th(intake),
        [StudentStage.IN_COLLEGE]: detectInCollege(intake),
        [StudentStage.POST_COLLEGE]: detectPostCollege(intake),
    };
    // Find max stage
    let maxStage = StudentStage.UNKNOWN;
    let maxScore = 0;
    for (const [stage, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            maxStage = stage;
        }
    }
    // Calculate confidence (0-100)
    const confidence = Math.min(100, maxScore);
    // Determine if we need clarification
    let needsClarification = false;
    if (confidence < 70) {
        needsClarification = true;
    }
    // Get signals found
    let signalsFound = [];
    if (maxStage === StudentStage.PRE_12TH) {
        const [_, signals] = scoreSignals(STAGE1_SIGNALS, intake);
        signalsFound = signals;
    }
    else if (maxStage === StudentStage.POST_12TH) {
        const [_, signals] = scoreSignals(STAGE2_SIGNALS, intake);
        signalsFound = signals;
    }
    else if (maxStage === StudentStage.IN_COLLEGE) {
        const [_, signals] = scoreSignals(STAGE3_SIGNALS, intake);
        signalsFound = signals;
    }
    else if (maxStage === StudentStage.POST_COLLEGE) {
        const [_, signals] = scoreSignals(STAGE4_SIGNALS, intake);
        signalsFound = signals;
    }
    // Build reasoning
    let reasoning = '';
    if (confidence >= 90) {
        reasoning = `Confident detection (${confidence}%): ${signalsFound.slice(0, 3).join(', ')}`;
    }
    else if (confidence >= 70) {
        reasoning = `Likely detection (${confidence}%): Multiple signals match`;
    }
    else if (confidence >= 50) {
        reasoning = `Uncertain (${confidence}%): Some signals match but ambiguous`;
    }
    else {
        reasoning = `Insufficient signals (${confidence}%): Need clarification`;
        maxStage = StudentStage.UNKNOWN;
    }
    return {
        stage: maxStage,
        confidence,
        clarifyingQuestion: needsClarification ? CLARIFYING_QUESTIONS[maxStage] : undefined,
        reasoning,
        signalsFound: signalsFound.slice(0, 10), // Top 10 signals
        detectedAt: new Date().toISOString(),
    };
}
// ============================================================================
// HELPER: Get stage-specific names and emojis
// ============================================================================
function getStageName(stage) {
    const names = {
        [StudentStage.PRE_12TH]: 'Pre-12th (Class 9-10)',
        [StudentStage.POST_12TH]: 'Post-12th (JEE/NEET Prep)',
        [StudentStage.IN_COLLEGE]: 'In-College (Year 1-3)',
        [StudentStage.POST_COLLEGE]: 'Post-College (Job Search)',
        [StudentStage.UNKNOWN]: 'Unknown Stage',
    };
    return names[stage];
}
function getStageEmoji(stage) {
    const emojis = {
        [StudentStage.PRE_12TH]: '📚',
        [StudentStage.POST_12TH]: '🎯',
        [StudentStage.IN_COLLEGE]: '🎓',
        [StudentStage.POST_COLLEGE]: '💼',
        [StudentStage.UNKNOWN]: '❓',
    };
    return emojis[stage];
}
/**
 * Detects if student contradicts their previously detected stage in a new message.
 *
 * Examples:
 * - "Actually I'm already in college" (contradicts pre-12th) → Override
 * - "Just wrote my 10th board exams yesterday" (contradicts post-college) → Override
 * - "I'm still in 11th as I mentioned" (matches post-12th) → No override
 */
function detectStageOverride(previousStage, newMessage) {
    if (!previousStage || previousStage === StudentStage.UNKNOWN) {
        return {
            hasOverride: false,
            reason: 'No previous stage to compare against',
            shouldUpdate: false,
        };
    }
    // Run detection on new message only
    const detectionResult = detectStudentStage({ currentStage: newMessage });
    const newStage = detectionResult.stage;
    // Same stage = no override needed
    if (newStage === previousStage || newStage === StudentStage.UNKNOWN) {
        return {
            hasOverride: false,
            reason: 'New message is consistent with previous stage',
            shouldUpdate: false,
        };
    }
    // Different stage = override
    const confidence = detectionResult.confidence;
    const shouldUpdate = confidence >= 75; // Only update if we're confident (75%+)
    return {
        hasOverride: true,
        previousStage,
        newStage,
        reason: `Student contradicts previous stage (confidence: ${confidence}%). Transitioning from ${getStageName(previousStage)} to ${getStageName(newStage)}.`,
        shouldUpdate,
    };
}
