"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stageDetection_1 = require("../src/lib/career-agent/stageDetection");
const stageCases = [
    {
        name: 'Class 10 direct mapping',
        intake: { currentStage: 'Class 10', currentSituation: 'stream confusion' },
        expected: stageDetection_1.StudentStage.PRE_12TH,
    },
    {
        name: 'Intermediate direct mapping',
        intake: { currentStage: 'Intermediate 2nd year', currentSituation: 'JEE prep stress' },
        expected: stageDetection_1.StudentStage.POST_12TH,
    },
    {
        name: 'BTech direct mapping',
        intake: { currentStage: 'BTech 2nd or 3rd year', currentSituation: 'branch regret' },
        expected: stageDetection_1.StudentStage.IN_COLLEGE,
    },
    {
        name: 'Graduated direct mapping',
        intake: { currentStage: 'Graduated / job confusion', currentSituation: 'no job yet' },
        expected: stageDetection_1.StudentStage.POST_COLLEGE,
    },
];
const trackCases = [
    {
        name: 'Final year should stay career-counseling',
        input: { currentStage: 'Final year / placement stage', currentSituation: 'placement stress' },
        expected: 'career-counseling',
    },
    {
        name: 'Graduated should be employability track',
        input: { currentStage: 'Graduated / job confusion', currentSituation: 'no job' },
        expected: 'post-college-employability',
    },
    {
        name: 'Class 10 should be school support track',
        input: { currentStage: 'Class 10', currentSituation: 'stream confusion' },
        expected: 'school-exam-support',
    },
    {
        name: 'Intermediate should be school support track',
        input: { currentStage: 'Intermediate 2nd year', currentSituation: 'exam stress' },
        expected: 'school-exam-support',
    },
    {
        name: 'Degree year should be career-counseling',
        input: { currentStage: 'Degree 2nd or 3rd year', currentSituation: 'confused about direction' },
        expected: 'career-counseling',
    },
];
let failed = 0;
console.log('\nStage detection checks:\n');
for (const c of stageCases) {
    const got = (0, stageDetection_1.detectStudentStage)(c.intake).stage;
    const pass = got === c.expected;
    if (!pass)
        failed += 1;
    console.log(`${pass ? 'PASS' : 'FAIL'} | ${c.name} | expected=${c.expected} got=${got}`);
}
console.log('\nCounseling track checks:\n');
for (const c of trackCases) {
    const got = (0, stageDetection_1.deriveCounselingTrack)(c.input);
    const pass = got === c.expected;
    if (!pass)
        failed += 1;
    console.log(`${pass ? 'PASS' : 'FAIL'} | ${c.name} | expected=${c.expected} got=${got}`);
}
if (failed > 0) {
    console.error(`\nStage detection test failed with ${failed} failing case(s).`);
    process.exit(1);
}
console.log('\nStage detection test passed.');
