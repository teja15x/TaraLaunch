# Mechanic-to-Feature Map: 24-Hour Rebuild Blueprint

**Objective**: Extract proven engagement mechanics from global (including Chinese) edtech apps. Rebuild with original code, career-agent voice, India-first context. Avoid asset copying; focus on behavioral patterns.

**Timeline**: 24 hours, 5 mechanics, modular breakdown.

---

## Mechanic 1: Streak System + Habit Tracking
**Gold Standard**: Duolingo (daily streaks), Habitica (consistency rewards)

### Mechanics Extracted
- Daily login triggers streak counter (1, 7, 30, 90-day milestones)
- Streak freeze (pause without breaking; costs 1 token or payment)
- Public/private streak visibility
- Progression badges tied to streaks (5-day warrior, 30-day master)

### Career-Agent Rebuild
**Component**: `src/components/dashboard/StreakWidget.tsx` (NEW)
- Store: Add `streakData` to Zustand (lastLoginDate, currentStreak, longestStreak, streakMilestones)
- Database: `user_streaks` table (user_id, current_streak, longest_streak, last_login, frozen_until)
- Logic:
  - Check-in trigger on chat/game start → increments streakData if date > lastLoginDate
  - Milestone alerts: 7, 30, 90 days → badge unlock + guidance reward
  - India-first copy: "90-day Master = eligible for career counselor 1-on-1 session"

**Time**: 3-4 hours
**Files to create/modify**:
- Zustand store: Add streakData
- Supabase: Create user_streaks migration
- New component: StreakWidget.tsx
- Dashboard: Wire streak display + daily login check

---

## Mechanic 2: Adaptive Mission Routing (Easy → Hard Progression)
**Gold Standard**: Duolingo's difficulty scaling, Kuaishou's content ranking algorithm

### Mechanics Extracted
- Starter missions (low friction, high success rate)
- Adaptive branching: if success rate > 70% → harder mission offered
- If failure rate > 40% → backtrack to easier level
- Mission recommendations based on performance history
- Difficulty visualization (1-5 stars)

### Career-Agent Rebuild
**Component**: `src/components/dashboard/AdaptiveMissionBoard.tsx` (NEW)
- Logic Layer: Enhanced `src/lib/career-engine/adaptiveMissioner.ts` (NEW)
  - Input: User's last 5 game scores + chat depth + confidence score (already computed)
  - Algorithm:
    ```
    if (reliabilityScore < 50) → recommend "Quick Win" game (DecisionMaze, easiest)
    else if (completedGames < 2) → recommend mid-tier (PatternMaster, TeamLeader)
    else if (reliabilityScore > 75 && completedGames >= 3) → recommend "Advanced" (BudgetTradeoffLab, ScenarioQuest)
    ```
  - Difficulty score: 1-5 stars based on game complexity + user's success history
  - India-first twist: "Tailor path to entrance exam prep (JEE, NEET, IPMAT track)" — recommend games aligned to entrance readiness
- Database: Add `mission_performance` table (user_id, game_id, score, completedAt, difficulty_recommended)
- Dashboard: Render adaptive mission queue with star difficulty + next recommended game

**Time**: 4-5 hours
**Files**:
- New: src/lib/career-engine/adaptiveMissioner.ts
- New: src/components/dashboard/AdaptiveMissionBoard.tsx
- Store: Track last 5 game scores + recommended next mission
- Supabase: mission_performance migration

---

## Mechanic 3: Simulation Loops (Branching Decision Scenarios)
**Gold Standard**: Reigns/choices narratives, *Her Story* branching, Duolingo stories

### Mechanics Extracted
- Non-linear branching: Decision A → outcome A1/A2; Decision B → outcome B1/B2
- Consequence feedback: Show result of choice immediately (learning loop)
- Multi-path completion: Same goal, 3-5 different routes
- Replayability: Restart scenario to try alternative path
- Trait extraction from choice path (what decisions reveal about student)

