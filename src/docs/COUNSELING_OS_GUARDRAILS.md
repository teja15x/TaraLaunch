# Counseling OS Guardrails
**Status**: Phase 0 Approved  
**Version**: 1.0  
**Date**: March 26, 2026

---

## Overview

This document codifies the non-negotiable principles that govern the Career Counseling OS architecture. These guardrails ensure:
- Evidence-weighted decision-making (no single-signal causality)
- Stage-gated progression (no premature ranking or recommendations)
- Explainability by design (students understand why, not just what)
- Cultural and emotional integrity (India-first, family-aware, realistic)

---

## Core Guardrails

### 1. No Early Ranking
**Non-Negotiable**: Career ranking is **strictly forbidden** until the student reaches the **recommendation stage**.

**Definition of Stages**:
- **Discovery** (Turns 1-25): Build rapport, surface top-level preferences, identify initial confidence band (low)
- **Narrowing** (Sessions 2+): Collect evidence from assessments, games, and role-depth tests; stress-test hypotheses
- **Recommendation** (When gates pass): Rank careers with explainability; present confidence bands and supporting evidence

**Code Enforcement**:
```typescript
// ✖ FORBIDDEN in discovery/narrowing stages
match_route.recommend([{career: "Software Engineer", score: 0.87}])

// ✓ ALLOWED in discovery stage
match_route.exploreClusters(["IT/Tech", "Engineering", "Business"])

// ✓ ALLOWED in recommendation stage with explainability
match_route.rankCareers([
  {
    career: "Software Engineer",
    confidence: 0.78,
    supportingEvidence: ["PatternMaster (90%)", "RoleDepth (intermediate)", "Chat (strategic mindset)"],
    contradictions: ["Claims artist but plays puzzle games exclusively"],
    rejectedAlternatives: ["UX Designer (low spatial reasoning signal)"]
  }
])
```

---

### 2. Evidence Governance
**Non-Negotiable**: No single signal (game score, assessment result, or conversation statement) can determine a career recommendation.

**Evidence Hierarchy**:
1. **Primary (40%)**: Multi-turn conversation analysis + constraint profiles (location, budget, family context)
2. **Secondary (30%)**: RIASEC + Gardner + Big Five assessments (triangulated)
3. **Tertiary (20%)**: Role-depth knowledge tests (validates misconception calibration)
4. **Supporting (10%)**: Games (evidence contributors, not decision drivers)

**Game Weight Ceiling**: No single game can contribute more than 15-20% influence to any career recommendation.

**Contradiction Handling**:
```typescript
// If student says "I love coding" but plays creative games only:
// ACTION: Do NOT proceed to ranking
// INSTEAD: Hold in narrowing stage, trigger re-probe conversation
Evidence.addContradiction({
  signal_1: "Chat extraction - 'I want to code'",
  signal_2: "Game results - 8 creative games, 0 logic games",
  hold_stage: "narrowing",
  reprobe: "Tell me about a time you loved solving a logic puzzle"
})
```

---

### 3. Stage Gates (Measurable & Testable)
**Non-Negotiable**: Each stage has explicit gate conditions. No advancement without meeting gates.

#### Discovery → Narrowing Gate
```
Required:
✓ ≥ 25 meaningful conversational turns (not greetings/hellos)
✓ ≥ 2 distinct assessment types started (RIASEC or Gardner or Big Five)
✓ Student has named ≥ 3 career interests or stated preferences
✓ Constraint profile: location, budget, language preference captured
✓ No unresolved contradictions in conversation history
```

#### Narrowing → Recommendation Gate
```
Required:
✓ ≥ 1 complete assessment* (RIASEC 6/6 dimensions + Gardner 8/8 dimensions)
✓ ≥ 2 completed games from different categories
✓ ≥ 1 role-depth test completed (validates understanding of claimed careers)
✓ All career preferences stress-tested (counselor asked "why" 3+ times per career)
✓ Family context, affordability constraints, location constraints explicitly discussed
✓ No active contradictions (all conflicts resolved or explicitly acknowledged)
✓ Student expressed clarity band ≥ "medium" (confidence visible in language)

(*) Complete = 80%+ questions answered; 1-2 skips acceptable with explicit 'uncertain' marking
```

