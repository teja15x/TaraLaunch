import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return Math.max(0, age);
}

export type AgeTier = 'explorer' | 'discoverer' | 'navigator' | 'pivoter';

export function getAgeTier(dateOfBirth: Date | string): AgeTier {
  const age = calculateAge(dateOfBirth);
  if (age <= 12) return 'explorer';
  if (age <= 18) return 'discoverer';
  if (age <= 25) return 'navigator';
  return 'pivoter';
}
