"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankedKnowledgeRoles = getRankedKnowledgeRoles;
exports.buildKnowledgeBasePromptBlock = buildKnowledgeBasePromptBlock;
const careers_1 = require("@/data/careers");
const roleKnowledge_1 = require("@/lib/career-agent/roleKnowledge");
function normalizeText(text) {
    return (text ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokenize(text) {
    return normalizeText(text)
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.length >= 3);
}
function unique(items) {
    return [...new Set(items)];
}
function buildCorpus(role) {
    return normalizeText([
        role.title,
        role.category,
        role.description,
        ...(role.education_path ?? []),
        ...(role.required_skills ?? []),
        ...(role.related_careers ?? []),
    ].join(' '));
}
function scoreRole(role, contextTokens, selectedRole, detectedRoleFromMessage, counselingTrack) {
    const reasons = [];
    let score = 0;
    const corpus = buildCorpus(role);
    // Exact role intent is the strongest signal.
    if (selectedRole?.trim()) {
        const selected = normalizeText(selectedRole);
        const title = normalizeText(role.title);
        if (title === selected) {
            score += 140;
            reasons.push('Exact selected role match');
        }
        else if (title.includes(selected) || selected.includes(title)) {
            score += 90;
            reasons.push('Strong selected role similarity');
        }
    }
    if (detectedRoleFromMessage?.trim()) {
        const detected = normalizeText(detectedRoleFromMessage);
        const title = normalizeText(role.title);
        if (title === detected) {
            score += 120;
            reasons.push('Role detected directly from latest message');
        }
        else if (title.includes(detected) || detected.includes(title)) {
            score += 70;
            reasons.push('Role text overlap with latest message');
        }
    }
    // Context token overlap (interests, confusion, situation, latest message).
    let overlap = 0;
    for (const token of contextTokens) {
        if (corpus.includes(token)) {
            overlap += 1;
        }
    }
    if (overlap > 0) {
        const tokenScore = Math.min(80, overlap * 8);
        score += tokenScore;
        reasons.push(`Matched ${overlap} context signals`);
    }
    // Track-specific weighting for better relevance.
    if (counselingTrack === 'school-exam-support') {
        const eduText = normalizeText((role.education_path ?? []).join(' '));
        if (eduText.includes('neet') || eduText.includes('jee') || eduText.includes('foundation') || eduText.includes('class')) {
            score += 25;
            reasons.push('Aligned to exam-support track');
        }
    }
    if (counselingTrack === 'post-college-employability') {
        if (role.required_skills.length >= 4) {
            score += 20;
            reasons.push('Skill-rich role fit for employability planning');
        }
    }
    if (role.growth_outlook === 'high') {
        score += 8;
    }
    return { score, reasons };
}
function stageLabel(detectedStage) {
    const normalized = normalizeText(detectedStage);
    if (normalized.includes('pre12') || normalized.includes('pre 12'))
        return 'pre-12th';
    if (normalized.includes('post12') || normalized.includes('post 12'))
        return 'post-12th';
    if (normalized.includes('incollege') || normalized.includes('in college'))
        return 'in-college';
    if (normalized.includes('postcollege') || normalized.includes('post college'))
        return 'post-college';
    return 'unknown';
}
function getRankedKnowledgeRoles(input) {
    const detectedRoleFromMessage = (0, roleKnowledge_1.detectRoleMentionFromText)(input.latestMessage);
    const contextText = [
        input.latestMessage,
        input.selectedRole,
        input.studentIntake?.targetRole,
        input.studentIntake?.interests,
        input.studentIntake?.confusion,
        input.studentIntake?.currentSituation,
        input.studentIntake?.stressors,
    ].join(' ');
    const contextTokens = unique(tokenize(contextText));
    const scored = careers_1.careerDatabase.map((role) => {
        const { score, reasons } = scoreRole(role, contextTokens, input.selectedRole, detectedRoleFromMessage, input.counselingTrack);
        return {
            id: role.id,
            title: role.title,
            category: role.category,
            score,
            reasons,
            educationPath: role.education_path,
            requiredSkills: role.required_skills,
            salaryRangeInr: role.salary_range_inr,
            growthOutlook: role.growth_outlook,
        };
    });
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(1, input.maxResults ?? 3));
}
function buildKnowledgeBasePromptBlock(input) {
    const ranked = getRankedKnowledgeRoles(input);
    const stage = stageLabel(input.detectedStage);
    const cityContext = input.studentIntake?.stateOrCity?.trim();
    const topRoleSummary = input.selectedRole ? (0, roleKnowledge_1.getRoleKnowledgeSummary)(input.selectedRole) : null;
    const lines = [
        'KNOWLEDGE BASE RETRIEVAL (Grounded Context):',
        `- Detected stage context: ${stage}`,
        `- Counseling track: ${input.counselingTrack ?? 'career-counseling'}`,
    ];
    if (cityContext) {
        lines.push(`- Location context to respect: ${cityContext}`);
    }
    if (topRoleSummary) {
        lines.push(`- Student focused role: ${topRoleSummary.roleTitle} (${topRoleSummary.roleFamily})`);
        lines.push(`- Role trajectory insight: ${topRoleSummary.growthTo20LpaTimeline}`);
    }
    lines.push('- Top ranked role cards from internal knowledge base:');
    ranked.forEach((role, idx) => {
        const education = role.educationPath.slice(0, 2).join(' | ');
        const skills = role.requiredSkills.slice(0, 4).join(', ');
        const reasons = role.reasons.slice(0, 2).join(' | ');
        lines.push(`  ${idx + 1}. ${role.title} [${role.category}]`);
        lines.push(`     - Match score: ${role.score}`);
        lines.push(`     - Why retrieved: ${reasons || 'General relevance to context'}`);
        lines.push(`     - Typical paths: ${education || 'Path not available'}`);
        lines.push(`     - Core skills: ${skills || 'Skills not available'}`);
        lines.push(`     - Salary estimate (India): ${role.salaryRangeInr ?? 'Use role-family estimate only'}`);
        lines.push(`     - Growth outlook: ${role.growthOutlook}`);
    });
    lines.push('- Response policy with KB:');
    lines.push('  - Use retrieved roles as primary options before suggesting random alternatives.');
    lines.push('  - If confidence is low or context is ambiguous, ask one clarifying question before final narrowing.');
    lines.push('  - Keep salary values as estimates, mention city/tier/skill variance.');
    lines.push('  - Provide at least one low-risk backup path and one high-growth path when recommending choices.');
    return lines.join('\n');
}