---

### 4. Explainability by Design
**Non-Negotiable**: Every ranking, cluster, or career suggestion must include supporting evidence and alternatives considered.

**Required Fields in All Ranking Responses**:
```typescript
interface CareerRanking {
  career_title: string;
  confidence_band: "low" | "medium" | "high";  // Not numeric score
  confidence_rationale: string;  // e.g. "Medium: 3/4 dimensions aligned, 1 test pending"
  
  supporting_evidence: Array<{
    source: "chat" | "game" | "assessment" | "constraint";
    signal: string;  // e.g. "StoreyWeaver 89%: Strong narrative + social creativity"
    weight: number;  // Explicit contribution (e.g., 0.12 = 12%)
    timestamp: string;
  }>;
  
  contradictions_resolved: Array<{
    conflict: string;
    resolution: string;
    counselor_move: string;  // e.g. "Reframed coding vs design tension:"
  }>;
  
  rejected_alternatives: Array<{
    career: string;
    reason_rejected: string;
    evidence: string;
  }>;
  
  next_validation_action: string;  // e.g. "Recommend IT role-depth test to confirm"
}
```

---

### 5. Cultural & Emotional Integrity
**Non-Negotiable**: Guidance must be grounded in Indian context, not Western career myths.

**Protected Principles** (from indianLanguageCulturePacks.ts):
- ✓ Swadharma over comparison (your path, not Karan's IIT path)
- ✓ Build before brand (skills first, placement anxiety later)
- ✓ Dream with discipline (aspirations + affordability realism)
- ✓ Dignity plus livelihood (career respects self-respect + family values)
- ✓ Compounding beats cramming (long-term patience, not coaching-center desperation)

**Forbidden Language**:
- ❌ "You must become a software engineer because the market wants it"
- ❌ "Your gaming scores suggest you're a natural coder" (game ≠ skill)
- ❌ "90% of students your age are in IT" (pressure + comparison)

**Mandatory Language**:
- ✓ "Your conversation reveals you enjoy solving problems **systematically**. Let's explore careers where that matters."
- ✓ "I see tension between your interest and your family's expectations. Let's map realistic pathways that honor both."

---

### 6. Family-Aware Constraints
**Non-Negotiable**: Every recommendation must acknowledge student's family context.

**Constraints to Capture**:
```typescript
interface FamilyContext {
  parent_aspiration: string;  // e.g., "IIT engineer" vs "stable government job"
  family_risk_tolerance: "low" | "medium" | "high";
  affordability_level: "aspirational" | "accessible" | "tight";
  location_flexibility: "within_state" | "metro_cities" | "anywhere";
  family_pressure_level: "low" | "moderate" | "high";
}
```

**Recommendation Gating**:
- If affordability = "tight" AND career requires ₹20L+ education → DON'T recommend until vocational/affordable pathways explored
- If parent_aspiration = "IIT" AND student = "builder not academic" → Acknowledge tension explicitly in recommendations

---

### 7. No Fake Confidence
**Non-Negotiable**: Confidence bands must reflect actual signal quality.

**Confidence Mapping** (Evidence-Backed):
```
HIGH confidence (0.70+):
  → ≥ 2 independent evidence sources aligned
  → ≥ 1 role-depth test passed (intermediate+ level)
  → Student has discussed career with family/seniors
  → ≥ 15 turns about this specific career

MEDIUM confidence (0.40-0.69):
  → ≥ 1 assessment dimension + ≥ 1 game aligned
  → 1 initial role-depth signal captured
  → ≥ 8 turns discussing this career

LOW confidence (<0.40):
  → Single assessment OR single game signal only
  → Student has not articulated "why" for this career
  → Active contradictions unresolved
```

**Never Output**: Numeric scores like "0.87". Always use explicit bands with reasoning.

---

### 8. Contradiction Triggers
**Non-Negotiable**: Detect and hold on contradictions. Never suppress them.

**Auto-Hold Triggers**:
```typescript
// Pattern 1: Claims vs evidence mismatch
if (studentSays("I love coding") && gameResults("8 creative, 0 logic")) {
  counselor.hold("narrowing")
  counselor.reprobe("Tell me about the last time you enjoyed solving a technical problem")
}

// Pattern 2: Time distance + commitment gap
if (student_interest_age < 8 AND student_age >= 16) {
  // Long-standing interest = positive signal, but probe for false permanence
  counselor.reprobe("What attracted you to this when you were younger? Still true?")
}

// Pattern 3: Affordability + aspirational mismatch
if (family_affordability("tight") && career_cost("premium") && no_affordability_exploration) {
  counselor.hold("narrowing")
  counselor.reprobe("How do you plan to afford this? What's your backup if scholarships don't work?")
}
```

---

## Implementation Checklist

**Phase 0 Guardrails Document** ✓ (This file)

**Phase 1: Stage Machine Override**
- [ ] Implement `StageGates` in [src/app/api/career/match/route.ts](src/app/api/career/match/route.ts)
- [ ] Add contradiction detection to [src/app/api/chat/route.ts](src/app/api/chat/route.ts)
- [ ] Create `CounselingState` type to track gate status

**Phase 2: Evidence Model & Persistence**
- [ ] Add `evidence_log` table to Supabase schema
- [ ] Implement `EvidenceItem` and `RecommendationDossier` persistence
- [ ] Create evidence aggregation function for explainability

**Phase 3: Engine Split**
- [ ] Create `HypothesisEngine` (early-stage cluster matching)
- [ ] Create `RecommendationEngine` (gated ranking with explainability)
- [ ] Cap game influence in [src/lib/career-engine/adaptiveMatching.ts](src/lib/career-engine/adaptiveMatching.ts)

**Phase 4: API Contract Redesign**
- [ ] Refactor match route response schema with explainability fields
- [ ] Add backward-compatibility adapter
- [ ] Document confidence band logic in API spec

**Phase 5: Chat Orchestration**
- [ ] Add stage transition detection to chat route
- [ ] Implement stage recap messages
- [ ] Update prompts to include stage context

**Phase 6: Verification & Rollout**
- [ ] Build shadow-mode comparison harness
- [ ] Define quality gates (precision, false-confidence incidents)
- [ ] Implement feature flags for cohort rollout

---

## Quality Metrics (Post-Implementation)

**Tracking Gates**:
- No recommendation generated with confidence < 50% (indicates gate failure)
- Zero contradictions in final dossier that weren't explicitly resolved
- 100% of ranked careers include ≥ 3 supporting evidence sources
- Family context acknowledged in 100% of recommendations

**Student Outcomes** (Long-term):
- Recommendation acceptance rate (student pursues suggested path within 6 months)
- Confidence retention (student still confident in choice at 6-month follow-up)
- No regret signals (student doesn't pivot after accepting recommendation)

---

## Appendix: Reading Order

1. **This document** (guardrails & non-negotiables)
2. [src/types/index.ts](src/types/index.ts) - Type contracts for stages, evidence, dossiers
3. [src/app/api/career/match/route.ts](src/app/api/career/match/route.ts) - Match API with stage gates
4. [src/app/api/chat/route.ts](src/app/api/chat/route.ts) - Chat orchestration for stage transitions
5. [src/lib/career-engine/](src/lib/career-engine/) - Engine architecture (hypothesis vs recommendation)

---

**Approved**: March 26, 2026 | **Owner**: Career Engine Team | **Status**: Locked for Phase 1 implementation
