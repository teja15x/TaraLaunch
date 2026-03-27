'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/helpers';
import {
  ROLE_DEPTH_TESTS,
  scoreDepthTest,
  generateDepthTestFeedback,
} from '@/lib/career-agent/roleKnowledgeDepth';

interface RoleDepthTestProps {
  roleId: string;
  roleName: string;
  onTestComplete?: (resultFeedback: string) => void;
  className?: string;
}

/**
 * RoleDepthTest Component
 * Administers 5-7 diagnostic questions to assess student's actual knowledge depth.
 * Displays one question at a time, scores their answers, and generates personalized feedback.
 */
export function RoleDepthTest({
  roleId,
  roleName,
  onTestComplete,
  className,
}: RoleDepthTestProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testComplete, setTestComplete] = useState(false);

  const questions = ROLE_DEPTH_TESTS[roleId];

  if (!questions || questions.length === 0) {
    return (
      <div className={cn("rounded-lg bg-yellow-50 p-4 border border-yellow-200", className)}>
        <p className="text-sm text-yellow-900">
          Knowledge depth test not yet available for {roleName}. Let us continue with regular module teaching.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const progress = Math.round(((currentQuestionIdx + 1) / questions.length) * 100);

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Test complete
      setTestComplete(true);
      const result = scoreDepthTest(roleId, newAnswers);
      const feedback = generateDepthTestFeedback(result, 60); // Assume 60% claimed confidence (neutral)

      if (onTestComplete) {
        onTestComplete(feedback);
      }
    }
  };

  if (testComplete) {
    return (
      <div className={cn("rounded-lg bg-green-50 border border-green-200 p-4", className)}>
        <p className="text-sm text-green-900">
          ✓ Test complete! Your personalized learning path is being generated...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 rounded-lg bg-blue-50 p-4 border border-blue-200", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">
            Knowledge Depth Check: {roleName}
          </h3>
          <span className="text-xs font-semibold text-gray-600">
            {currentQuestionIdx + 1} of {questions.length}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-gray-300 bg-opacity-30">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <p className="font-semibold text-gray-900 mb-3">{currentQuestion.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              className={cn(
                "w-full text-left rounded-lg border-2 p-3 transition-all text-sm font-medium",
                "hover:border-blue-400 hover:bg-white",
                "border-gray-200 bg-white text-gray-900"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                    "border-gray-400"
                  )}
                />
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="rounded bg-white bg-opacity-60 p-2">
        <p className="text-xs text-gray-600 italic">
          Pick the answer that you think is correct. This helps me understand which parts of the role you know well
          and where to focus.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact inline version of depth test question
 */
export function DepthTestQuestionInline({
  question,
  options,
  onAnswer,
}: {
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="my-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
      <p className="mb-3 font-semibold text-gray-900">{question}</p>
      <div className="space-y-2">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelected(idx);
              onAnswer(idx);
            }}
            className={cn(
              "w-full text-left rounded p-2 text-sm transition-all",
              selected === idx
                ? "bg-blue-500 text-white font-semibold"
                : "bg-white text-gray-900 hover:bg-blue-100"
            )}
          >
            {String.fromCharCode(65 + idx)}) {option}
          </button>
        ))}
      </div>
    </div>
  );
}