### Career-Agent Rebuild
**Component**: Extend `src/components/games/ScenarioQuest.tsx` (NEW branching engine)
- Logic:
  - Create scenario JSON template with choice branching (decision tree)
  - India-first scenario library:
    1. **"Board vs. Stream"**: JEE/NEET/Commerce choice → reveals trait alignment by path
    2. **"Coaching Dilemma"**: Self-study vs. classroom coaching → reveals adaptability + confidence
    3. **"Parent Pressure"**: Family vs. passion choice → reveals conflict resolution + values
    4. **"Competitive Edge"**: Internship vs. certificate vs. additional tests → reveals ambition + execution
  - Trait extraction: Map each choice branch to RIASEC/Gardner weights
  - Feedback loop: After each choice, show 1-2 sentence consequence (e.g., "You chose self-study. This reveals high independence—key for engineering roles.")
  - Replayability: "Try another path" button to restart scenario
- Database: `scenario_completions` table (user_id, scenario_id, path_taken, traits_detected, completedAt)
- Component: Interactive branching UI (current choice highlighted, visible branches)

**Time**: 4-5 hours
**Files**:
- Extend: ScenarioQuest.tsx with branching logic
- New: src/data/scenarios.json (scenario templates with choice trees)
- New: src/lib/career-engine/scenarioParser.ts (parse choice paths → trait extraction)
- Supabase: scenario_completions migration

---

## Mechanic 4: Confidence Gates + Evidence-based Predictions
**Gold Standard**: Duolingo's test-out, LinkedIn Skill assessments (built-in confidence checks)

### Mechanics Extracted
- Gating: Don't show next level until confidence threshold met (not just completion)
- Transparency: Show "Why you passed/failed" + evidence metric
- Retest pathways: Option to re-attempt if confidence low
- Confidence scoring: Multi-signal (performance + time + consistency)

### Career-Agent Rebuild
**Already Partially Done** (from msg 6 hardening). Enhance:
- Results page already computes evidence reliability score (chat + games + progress)
- Now add: **Retest pathway** for low-confidence predictions
  - If reliabilityScore < 60: "Complete 1 more game or 5 more chat turns to unlock refined predictions"
  - If 60-75: Show yellow "Provisional Prediction" warning
  - If > 75: Show green "Confident Prediction" badge
- Gating: Career matches locked until reliabilityScore >= 50 (show unlock progress)
- Retest UX: "Retake Assessment" button → Triggers fresh game recommendation + re-calibration

**Time**: 2-3 hours (leverage existing code)
**Files**:
- Modify: src/app/(main)/results/page.tsx (add retest button + gating UX)
- New: src/components/results/ConfidenceGate.tsx (locked prediction UI until threshold)
- Store: Add retestCount, lastRetestDate

---

## Mechanic 5: Parent Co-Pilot (Accountability Partner View)
**Gold Standard**: Duolingo for Schools, WeChat parental controls, Byjus parent dashboard

### Mechanics Extracted
- Parent dashboard: Child's weekly progress feed (games completed, streak, career path updates)
- Nudge system: Parent gets weekly digest (1 email/in-app) on child's engagement + milestones
- Insight sharing: "Your child scored high on leadership. Recommend X role exploration."
- Accountability check: Parent can see "days since last login" + gentle nudge prompt
- Privacy toggle: Student can hide/show specific career interests

### Career-Agent Rebuild
**New zone**: `src/app/(main)/parent/` (NEW full section)
- Components:
  - `ParentDashboard.tsx`: Overview of child's profile → streak, games completed, current guidance path, top 3 detected careers
  - `WeeklyReportEmail.ts`: Nodemailer template (weekly summary: games, streak, new insights)
  - `ChildProgressCard.tsx`: Reusable card showing child's week snapshot
  - `InsightAlert.tsx`: "Your child is now 60% confident in their path" + action prompt
- Database:
  - `parent_profiles` table (parent_id, child_id, relation, emailFrequency, lastWeeklyEmailSent)
  - `parent_notifications` table (parent_id, notification_type, child_achievement, readAt)
- Logic layer: `src/lib/career-engine/parentInsightGenerator.ts`
  - Weekly cron job: Generate insights from child's game scores + confidence scores
  - Email template: India-first messaging: "Your child is now ready for [entrance exam] prep. Next: Mock test series."
- Sharing: Parent can share specific child insight with career counselor (for co-counseling)
- Privacy: Student can toggle "Parent can see career interests" on/off

**Time**: 5-6 hours
**Files**:
- New: src/app/(main)/parent/ (full section with layout, dashboard, report)
- New: src/lib/career-engine/parentInsightGenerator.ts
- New: src/components/results/ParentInsight.tsx
- Supabase: parent_profiles, parent_notifications migrations
- Email: src/lib/email/weeklyReportTemplate.ts (Nodemailer)

