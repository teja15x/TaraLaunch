# Tara Foundation Package (V1)

## 1) Product Foundation (Concise PRD)

### Core Purpose
Tara is a lifelong personal navigation companion that helps users move from uncertainty to better decisions through experience, evidence, reflection, and action.

### V1 Scope Boundary
**In V1**
- Cycle-led onboarding identity (explore → choose → consequence → reflection → next choice).
- Natural conversation start (no long questionnaire).
- Structured memory + personal model updates from conversation.
- 3–5 high-signal experiences/simulations.
- Evidence ledger + explainable insight.
- Multiple hypotheses (not fixed labels).
- One concrete next action handoff.

**Not in V1**
- Full social graph, large marketplace, thousands of simulations, employer scoring, public ranking systems.

### Non-Negotiables
1. Experience before commitment.
2. Evidence before advice.
3. Evolution before labels.
4. Human agency remains final.
5. Safety and privacy by design.

### Success Metrics
- Decision-quality uplift (pre/post uncertainty score).
- Useful discovery rate.
- Experience completion rate.
- Next-action completion rate.
- Return usage after first meaningful insight.

---

## 2) One “Perfect Loop” MVP

### Chosen First Proof
- **Persona:** 19–23 (in-college / early graduate).
- **Uncertainty:** “Software Engineering vs Product Management”.

### Single Loop
Talk → Experience → Evidence → Reflection → Insight → Next Action → Memory

### Acceptance Criteria
- User receives at least one explainable insight tied to evidence.
- User gets one real-world next action with due date.
- System stores evidence and action in persistent storage.

---

## 3) Core System Contracts

### User Stories (Core)
- As a user, I can describe my uncertainty naturally.
- As a user, I can test myself through an experience, not just answer static questions.
- As a user, I can see what evidence Tara used and what is still unknown.
- As a user, I can receive one concrete next action and track completion.
- As a user, I can view/correct/delete major memory items.

### Five Core Surfaces
- **Talk:** capture context and uncertainty.
- **Explore:** show plausible pathways and trade-offs.
- **Experience:** run simulation/micro-experiment.
- **Journey:** show how beliefs/evidence changed over time.
- **Next:** convert insight into real-world action.

### Model Contracts
- **Personal model:** facts, constraints, preferences, capabilities, goals, decisions, outcomes.
- **Evidence ledger:** observation → evidence → interpretation → confidence → unknown → next experiment.
- **Hypothesis:** cluster + confidence + counter-evidence + unknowns + next tests.

---

## 4) Technical Architecture (V1)

### Frontend
- Next.js App Router surfaces for Talk, Experience, Journey, Next.
- Adaptive UI state driven by stage and evidence quality.

### Backend
- API routes orchestrating conversation, evidence logging, action extraction, and recommendation gates.
- Supabase persistence for chat, evidence, constraints, contradictions, action items, and school/B2B entities.

### AI Boundaries
- OpenAI handles generation, summarization, and structured extraction.
- Application code owns business logic, stage gates, evidence weighting, and safety constraints.

### Privacy + Safety
- Auth-gated access.
- User-scoped data access (RLS).
- Explicit uncertainty language when evidence is weak.

---

## 5) End-to-End Slice Implemented in This Iteration

- Replaced School dashboard mock telemetry with real data from `/api/school/dashboard`.
- Added derived high-risk queue and cohort vectors from persisted student/assessment/recommendation data.
- Enabled CSV-driven invite ingestion in `/school/invite` via file upload and server-side parsing in `/api/school/invite`.

This slice is now persistence-backed (no static mock payload for core school telemetry view).

---

## 6) Validation + Learning Layer

Track and review:
- Cohort assessment progress (`avg_clarity`, `assessed_students`).
- High-risk detection volume (`high_risk_count`).
- Invite conversion funnel seeds (bulk invite success/failure).
- Action completion and return usage (existing `student_action_items` flow).

Immediate research loop:
- Run user interviews on real past decisions.
- Measure clarity delta before/after one full loop.

---

## 7) Expansion Gates

Only expand experiences/worlds/opportunity layer after:
1. First-loop uncertainty reduction is measurable.
2. Evidence-to-insight explanations are trusted by users.
3. Next actions are completed at meaningful rates.
4. Safety/privacy controls are stable in real usage.
