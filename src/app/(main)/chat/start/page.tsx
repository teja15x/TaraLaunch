'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  CONVERSATION_STYLE_OPTIONS,
  SCRIPT_PREFERENCE_OPTIONS,
  SUPPORTED_COUNSELING_LANGUAGES,
  getResolvedConversationStyleForLanguage,
  getDefaultScriptPreference,
  type SupportedCounselingLanguage,
  type SupportedConversationStyle,
  type SupportedScriptPreference,
} from '@/lib/career-agent/prompt';
import {
  CHAT_PREFERENCES_UPDATED_EVENT,
  LOCAL_CHAT_PREFERENCES_KEY,
  LOCAL_STUDENT_INTAKE_KEY,
} from '@/lib/career-agent/storage';
import { Button } from '@/components/ui/Button';

const INTAKE_STAGE_OPTIONS = [
  'Class 10',
  'Intermediate 1st year',
  'Intermediate 2nd year',
  'Diploma / Polytechnic',
  'Degree 1st year',
  'Degree 2nd or 3rd year',
  'BTech 1st year',
  'BTech 2nd or 3rd year',
  'Final year / placement stage',
  'Graduated / job confusion',
  'Other',
] as const;

interface StudentIntake {
  studentName: string;
  currentStage: string;
  stateOrCity: string;
  collegeRecommendationScope: 'state-first' | 'india-wide';
  comparisonFocus: string;
  currentSituation: string;
  interests: string;
  confusion: string;
  stressors: string;
  familyPressure: string;
  targetRole: string;
}


const COMMON_STUDENT_PROBLEMS = [
  'Exam stress control and panic before tests',
  'Confused about which stream or course to choose',
  'Need stream clarity (MPC/BiPC/Commerce/Arts)',
  'Unemployment or underemployment fear after graduation',
  'Skills mismatch with current job market demands',
  'Job market volatility and future uncertainty',
  'Not sure about career options after 10th/12th',
  'Difficulty in choosing between engineering/medicine/other',
  'Worried about entrance exams or marks',
  'Low marks and recovery plan for future options',
  'Family pressure to pick a certain path',
  'Social or cultural pressure affecting career choice',
  'Need parent-pressure handling script',
  'Lack of motivation or interest in studies',
  'Want to switch course/college/stream',
  'Not getting job placements',
  'Tier-3 college survival strategy (skills + internships + off-campus)',
  'English communication roadmap for interviews',
  'Scholarship and affordability guidance',
  'What if I fail this exam? fallback plan',
  'Confidence rebuilding after setbacks or drop year',
  'Overthinking to action weekly accountability plan',
  'Digital addiction or social media distraction',
  'Lifestyle or harmful habits affecting focus and consistency',
  'Want to prepare for government exams (IAS, etc.)',
  'Want to go abroad for studies',
  'Financial issues affecting studies',
  'Mental stress or burnout',
  'Other',
];

const PROBLEMS_BY_BUCKET: Record<IntakeJourneyBucket, string[]> = {
  'pre-11': [
    'Need stream clarity (MPC/BiPC/Commerce/Arts)',
    'Not sure about career options after 10th/12th',
    'Confused about which stream or course to choose',
    'Family pressure to pick a certain path',
    'Worried about entrance exams or marks',
    'What if I fail this exam? fallback plan',
    'Exam stress control and panic before tests',
    'Other',
  ],
  intermediate: [
    'Difficulty in choosing between engineering/medicine/other',
    'Confused about which stream or course to choose',
    'Worried about entrance exams or marks',
    'Low marks and recovery plan for future options',
    'Family pressure to pick a certain path',
    'Scholarship and affordability guidance',
    'Mental stress or burnout',
    'Other',
  ],
  'early-college': [
    'Want to switch course/college/stream',
    'Tier-3 college survival strategy (skills + internships + off-campus)',
    'English communication roadmap for interviews',
    'Lack of motivation or interest in studies',
    'Digital addiction or social media distraction',
    'Lifestyle or harmful habits affecting focus and consistency',
    'Family pressure to pick a certain path',
    'Other',
  ],
  'final-year': [
    'Not getting job placements',
    'Skills mismatch with current job market demands',
    'Unemployment or underemployment fear after graduation',
    'Job market volatility and future uncertainty',
    'English communication roadmap for interviews',
    'Overthinking to action weekly accountability plan',
    'Confidence rebuilding after setbacks or drop year',
    'Other',
  ],
  graduated: [
    'Unemployment or underemployment fear after graduation',
    'Skills mismatch with current job market demands',
    'Job market volatility and future uncertainty',
    'Want to prepare for government exams (IAS, etc.)',
    'Want to go abroad for studies',
    'Financial issues affecting studies',
    'Mental stress or burnout',
    'Other',
  ],
  other: COMMON_STUDENT_PROBLEMS,
};

