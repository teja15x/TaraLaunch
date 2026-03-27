'use client';

import { useEffect, useState } from 'react';
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

const MAJOR_CITIES = [
  'Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Visakhapatnam', 'Vijayawada', 'Warangal', 'Guntur', 'Nellore', 'Tirupati', 'Karimnagar', 'Nizamabad', 'Other',
];

const EMPTY_STUDENT_INTAKE: StudentIntake = {
  studentName: '',
  currentStage: '',
  stateOrCity: '',
  collegeRecommendationScope: 'state-first',
  currentSituation: '',
  interests: '',
  confusion: '',
  stressors: '',
  familyPressure: '',
  targetRole: '',
};

export default function ChatStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [studentIntake, setStudentIntake] = useState<StudentIntake>(EMPTY_STUDENT_INTAKE);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [otherProblem, setOtherProblem] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedCounselingLanguage>('en-IN');
  const [conversationStyle, setConversationStyle] = useState<SupportedConversationStyle>('auto');
  const [scriptPreference, setScriptPreference] = useState<SupportedScriptPreference>('auto');
  const [selectedRole, setSelectedRole] = useState('');

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

  const canSubmitIntake = Boolean(
    studentIntake.studentName.trim() &&
    studentIntake.currentStage.trim() &&
    selectedProblem &&
    (selectedProblem !== 'Other' || otherProblem.trim()) &&
    ((selectedCity && (selectedCity !== 'Other' || otherCity.trim())))
  );

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
        {/* Preferences Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <motion.label 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.65 }} 
            className="text-xs text-white/60"
          >
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
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-xs text-white/60">
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
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="text-xs text-white/60">
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
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-xs text-white/60">
            Dream role or target career
            <input
              value={selectedRole}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSelectedRole(nextValue);
                setStudentIntake((currentValue) => ({ ...currentValue, targetRole: nextValue }));
              }}
              placeholder="Doctor, IAS, Product Designer, Data Analyst..."
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            />
          </motion.label>
        </div>

        {/* Main Form Fields */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="text-xs text-white/60">
            <span>Student name</span>
            <input
              value={studentIntake.studentName}
              onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, studentName: e.target.value }))}
              placeholder="Your name"
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            />
          </motion.label>
          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="text-xs text-white/60">
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

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="text-xs text-white/60 md:col-span-2">
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
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="text-xs text-white/60 md:col-span-2">
            <span>College guidance scope</span>
            <select
              value={studentIntake.collegeRecommendationScope}
              onChange={(e) =>
                setStudentIntake((currentValue) => ({
                  ...currentValue,
                  collegeRecommendationScope: e.target.value as 'state-first' | 'india-wide',
                }))
              }
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            >
              <option value="state-first" className="text-black">My state/region first</option>
              <option value="india-wide" className="text-black">All India comparison</option>
            </select>
            <p className="mt-2 text-[11px] text-white/45">
              State-first uses your local context first; India-wide compares colleges across India with realistic placement context.
            </p>
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="text-xs text-white/60 md:col-span-2">
            What is your main problem or situation?
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            >
              <option value="" className="text-black">Select your main problem</option>
              {COMMON_STUDENT_PROBLEMS.map((problem) => (
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

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="text-xs text-white/60 md:col-span-2">
            <span>Main confusion right now</span>
            <textarea
              value={studentIntake.confusion}
              onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, confusion: e.target.value }))}
              rows={2}
              placeholder="What exactly are you confused about right now?"
              className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            />
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }} className="text-xs text-white/60">
            Interests and strengths
            <textarea
              value={studentIntake.interests}
              onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, interests: e.target.value }))}
              rows={2}
              placeholder="Subjects, hobbies, activities, or work styles"
              className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            />
          </motion.label>

          <motion.label initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-xs text-white/60">
            Family pressure or expectations
            <textarea
              value={studentIntake.familyPressure}
              onChange={(e) => setStudentIntake((currentValue) => ({ ...currentValue, familyPressure: e.target.value }))}
              rows={2}
              placeholder="What are people at home expecting from you?"
              className="mt-1 w-full resize-none rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            />
          </motion.label>
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
