"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSeedCollectionSchema = exports.roleSeedSchema = exports.roleFamilySchema = void 0;
const zod_1 = require("zod");
exports.roleFamilySchema = zod_1.z.enum([
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
exports.roleSeedSchema = zod_1.z.object({
    id: zod_1.z.string().min(2),
    title: zod_1.z.string().min(2),
    roleFamily: exports.roleFamilySchema,
    pathHint: zod_1.z.string().min(8),
    tags: zod_1.z.array(zod_1.z.string().min(2)).min(2),
    source: zod_1.z.enum(['career-role-options', 'manual-curation', 'hybrid']),
    confidence: zod_1.z.number().min(0).max(1),
    stageFit: zod_1.z.array(zod_1.z.enum(['pre-12th', 'post-12th', 'in-college', 'post-college'])).min(1),
});
exports.roleSeedCollectionSchema = zod_1.z.object({
    version: zod_1.z.string(),
    generatedAt: zod_1.z.string(),
    minTarget: zod_1.z.number().int().positive(),
    items: zod_1.z.array(exports.roleSeedSchema).min(1),
});
