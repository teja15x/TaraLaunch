"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const knowledgeSchema_1 = require("../src/lib/career-agent/knowledgeSchema");
const filePath = (0, node_path_1.join)(process.cwd(), 'src', 'data', 'knowledge', 'roles.seed.json');
const raw = (0, node_fs_1.readFileSync)(filePath, 'utf-8');
const parsed = JSON.parse(raw);
const validation = knowledgeSchema_1.roleSeedCollectionSchema.safeParse(parsed);
if (!validation.success) {
    console.error('FAIL | schema validation failed');
    for (const issue of validation.error.issues) {
        console.error(`- ${issue.path.join('.')} :: ${issue.message}`);
    }
    process.exit(1);
}
const collection = validation.data;
const items = collection.items;
const uniqueIds = new Set(items.map((i) => i.id));
const uniqueTitles = new Set(items.map((i) => i.title.toLowerCase()));
const stageCoverage = {
    'pre-12th': 0,
    'post-12th': 0,
    'in-college': 0,
    'post-college': 0,
};
const familyCounts = new Map();
for (const item of items) {
    for (const stage of item.stageFit) {
        stageCoverage[stage] += 1;
    }
    familyCounts.set(item.roleFamily, (familyCounts.get(item.roleFamily) ?? 0) + 1);
}
const checks = [
    {
        name: 'entries >= minTarget',
        pass: items.length >= collection.minTarget,
        details: `${items.length} vs target ${collection.minTarget}`,
    },
    {
        name: 'unique ids',
        pass: uniqueIds.size === items.length,
        details: `${uniqueIds.size}/${items.length}`,
    },
    {
        name: 'title uniqueness > 95%',
        pass: uniqueTitles.size / items.length >= 0.95,
        details: `${uniqueTitles.size}/${items.length}`,
    },
    {
        name: 'all four stages covered',
        pass: Object.values(stageCoverage).every((count) => count > 0),
        details: JSON.stringify(stageCoverage),
    },
    {
        name: 'family diversity >= 10',
        pass: familyCounts.size >= 10,
        details: `${familyCounts.size} families`,
    },
];
let passed = 0;
for (const check of checks) {
    if (check.pass) {
        console.log(`PASS | ${check.name} | ${check.details}`);
        passed += 1;
    }
    else {
        console.log(`FAIL | ${check.name} | ${check.details}`);
    }
}
if (passed !== checks.length) {
    console.log(`Knowledge seed pipeline test FAILED (${passed}/${checks.length})`);
    process.exit(1);
}
console.log(`Knowledge seed pipeline test PASSED (${passed}/${checks.length})`);