---

## Integration Timeline (24 Hours)

| Hour Range | Mechanics | Owner | Status |
|---|---|---|---|
| 0-4 | Streak System | Frontend + DB | In Progress |
| 4-9 | Adaptive Mission Routing | Engine + Frontend | In Progress |
| 9-13 | Simulation Loops (Scenarios) | Content + Frontend | In Progress |
| 13-16 | Confidence Gates | Frontend (leverage existing) | In Progress |
| 16-22 | Parent Co-Pilot | Full stack (longest) | In Progress |
| 22-24 | Testing + Lint + Deploy prep | QA | In Progress |

---

## India-First Customization (Per Mechanic)

### Streak System
- Milestone messaging: "7-day streak = You're ready for first career counselor session"
- Entrance exam tie-ins: "30-day streak = Eligible for JEE/NEET practice test unlock"

### Adaptive Missions
- Entrance exam routing: "Based on 50% confidence → recommend NEET-aligned games next"
- State-based difficulty: "Tamil Nadu board path" vs. "CBSE path" vs. "ICSE path"
- Cutoff-aware: "Complete 3 games before entering this market phase (cutoff volatility)"

### Simulation Loops
- Scenarios rooted in Indian student reality:
  - "Can I afford coaching + 2-hour daily commute?" (urban vs. tier-2 city realities)
  - "What if my entrance exam score comes back lower than expected?" (grace period decisions)
  - "Should I retake or start degree immediately?" (time-pressure realism)

### Confidence Gates
- Messaging: "Your career path is still provisional. Play 2 more games before discussing with parents."
- Cultural nuance: "We need 60% confidence before recommending this to counselors (in case family skepticism)."

### Parent Co-Pilot
- Weekly nudge tone: "Your child is now 70% confident in [path]. Time to book counselor session?"
- Entrance year alarm: "Your child's entrance exam is 180 days away. They need to lock path by [date]."
- Multi-language parent emails: English + Regional (Telugu, Tamil, Kannada, etc. based on student's state)

---

## Rebuild & Ship Checklist

- [ ] **Hour 4**: Streak system live on dashboard (users see daily login count)
- [ ] **Hour 9**: Adaptive mission board live (next game recommendation based on performance)
- [ ] **Hour 13**: Scenario branching live (ScenarioQuest shows choices → outcomes)
- [ ] **Hour 16**: Confidence gates live (results page shows retest threshold + unlock progress)
- [ ] **Hour 22**: Parent dashboard live (parent can log in, see child summary + weekly email)
- [ ] **Hour 24**: Lint validation + final test + merge to main branch

---

## Speed Optimization Tips

1. **Reuse existing infrastructure**:
   - Store existing Zustand structure; add streakData as new slice
   - Leverage already-computed reliabilityScore (msg 6 hardening)
   - Use BudgetTradeoffLab template as basis for Scenario branching UI

2. **Parallel workstreams**:
   - Frontend (streaks, adaptive UI) in parallel with backend (Supabase migrations)
   - Email template can be mocked initially (Nodemailer setup in parallel)

3. **India-first content as layer, not rebuild**:
   - Don't retranslate everything; swap key copy strings + scenario themes
   - Use existing games; add regional scenario overlays

4. **Skip non-critical features initially**:
   - Parent app doesn't need multi-language translation in hour 24 (English first, i18n after)
   - Streak freeze (premium feature) can launch in v2

---

## Risk Flags

- **Database schema**: Supabase migrations must not conflict with existing auth/profiles tables. Pre-test migrations before deploy.
- **Parent auth**: Need to ensure parent OAuth/signup flow doesn't break existing student auth. Test with separate test account.
- **Email deliverability**: Weekly digest emails need SMTP setup (Resend/Sendgrid). Pre-configure or mock for first launch.
- **Timezone handling**: Streaks reset at midnight, but students are across India (+05:30). Use UTC + client-side local reset display.

---

## Post-24H Roadmap (Phase 2)

- [ ] Streak freeze + streak shop (premium tokens)
- [ ] Advanced adaptive engine (RL-based mission ranking, not rule-based)
- [ ] i18n for parent emails (Telugu, Tamil, Kannada, Marathi)
- [ ] Parent co-pilot nudge experiments (A/B test email frequency + messaging tone)
- [ ] Student achievement sharing (social streak leaderboards with privacy control)

---