const PROBLEMS_REQUIRING_COMPARISON = new Set([
  'Confused about which stream or course to choose',
  'Need stream clarity (MPC/BiPC/Commerce/Arts)',
  'Not sure about career options after 10th/12th',
  'Difficulty in choosing between engineering/medicine/other',
  'Want to switch course/college/stream',
  'Want to go abroad for studies',
  'What if I fail this exam? fallback plan',
  'Unemployment or underemployment fear after graduation',
  'Skills mismatch with current job market demands',
  'Job market volatility and future uncertainty',
  'Not getting job placements',
  'Tier-3 college survival strategy (skills + internships + off-campus)',
]);

function shouldCollectComparison(problem: string, otherProblem: string): boolean {
  if (!problem) return false;
  if (PROBLEMS_REQUIRING_COMPARISON.has(problem)) return true;
  if (problem !== 'Other') return false;

  return /\b(compare|comparison|vs|versus|choose|choice|switch|college|branch|course|pathway|mtech|mba|ms|job|abroad)\b/i.test(
    otherProblem
  );
}

const MAJOR_CITIES = [
  'Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Visakhapatnam', 'Vijayawada', 'Warangal', 'Guntur', 'Nellore', 'Tirupati', 'Karimnagar', 'Nizamabad', 'Other',
];

const EMPTY_STUDENT_INTAKE: StudentIntake = {
  studentName: '',
  currentStage: '',
  stateOrCity: '',
  collegeRecommendationScope: 'state-first',
  comparisonFocus: '',
  currentSituation: '',
  interests: '',
  confusion: '',
  stressors: '',
  familyPressure: '',
  targetRole: '',
};

type IntakeJourneyBucket = 'pre-11' | 'intermediate' | 'early-college' | 'final-year' | 'graduated' | 'other';

interface ComparisonConfig {
  label: string;
  helper: string;
  focusOptions: string[];
  defaultScope: 'state-first' | 'india-wide';
  scopeHelper: string;
}

const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  label: 'Guidance scope',
  helper: 'Choose how wide the recommendation comparison should be for your current situation.',
  focusOptions: ['Best next step based on my current situation'],
  defaultScope: 'state-first',
  scopeHelper: 'State-first starts local; India-wide compares options nationally.',
};

function getJourneyBucket(stage: string): IntakeJourneyBucket {
  const normalized = stage.trim().toLowerCase();
  if (!normalized) return 'other';
  if (normalized === 'class 10') return 'pre-11';
  if (normalized.includes('intermediate')) return 'intermediate';
  if (normalized.includes('diploma') || normalized.includes('degree 1st') || normalized.includes('degree 2nd') || normalized.includes('btech 1st') || normalized.includes('btech 2nd')) {
    return 'early-college';
  }
  if (normalized.includes('final year') || normalized.includes('placement')) return 'final-year';
  if (normalized.includes('graduated')) return 'graduated';
  return 'other';
}

