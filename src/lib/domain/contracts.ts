export type ProductVersion = 'web' | 'pwa' | 'mobile-native';

export type MVPFeatureKey =
  | 'auth'
  | 'dashboard'
  | 'chat_guidance'
  | 'games'
  | 'results'
  | 'parent_view'
  | 'school_view';

export type MobilePriority = 'must' | 'should' | 'later';

export type SchoolInviteRequest = {
  emails?: string[];
  csvContent?: string;
};

export type SchoolInviteFailureReason =
  | 'invalid_email'
  | 'already_invited'
  | 'already_enrolled'
  | 'insert_failed';

export type SchoolInviteFailure = {
  email: string;
  reason: SchoolInviteFailureReason;
};

export type SchoolInviteResponse = {
  invited: number;
  failed: number;
  failures: SchoolInviteFailure[];
};

export type DashboardSummaryResponse = {
  greetingName: string;
  currentStreak: number;
  xpPoints: number;
  clarityScore: number;
};

export type PaymentBoundaryMode = 'enabled' | 'deferred';

export type CreateOrderErrorResponse = {
  error: string;
  mode?: PaymentBoundaryMode;
};
