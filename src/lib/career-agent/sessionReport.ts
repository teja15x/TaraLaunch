/**
 * Session Report Card System
 * Tracks and scores student progress during each counseling session:
 * - Clarity Score (0-100): How well student understands their path
 * - Confidence Score (0-100): How confident student feels about their direction
 * - Actions Committed (list): Specific next steps student committed to
 * - Module Progress (N/10): How many role-mastery modules covered
 *
 * Used at end of session to show tangible progress and retention value.
 */

export interface SessionReportCard {
  sessionId: string;
  studentName?: string;
  startTime: Date;
  endTime?: Date;
  
  // Scores (0-100)
  clarityScore: number;
  clarityTrend: 'improved' | 'stable' | 'declined';
  clarityStartScore?: number;
  
  confidenceScore: number;
  confidenceTrend: 'improving' | 'stable' | 'declined';
  confidenceStartScore?: number;
  
  // Actions
  actionsIdentified: ActionCommitment[];
  
  // Role mastery
  modulesCovered: ModuleProgress[];
  rolesExplored: string[];
  
  // Overall health
  sessionQuality: 'high-impact' | 'exploratory' | 'supportive';
  nextSessionFocus?: string;
}

export interface ActionCommitment {
  action: string;
  timeline: '1-week' | '2-week' | '1-month' | '3-month';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'skill-building' | 'role-exploration' | 'stress-management' | 'family-negotiation' | 'exam-prep' | 'other';
}

export interface ModuleProgress {
  roleId: string;
  roleTitle: string;
  modulesCompleted: ModuleInfo[];
  currentModule?: ModuleInfo;
  nextModule?: ModuleInfo;
}

export interface ModuleInfo {
  moduleNumber: number; // 1-10
  title: string;
  conceptClarityScore?: number; // 0-100
  understandingCheckRating?: 'strong' | 'good' | 'fair' | 'needs-work';
}

/**
 * Initialize a new session report card
 */
export function initializeSessionReport(
  sessionId: string,
  studentName?: string
): SessionReportCard {
  return {
    sessionId,
    studentName,
    startTime: new Date(),
    clarityScore: 30,
    clarityTrend: 'stable',
    clarityStartScore: 30,
    confidenceScore: 40,
    confidenceTrend: 'stable',
    confidenceStartScore: 40,
    actionsIdentified: [],
    modulesCovered: [],
    rolesExplored: [],
    sessionQuality: 'exploratory',
  };
}

/**
 * Update clarity score during session
 * Called when student demonstrates understanding of a concept
 */
export function updateClarityScore(
  report: SessionReportCard,
  newScore: number
): void {
  const sanitized = Math.max(0, Math.min(100, newScore));
  const old = report.clarityScore;
  report.clarityScore = sanitized;
  
  if (sanitized > old + 5) {
    report.clarityTrend = 'improved';
  } else if (sanitized < old - 5) {
    report.clarityTrend = 'declined';
  } else {
    report.clarityTrend = 'stable';
  }
}

/**
 * Update confidence score during session
 * Called when student shows emotional safety, belief, or commitment
 */
export function updateConfidenceScore(
  report: SessionReportCard,
  newScore: number
): void {
  const sanitized = Math.max(0, Math.min(100, newScore));
  const old = report.confidenceScore;
  report.confidenceScore = sanitized;
  
  if (sanitized > old + 5) {
    report.confidenceTrend = 'improving';
  } else if (sanitized < old - 5) {
    report.confidenceTrend = 'declined';
  } else {
    report.confidenceTrend = 'stable';
  }
}

/**
 * Add an action commitment to the session
 * Called when student agrees to a next step
 */
export function addActionCommitment(
  report: SessionReportCard,
  action: ActionCommitment
): void {
  report.actionsIdentified.push(action);
}

/**
 * Record a completed module for a role
 */
export function logModuleCompletion(
  report: SessionReportCard,
  roleId: string,
  roleTitle: string,
  module: ModuleInfo
): void {
  let roleProgress = report.modulesCovered.find((m) => m.roleId === roleId);
  
  if (!roleProgress) {
    roleProgress = {
      roleId,
      roleTitle,
      modulesCompleted: [],
    };
    report.modulesCovered.push(roleProgress);
  }
  
  if (!report.rolesExplored.includes(roleTitle)) {
    report.rolesExplored.push(roleTitle);
  }
  
  roleProgress.modulesCompleted.push(module);
}

/**
 * Calculate session quality based on outcomes
 */
export function calculateSessionQuality(
  report: SessionReportCard
): 'high-impact' | 'exploratory' | 'supportive' {
  const clarityImprovement = (report.clarityScore ?? 30) - (report.clarityStartScore ?? 30);
  const confidenceImprovement = (report.confidenceScore ?? 40) - (report.confidenceStartScore ?? 40);
  const actionsCount = report.actionsIdentified.length;
  const modulesCount = report.modulesCovered.reduce((sum, m) => sum + m.modulesCompleted.length, 0);

  // High-impact: significant clarity/confidence gains + concrete actions + module progress
  if (
    clarityImprovement > 15 &&
    confidenceImprovement > 10 &&
    actionsCount >= 2 &&
    modulesCount >= 2
  ) {
    return 'high-impact';
  }

  // Supportive: emotional validation but less role clarity
  if (confidenceImprovement > 10 && clarityImprovement <= 10 && actionsCount >= 1) {
    return 'supportive';
  }

  // Exploratory: gathering information, building curiosity
  return 'exploratory';
}

/**
 * Generate report card summary for display to student
 */
export function generateReportCardSummary(report: SessionReportCard): string {
  const endTime = report.endTime ?? new Date();
  const durationMin = Math.round(
    (endTime.getTime() - report.startTime.getTime()) / 60000
  );

  const lines = [
    `## 📊 Session Report Card`,
    '',
    `**Session Duration:** ${durationMin} minutes`,
    '',
    `### Your Progress`,
    `- **Clarity Score:** ${report.clarityScore}/100 (${report.clarityTrend})`,
    `- **Confidence Score:** ${report.confidenceScore}/100 (${report.confidenceTrend})`,
    `- **Session Type:** ${report.sessionQuality.replace(/-/g, ' ')}`,
    '',
  ];

  if (report.rolesExplored.length > 0) {
    lines.push(`### Roles Explored`);
    report.rolesExplored.forEach((role) => {
      const roleProgress = report.modulesCovered.find((m) => m.roleTitle === role);
      const completed = roleProgress?.modulesCompleted.length ?? 0;
      lines.push(`- **${role}**: ${completed}/10 modules covered`);
    });
    lines.push('');
  }

  if (report.actionsIdentified.length > 0) {
    lines.push(`### Your 30-Day Action Plan`);
    report.actionsIdentified.forEach((action, idx) => {
      lines.push(
        `${idx + 1}. **${action.action}** (${action.timeline}, ${action.priority})`
      );
    });
    lines.push('');
  }

  lines.push(
    `### Next Steps`,
    report.nextSessionFocus
      ? `Focus your next session on: ${report.nextSessionFocus}`
      : 'Review your action plan daily. Track completions.Come back when you need clarity, face setbacks, or want to deepen your role understanding.',
    '',
    `---`,
    `*This report is private to you. Use it to track your career journey.*`
  );

  return lines.join('\n');
}