function getComparisonConfig(stage: string): ComparisonConfig {
  const bucket = getJourneyBucket(stage);
  switch (bucket) {
    case 'pre-11':
      return {
        label: 'School + stream comparison focus',
        helper: 'Class 10 students should compare stream choices and 11th/12th pathways, not college rankings.',
        focusOptions: [
          'Stream comparison (MPC vs BiPC vs Commerce vs Arts)',
          'Intermediate schools/junior colleges in my city',
          'Entrance pathways after each stream',
        ],
        defaultScope: 'state-first',
        scopeHelper: 'State-first is usually better for Class 10 because 11th/12th options are local first.',
      };
    case 'intermediate':
      return {
        label: 'After-12th comparison focus',
        helper: 'Intermediate students should compare degree routes, branch choices, and realistic college outcomes.',
        focusOptions: [
          'Course comparison after 12th (BTech vs Degree vs other)',
          'College comparison by placement quality',
          'Branch comparison (CSE vs ECE vs Mechanical etc.)',
        ],
        defaultScope: 'india-wide',
        scopeHelper: 'India-wide helps compare stronger colleges and branches across states.',
      };
    case 'early-college':
      return {
        label: 'In-college comparison focus',
        helper: 'Early college students usually need branch-switch, transfer, and skill-path comparisons.',
        focusOptions: [
          'Continue vs switch branch/course',
          'On-campus vs off-campus skill roadmap',
          'Higher studies vs job-first plan',
        ],
        defaultScope: 'state-first',
        scopeHelper: 'State-first can start practical options quickly; expand to India-wide when needed.',
      };
    case 'final-year':
      return {
        label: 'Placement-stage comparison focus',
        helper: 'Final-year students should compare job offers, off-campus routes, and higher-study options.',
        focusOptions: [
          'Job offers vs higher studies (MTech/MBA/MS)',
          'Service company vs product company path',
          'Placement prep vs exam prep balance',
        ],
        defaultScope: 'india-wide',
        scopeHelper: 'India-wide helps compare hiring trends, role opportunities, and PG options nationally.',
      };
    case 'graduated':
      return {
        label: 'Post-graduation comparison focus',
        helper: 'Graduates should compare reskilling, job-track, and higher-study outcomes based on employability.',
        focusOptions: [
          'Job search vs reskilling bootcamp',
          'MTech/MBA/PG route vs work route',
          'Role pivot options with strongest placement probability',
        ],
        defaultScope: 'india-wide',
        scopeHelper: 'India-wide helps find the strongest role and hiring markets beyond local limitations.',
      };
    default:
      return DEFAULT_COMPARISON_CONFIG;
  }
}

