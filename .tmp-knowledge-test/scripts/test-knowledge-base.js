"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knowledgeBase_1 = require("../src/lib/career-agent/knowledgeBase");
const tests = [
    {
        name: 'Selected role Software Engineer should rank on top',
        run: () => {
            const ranked = (0, knowledgeBase_1.getRankedKnowledgeRoles)({
                selectedRole: 'Software Engineer',
                latestMessage: 'I like coding and want software role',
                counselingTrack: 'career-counseling',
                maxResults: 3,
            });
            return ranked.length > 0 && ranked[0].title.toLowerCase().includes('software');
        },
    },
    {
        name: 'Post-college employability should return at least one role',
        run: () => {
            const ranked = (0, knowledgeBase_1.getRankedKnowledgeRoles)({
                latestMessage: 'I graduated and I need a job quickly',
                detectedStage: 'postCollege',
                counselingTrack: 'post-college-employability',
                maxResults: 3,
            });
            return ranked.length >= 1;
        },
    },
    {
        name: 'Knowledge base prompt block should include retrieval header',
        run: () => {
            const block = (0, knowledgeBase_1.buildKnowledgeBasePromptBlock)({
                selectedRole: 'Data Scientist',
                latestMessage: 'I enjoy data and machine learning',
                counselingTrack: 'career-counseling',
                maxResults: 3,
            });
            return block.includes('KNOWLEDGE BASE RETRIEVAL');
        },
    },
    {
        name: 'School exam support should still return ranked roles',
        run: () => {
            const ranked = (0, knowledgeBase_1.getRankedKnowledgeRoles)({
                latestMessage: 'I am in class 12 preparing for JEE and confused between CS and ECE',
                detectedStage: 'post12th',
                counselingTrack: 'school-exam-support',
                maxResults: 3,
            });
            return ranked.length > 0;
        },
    },
];
let passed = 0;
for (const test of tests) {
    const ok = test.run();
    if (ok) {
        console.log(`PASS | ${test.name}`);
        passed += 1;
    }
    else {
        console.log(`FAIL | ${test.name}`);
    }
}
if (passed === tests.length) {
    console.log(`Knowledge base tests passed (${passed}/${tests.length}).`);
    process.exit(0);
}
console.log(`Knowledge base tests failed (${passed}/${tests.length}).`);
process.exit(1);
