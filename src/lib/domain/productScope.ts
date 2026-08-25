import type { MobilePriority, MVPFeatureKey, ProductVersion } from './contracts';

export const PRODUCT_VERSIONS: Record<ProductVersion, { label: string; status: 'current' | 'short_term' | 'primary' }> = {
  web: { label: 'Web App (Next.js)', status: 'current' },
  pwa: { label: 'Mobile Web / PWA', status: 'short_term' },
  'mobile-native': { label: 'Native Mobile App', status: 'primary' },
};

export const MOBILE_MVP_PRIORITY: Record<MVPFeatureKey, MobilePriority> = {
  auth: 'must',
  dashboard: 'must',
  chat_guidance: 'must',
  games: 'must',
  results: 'must',
  parent_view: 'should',
  school_view: 'later',
};

export const MOBILE_CAPABILITY_MATRIX = {
  pushNotifications: { pwa: 'partial', native: 'full' },
  offlineSessionPersistence: { pwa: 'partial', native: 'full' },
  cameraAndFileUpload: { pwa: 'partial', native: 'full' },
  deepLinking: { pwa: 'partial', native: 'full' },
  payments: { pwa: 'web-checkout', native: 'in-app-or-web-checkout' },
} as const;

export const MOBILE_EXECUTION_PHASES = [
  'Phase A: Auth + onboarding + dashboard shell',
  'Phase B: Chat guidance + core results',
  'Phase C: High-impact games with mobile interaction patterns',
  'Phase D: Parent and school modules',
  'Phase E: Notifications, polish, and store-readiness',
] as const;