export default function ChatStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [studentIntake, setStudentIntake] = useState<StudentIntake>(EMPTY_STUDENT_INTAKE);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [otherProblem, setOtherProblem] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedCounselingLanguage>('en-IN');
  const [conversationStyle, setConversationStyle] = useState<SupportedConversationStyle>('auto');
  const [scriptPreference, setScriptPreference] = useState<SupportedScriptPreference>('auto');
  const [selectedRole, setSelectedRole] = useState('');
  const journeyBucket = getJourneyBucket(studentIntake.currentStage);
  const availableProblems = useMemo(() => PROBLEMS_BY_BUCKET[journeyBucket] ?? COMMON_STUDENT_PROBLEMS, [journeyBucket]);
  const comparisonConfig = getComparisonConfig(studentIntake.currentStage);
  const requiresComparison = shouldCollectComparison(selectedProblem, otherProblem.trim());
  const hasStage = Boolean(studentIntake.currentStage.trim());
  const hasProblem = Boolean(selectedProblem && (selectedProblem !== 'Other' || otherProblem.trim()));
  const hasIdentity = Boolean(
    studentIntake.studentName.trim() &&
    selectedCity &&
    (selectedCity !== 'Other' || otherCity.trim())
  );
  const showStep2 = hasStage && hasProblem;
  const showStep3 = showStep2 && hasIdentity;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const intakeRaw = window.localStorage.getItem(LOCAL_STUDENT_INTAKE_KEY);
    if (intakeRaw) {
      try {
        const parsed = JSON.parse(intakeRaw) as { intake?: Partial<StudentIntake> };
        const intake = parsed.intake;
        if (intake) {
          const normalized = { ...EMPTY_STUDENT_INTAKE, ...intake };
          setStudentIntake(normalized);
          setSelectedRole(normalized.targetRole || '');

          if (normalized.currentSituation) {
            const matchedProblem = COMMON_STUDENT_PROBLEMS.find((item) => item === normalized.currentSituation);
            if (matchedProblem) {
              setSelectedProblem(matchedProblem);
            } else {
              setSelectedProblem('Other');
              setOtherProblem(normalized.currentSituation);
            }
          }

          if (normalized.stateOrCity) {
            const matchedCity = MAJOR_CITIES.find((item) => item === normalized.stateOrCity);
            if (matchedCity) {
              setSelectedCity(matchedCity);
            } else {
              setSelectedCity('Other');
              setOtherCity(normalized.stateOrCity);
            }
          }
        }
      } catch {
        // Ignore malformed intake and start fresh.
      }
    }

    const preferencesRaw = window.localStorage.getItem(LOCAL_CHAT_PREFERENCES_KEY);
    if (!preferencesRaw) return;

    try {
      const parsed = JSON.parse(preferencesRaw) as {
        preferredLanguage?: SupportedCounselingLanguage;
        conversationStyle?: SupportedConversationStyle;
        scriptPreference?: SupportedScriptPreference;
        selectedRole?: string;
      };

      const resolvedLanguage: SupportedCounselingLanguage =
        parsed.preferredLanguage && parsed.preferredLanguage !== 'auto'
          ? parsed.preferredLanguage
          : 'en-IN';

      if (parsed.preferredLanguage) {
        setPreferredLanguage(resolvedLanguage);
      }

      if (parsed.conversationStyle) {
        setConversationStyle(getResolvedConversationStyleForLanguage(resolvedLanguage, parsed.conversationStyle));
      } else {
        setConversationStyle(getResolvedConversationStyleForLanguage(resolvedLanguage, 'auto'));
      }

      if (parsed.scriptPreference) {
        setScriptPreference(parsed.scriptPreference);
      }

      if (parsed.selectedRole?.trim()) {
        setSelectedRole(parsed.selectedRole.trim());
      }
    } catch {
      // Ignore malformed preferences and keep defaults.
    }
  }, []);

  useEffect(() => {
    const nextScope = comparisonConfig.defaultScope;
    const nextFocus = comparisonConfig.focusOptions[0] ?? '';

    setStudentIntake((currentValue) => {
      if (!requiresComparison) {
        if (!currentValue.comparisonFocus) return currentValue;
        return {
          ...currentValue,
          comparisonFocus: '',
        };
      }

      const shouldUpdateScope = currentValue.collegeRecommendationScope !== nextScope;
      const shouldUpdateFocus = !currentValue.comparisonFocus || !comparisonConfig.focusOptions.includes(currentValue.comparisonFocus);
      if (!shouldUpdateScope && !shouldUpdateFocus) {
        return currentValue;
      }
      return {
        ...currentValue,
        collegeRecommendationScope: shouldUpdateScope ? nextScope : currentValue.collegeRecommendationScope,
        comparisonFocus: shouldUpdateFocus ? nextFocus : currentValue.comparisonFocus,
      };
    });
  }, [comparisonConfig.defaultScope, comparisonConfig.focusOptions, requiresComparison]);

  useEffect(() => {
    if (!selectedProblem) return;
    if (availableProblems.includes(selectedProblem)) return;
    setSelectedProblem('');
    setOtherProblem('');
  }, [availableProblems, selectedProblem]);

  const canSubmitIntake = Boolean(hasStage && hasProblem && hasIdentity);

  const submitStructuredIntake = () => {
    if (!canSubmitIntake || loading || typeof window === 'undefined') return;

    setLoading(true);

    const normalizedRole = selectedRole.trim() || studentIntake.targetRole.trim();
    const normalizedConversationStyle: SupportedConversationStyle =
      getResolvedConversationStyleForLanguage(preferredLanguage, conversationStyle);
    const normalizedIntake: StudentIntake = {
      ...studentIntake,
      targetRole: normalizedRole,
      currentSituation: selectedProblem === 'Other' ? otherProblem.trim() : selectedProblem,
      stateOrCity: selectedCity === 'Other' ? otherCity.trim() : selectedCity,
      comparisonFocus: requiresComparison ? studentIntake.comparisonFocus : '',
    };

    window.localStorage.setItem(
      LOCAL_STUDENT_INTAKE_KEY,
      JSON.stringify({ intake: normalizedIntake, submitted: true })
    );

    window.localStorage.setItem(
      LOCAL_CHAT_PREFERENCES_KEY,
      JSON.stringify({
        preferredLanguage,
        conversationStyle: normalizedConversationStyle,
        scriptPreference,
        selectedRole: normalizedRole,
      })
    );
    window.dispatchEvent(new CustomEvent(CHAT_PREFERENCES_UPDATED_EVENT));

    router.push('/chat');
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/15 px-3 py-1">Step 1: Stage + main problem</span>
          <span className={showStep2 ? 'rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-emerald-100' : 'rounded-full border border-white/15 px-3 py-1 text-white/45'}>
            Step 2: Basic context
          </span>
          <span className={showStep3 ? 'rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-emerald-100' : 'rounded-full border border-white/15 px-3 py-1 text-white/45'}>
            Step 3: Guidance details
          </span>
          <button
            type="button"
            onClick={() => setShowPreferences((currentValue) => !currentValue)}
            className="ml-auto rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10"
          >
            {showPreferences ? 'Hide advanced settings' : 'Show advanced settings'}
          </button>
        </div>

        {showPreferences && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs text-white/60">
              Preferred language
              <select
                value={preferredLanguage}
                onChange={(e) => {
                  const language = e.target.value as SupportedCounselingLanguage;
                  setPreferredLanguage(language);
                  if (scriptPreference === 'auto') {
                    setScriptPreference(getDefaultScriptPreference(language));
                  }
                  setConversationStyle(getResolvedConversationStyleForLanguage(language, conversationStyle));
                }}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {SUPPORTED_COUNSELING_LANGUAGES.filter((language) => language.code !== 'auto').map((language) => (
                  <option key={language.code} value={language.code} className="text-black">
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-white/60">
              Writing style
              <select
                value={scriptPreference}
                onChange={(e) => setScriptPreference(e.target.value as SupportedScriptPreference)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {SCRIPT_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code} className="text-black">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-white/60">
              Conversation style
              <select
                value={conversationStyle}
                onChange={(e) => setConversationStyle(e.target.value as SupportedConversationStyle)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {CONVERSATION_STYLE_OPTIONS.map((style) => (
                  <option key={style.code} value={style.code} className="text-black">
                    {style.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-white/60">
              Dream role (optional)
              <input
                value={selectedRole}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setSelectedRole(nextValue);
                  setStudentIntake((currentValue) => ({ ...currentValue, targetRole: nextValue }));
                }}
                placeholder="Doctor, IAS, Product Designer..."
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="text-xs text-white/60">
            Current stage
            <select
              value={studentIntake.currentStage}
              onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, currentStage: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            >
              <option value="" className="text-black">Select your stage</option>
              {INTAKE_STAGE_OPTIONS.map((option) => (
                <option key={option} value={option} className="text-black">
                  {option}
                </option>
              ))}
            </select>
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-xs text-white/60">
            Main problem
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              disabled={!hasStage}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" className="text-black">{hasStage ? 'Select your main problem' : 'Select stage first'}</option>
              {availableProblems.map((problem) => (
                <option key={problem} value={problem} className="text-black">{problem}</option>
              ))}
            </select>
            {selectedProblem === 'Other' && (
              <input
                value={otherProblem}
                onChange={(e) => setOtherProblem(e.target.value)}
                placeholder="Describe your situation"
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              />
            )}
          </motion.label>

          {showStep2 && (
            <>
              <label className="text-xs text-white/60">
                Student name
                <input
                  value={studentIntake.studentName}
                  onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, studentName: e.target.value }))}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                />
              </label>

              <label className="text-xs text-white/60 md:col-span-2">
                State or city
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                >
                  <option value="" className="text-black">Select city</option>
                  {MAJOR_CITIES.map((city) => (
                    <option key={city} value={city} className="text-black">{city}</option>
                  ))}
                </select>
                {selectedCity === 'Other' && (
                  <input
                    value={otherCity}
                    onChange={(e) => setOtherCity(e.target.value)}
                    placeholder="Type your city or town"
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                  />
                )}
              </label>
            </>
          )}

          {showStep3 && requiresComparison && (
            <label className="text-xs text-white/60 md:col-span-2">
              <span>{comparisonConfig.label}</span>
              <p className="mt-1 text-[11px] text-white/45">{comparisonConfig.helper}</p>
              <select
                value={studentIntake.comparisonFocus}
                onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, comparisonFocus: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {comparisonConfig.focusOptions.map((option) => (
                  <option key={option} value={option} className="text-black">{option}</option>
                ))}
              </select>

              <p className="mt-2 text-[11px] text-white/45">Recommendation coverage</p>
              <select
                value={studentIntake.collegeRecommendationScope}
                onChange={(e) => setStudentIntake((currentValue) => ({
                  ...currentValue,
                  collegeRecommendationScope: e.target.value as 'state-first' | 'india-wide',
                }))}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                <option value="state-first" className="text-black">My state/region first</option>
                <option value="india-wide" className="text-black">All India comparison</option>
              </select>
              <p className="mt-2 text-[11px] text-white/45">{comparisonConfig.scopeHelper}</p>
            </label>
          )}

          {showStep3 && (
            <>
              <label className="text-xs text-white/60 md:col-span-2">
                Main confusion right now (optional)
                <textarea
                  value={studentIntake.confusion}
                  onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, confusion: e.target.value }))}
                  rows={2}
                  placeholder="What exactly are you confused about right now?"
                  className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                />
              </label>

              <label className="text-xs text-white/60">
                Interests and strengths (optional)
                <textarea
                  value={studentIntake.interests}
                  onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, interests: e.target.value }))}
                  rows={2}
                  placeholder="Subjects, hobbies, activities, or work styles"
                  className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                />
              </label>

              <label className="text-xs text-white/60">
                Family pressure or expectations (optional)
                <textarea
                  value={studentIntake.familyPressure}
                  onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, familyPressure: e.target.value }))}
                  rows={2}
                  placeholder="What are people at home expecting from you?"
                  className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                />
              </label>

              <label className="text-xs text-white/60">
                Biggest stressors or fears (optional)
                <textarea
                  value={studentIntake.stressors}
                  onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, stressors: e.target.value }))}
                  rows={2}
                  placeholder="Ex: Fear of failing exams, low pay, math weakness..."
                  className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                />
              </label>
            </>
          )}
        </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25 }}
        className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10"
      >
        <Link href="/chat" className="px-6 py-3 rounded-xl border border-white/20 text-white text-center hover:border-white/40 hover:bg-white/5 transition-all font-medium">
          Skip for now
        </Link>
        <Button 
          onClick={submitStructuredIntake} 
          disabled={!canSubmitIntake || loading}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 flex items-center justify-center gap-2 font-semibold"
        >
          Start Counseling <ArrowRight size={18} />
        </Button>
      </motion.div>
      </div>
    </div>
  );
}
