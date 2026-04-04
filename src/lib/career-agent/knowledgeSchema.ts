import { z } from 'zod';

export const roleFamilySchema = z.enum([
  'technology',
  'finance',
  'healthcare',
  'law-governance',
  'design-creative',
  'business-management',
  'engineering-core',
  'education-research',
  'hospitality-services',
  'sports-performance',
  'media-communication',
  'aviation-maritime',
  'psychology-counseling',
  'public-sector',
  'exploration',
]);

export const roleSeedSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(2),
  roleFamily: roleFamilySchema,
  pathHint: z.string().min(8),
  tags: z.array(z.string().min(2)).min(2),
  source: z.enum(['career-role-options', 'manual-curation', 'hybrid']),
  confidence: z.number().min(0).max(1),
  stageFit: z.array(z.enum(['pre-12th', 'post-12th', 'in-college', 'post-college'])).min(1),
});

export const roleSeedCollectionSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  minTarget: z.number().int().positive(),
  items: z.array(roleSeedSchema).min(1),
});

export type RoleSeed = z.infer<typeof roleSeedSchema>;
export type RoleSeedCollection = z.infer<typeof roleSeedCollectionSchema>;
