'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface ModuleProgress {
  moduleNumber: number;
  title: string;
  conceptClarityScore?: number;
  understandingCheckRating?: 'strong' | 'good' | 'fair' | 'needs-work';
}

interface ModuleRecapCardProps {
  roleTitle: string;
  justCompletedModule: ModuleProgress;
  nextModule?: {
    moduleNumber: number;
    title: string;
  };
  totalModules?: number;
  className?: string;
}

const RATING_COLORS: Record<string, string> = {
  strong: 'bg-green-50 border-green-200',
  good: 'bg-blue-50 border-blue-200',
  fair: 'bg-yellow-50 border-yellow-200',
  'needs-work': 'bg-orange-50 border-orange-200',
};

const RATING_LABELS: Record<string, { label: string; icon: string }> = {
  strong: { label: 'Strong Understanding', icon: '✨' },
  good: { label: 'Good Progress', icon: '👍' },
  fair: { label: 'Fair Grasp', icon: '📖' },
  'needs-work': { label: 'Needs More Work', icon: '🔄' },
};

/**
 * ModuleRecapCard Component
 * Displays after each role-mastery module is completed.
 * Shows what was learned, understanding check result, next module preview.
 * Keeps student motivated by visualizing 10-module journey progress.
 */
export function ModuleRecapCard({
  roleTitle,
  justCompletedModule,
  nextModule,
  totalModules = 10,
  className,
}: ModuleRecapCardProps) {
  const rating = justCompletedModule.understandingCheckRating || 'good';
  const clarityScore = justCompletedModule.conceptClarityScore ?? 75;
  const ratingInfo = RATING_LABELS[rating] || RATING_LABELS.good;
  const bgColor = RATING_COLORS[rating] || RATING_COLORS.good;
  
  const progressPercent = Math.round(
    ((justCompletedModule.moduleNumber) / totalModules) * 100
  );

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 shadow-sm',
        bgColor,
        className
      )}
    >
      {/* Header: Role + Progress */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">
            {roleTitle}
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">
            Module {justCompletedModule.moduleNumber} ✅
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {justCompletedModule.moduleNumber}/{totalModules}
          </p>
          <p className="text-xs text-gray-600">modules done</p>
        </div>
      </div>

      {/* Module Title */}
      <div className="mb-4 border-t-2 border-current border-opacity-10 pt-3">
        <p className="text-sm font-semibold text-gray-800">
          {justCompletedModule.title}
        </p>
      </div>

      {/* Understanding Check Result */}
      <div className="mb-4 rounded bg-white bg-opacity-60 p-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ratingInfo.icon}</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700">
              Understanding Check
            </p>
            <p className="text-sm font-bold text-gray-900">
              {ratingInfo.label}
            </p>
          </div>
          {clarityScore && (
            <div className="text-right">
              <p className="text-xs text-gray-600">Clarity</p>
              <p className="text-lg font-bold text-gray-900">{clarityScore}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <p className="text-xs font-semibold text-gray-700">Journey Progress</p>
          <p className="text-xs font-semibold text-gray-700">{progressPercent}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-300 bg-opacity-50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Next Module Preview (if available) */}
      {nextModule && (
        <div className="mt-4 rounded bg-white bg-opacity-40 p-3">
          <p className="text-xs font-semibold text-gray-700">Next Module</p>
          <p className="mt-1 text-sm font-bold text-gray-900">
            Module {nextModule.moduleNumber}: {nextModule.title}
          </p>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="mt-4 border-t-2 border-current border-opacity-10 pt-3">
        <p className="text-xs text-gray-700 italic">
          {justCompletedModule.moduleNumber < 3
            ? '🚀 Great start! Building your role foundation...'
            : justCompletedModule.moduleNumber < 7
              ? '💪 Halfway to mastery! You are crushing it...'
              : '🎯 Near the finish line! One more push...'}
        </p>
      </div>
    </div>
  );
}

/**
 * Lightweight version for inline display within chat
 */
export function ModuleRecapCardCompact({
  roleTitle,
  moduleNumber,
  moduleTitle,
  understanding,
}: {
  roleTitle: string;
  moduleNumber: number;
  moduleTitle: string;
  understanding: 'strong' | 'good' | 'fair' | 'needs-work';
}) {
  const ratingInfo = RATING_LABELS[understanding];
  return (
    <div className="my-3 rounded border-l-4 border-blue-500 bg-blue-50 p-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{ratingInfo.icon}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600">{roleTitle}</p>
          <p className="font-bold text-gray-900">
            Module {moduleNumber}: {moduleTitle} ✓
          </p>
          <p className="mt-1 text-sm text-gray-700">{ratingInfo.label}</p>
        </div>
      </div>
    </div>
  );
}
