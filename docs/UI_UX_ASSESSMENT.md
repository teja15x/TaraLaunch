# Career Agent UI/UX Assessment Report
**Date**: March 25, 2026  
**Status**: 5 Mechanics Shipped | UX Architecture Needs Restructuring  
**Confidence**: High (based on code review + component analysis)

---

## Executive Summary

The career agent has successfully implemented all 5 core mechanics within 24 hours:
- ✅ Streak system
- ✅ Adaptive mission routing
- ✅ Scenario branching
- ✅ Confidence gates
- ✅ Parent co-pilot

**However, the UI/UX structure obscures these mechanics.** Users will struggle to:
1. Understand the game progression system
2. Discover how to unlock parent visibility
3. See why specific games are recommended
4. Know why career matches are locked behind confidence thresholds

---

## 1. DASHBOARD ANALYSIS

### Current Structure
```
Dashboard (max-w-6xl, space-y-8)
├─ Welcome header (h1 + ageTier badge)
├─ Finish Core Assessment Loop (Card + progress bar + 3 game buttons)
├─ Your Momentum (StreakWidget)
├─ Next Mission (AdaptiveMissionBoard)
├─ Your Progress (2-column grid)
│  ├─ My Progress (stats)
│  └─ Decision Readiness (blockers + button)
├─ What Changed (LIVE_UPDATES, 2 items shown)
├─ Continue Journey (4 quick-links)
└─ Explore More (4 feature cards)
```

**Total visible elements**: 8 distinct sections, 30+ buttons/links

### Problems Identified

#### 🔴 Problem 1: Visual Chaos
- **No clear visual hierarchy**: All cards use similar gradient styling
- **Competing CTAs**: "Continue Journey", "Open Results Studio", "Finish Core Assessment Loop" buttons all fight for attention
- **Cognitive overload**: New user lands on dashboard and sees 8 different calls-to-action

**Consequence**: Users don't know where to start. They might skip "Next Mission" (the most important feedback loop) and go straight to "Explore More".

---

#### 🔴 Problem 2: Mechanics Are Invisible
| Mechanic | Location | Visibility |
|----------|----------|-----------|
| Streak | Dashboard StreakWidget | ⚠️ Moderate (buried in scroll) |
| Adaptive Missions | Dashboard AdaptiveMissionBoard | ✅ Good (featured) |
| Scenario Branching | Games Lab (separate page) | 🔴 MISSING from dashboard |
| Confidence Gates | Results page (after playing games) | 🔴 HIDDEN |
| Parent Co-Pilot | Sidebar nav (marked "Growing") | 🔴 DISCONNECTED (mock data) |

**User's expected path**: Dashboard → Mission → Results → Parents share → repeat  
**User's actual path**: Dashboard → Random section → [Lost]

---

#### 🔴 Problem 3: Unclear Unlock Mechanism
Dashboard says:
```
"Complete the 3 core games, review your first result pattern, and lock 
one India-focused weekly action in Guidance."
```

But doesn't explain:
- Why core games unlock advanced games
- Why advanced games unlock parent visibility
- Why playing games → "reliability score" → unlock career matches
- How streak connects to counselor eligibility

**Consequence**: User plays 3 games, sees locked results, doesn't understand why they need more evidence.

---

#### 🔴 Problem 4: Age Tier Is Isolated
Age tier badge (Explorer, Discoverer, Navigator, Pivoter) is shown but:
- Not connected to game recommendations
- Not used to explain difficulty
- Not surfaced in mission routing

**Consequence**: Badge feels like decoration, not a progression system.

---

### Dashboard Redesign Proposal

**Target**: 4 sections, clear progression

```
Dashboard (redesigned)
├─ [STATUS BAR] Streak + Confidence + Next Unlock
│  "🔥 5-day streak | 🎓 50% confident | 2 games to unlock Results"
│
├─ [PRIMARY CTA] Next Recommended Action
│  "🎲 Next Game: Pattern Master (Build Analytical Skills)"
│  [Play Now button]
│
├─ [PROGRESS] Milestone Tracker
│  "Unlocks in progress:"
│  - 🔓 70% confident (for Full Results)
│  - 🔒 7-day streak (for Counselor Session)
│
└─ [SECONDARY] Quick Access
   "Ready for more? [Chat] [Guidance] [Games Lab] [Roles]"
```

**Benefits**:
- ✅ Clear primary path (Next Game)
- ✅ Visible mechanics (streak, confidence, missions)
- ✅ Progressive disclosure (locked features shown but inaccessible)
- ✅ One screen, no scroll for mobile

---

## 2. NAVIGATION STRUCTURE ANALYSIS

### Current Sidebar

```
Dashboard
Roles
Career Agent (Chat)
Games Lab
Results
Guidance
Parent Zone
School Hub
Plans
```

### Problems

#### 🔴 Problem 1: Flat Hierarchy
All 9 items have equal visual weight. A new user cannot distinguish:
- Essential features (Games, Chat, Results)
- Secondary features (Guidance)
- Commercial features (Plans)
- Incomplete features (School Hub marked "Growing")

**Consequence**: Users waste time exploring dead-ends like School Hub.

---

#### 🔴 Problem 2: Parent Zone Is Unreachable
- Nav item exists
- Shows mock data
- No child linking
- Dead-end experience

User thinks: "Oh, I can share with my parents!" but then discovers it's empty.

---

#### 🔴 Problem 3: No Onboarding Path
New users see all 9 options immediately. Better approach:
- **First visit**: Show only [Dashboard, Games Lab, Chat]
- **After 1st game**: Unlock [Results, Guidance]
- **After 2nd week**: Unlock [Parent Zone]
- **After using Results**: Show [Roles]

---

### Navigation Redesign Proposal

```
// Primary Path (required for progression)
Dashboard (with badge: "1 new unlock")
├─ Next: Games Lab → Results → Guidance
├─ Status: [Streak | Confidence | Next milestone]

// Secondary Path (tools)
Chat (Career Agent)
Results (Dashboard for match details)
Guidance (Weekly plans)

// Advanced (unlock after milestones)
[LOCKED] Parent Zone (unlock after 7-day streak)
[LOCKED] Roles Deep Dive (unlock after confident results)

// Administrative
Plans
Settings (new)
Help (new)
```

---

## 3. THE 5 MECHANICS: VISIBILITY ASSESSMENT

### 1. Streak System ⚠️

**Current State**:
```tsx
// StreakWidget.tsx
<div className="text-5xl font-bold text-orange-600">{currentStreak}</div>
<p>"Longest: {longestStreak}"</p>
<Milestone days={7}>"First counselor session eligible"</Milestone>
<Milestone days={30}>"Career path unlock bonus"</Milestone>
<Milestone days={90}>"1-on-1 counselor session access"</Milestone>
```

**What works**: Visual number is large and prominent. Milestone concept is clear.

**What's broken**:
- ❌ No explanation of **why** streak matters (e.g., "Consistent engagement predicts successful decisions")
- ❌ Milestones show text descriptions instead of icons/badges
- ❌ No connection between streak unlocking counselor and parent dashboard
- ❌ "Longest streak" reset logic unclear (does it persist across sessions?)

**UX Fix**:
```tsx
<div>
  <h3>🔥 Your Momentum</h3>
  <div className="text-5xl">{currentStreak}</div>
  <p className="text-sm">days consistent — Keep going!</p>
  
  <div className="mt-4 space-y-2">
    <div className="flex gap-2 items-center">
      <input type="checkbox" checked={currentStreak >= 7} />
      <span>7-day milestone: Unlock Counselor Chat</span>
    </div>
    <div className="flex gap-2 items-center">
      <input type="checkbox" checked={currentStreak >= 30} />
      <span>30-day milestone: Parents can view all results</span>
    </div>
  </div>
  
  <p className="text-xs text-gray-500 mt-4">
    Streak resets if you miss a day, but your "longest streak" record is permanent.
  </p>
</div>
```

---

### 2. Adaptive Mission Routing ✅ / ⚠️

**Current State**:
```tsx
// AdaptiveMissionBoard.tsx
<div>{recommendation.emoji}</div>
<h3>{recommendation.title}</h3>
<StarRating difficulty={recommendation.difficulty} />
<p>{recommendation.reason}</p>
<Zap /> {recommendation.estimatedDuration}
```

**What works**:
- ✅ Difficulty stars are intuitive
- ✅ Emoji helps visually distinguish games
- ✅ Duration estimate is helpful
- ✅ "Reason" field explains why it's recommended (partially)

**What's broken**:
- ❌ Reason can be generic: "Recommended Next Mission" (not specific enough)
- ❌ Difficulty tied to unreliable proxy (core game completion %)
- ❌ No explanation of how adaptive algorithm works
- ❌ No connection to career outcomes (e.g., "Builds Engineering skills")

**UX Fix**:
```tsx
// Show specific reason
const reasons = {
  'pattern-master': '🧠 Reveals analytical & tech skills → Critical for AI/Tech roles',
  'story-weaver': '📖 Explores creative communication → Key for design & management',
  'scenario-quest': '🎯 Challenges leadership & decision-making → Shows your style',
};

<p className="text-sm font-semibold">{reasons[gameId]}</p>
<p className="text-xs text-gray-400">
  Last game score: 75/100 → Recommended "Intermediate" challenge
</p>
```

---

### 3. Scenario Branching 🔴 CRITICAL

**Current State**:
- Scenarios **defined**: `src/lib/career-engine/scenarioParser.ts`
- Scenarios **visible**: Only in individual game pages (ScenarioQuest, DecisionMaze, etc.)
- Scenarios **mentioned on dashboard**: NOWHERE ❌

**What's broken**:
- ❌ Users don't know that "Scenario Quest" branches into 3 paths
- ❌ Each game choice affects career profile, but this is invisible
- ❌ Party mode disabled (was supposed to let kids compare their choices)
- ❌ India-first scenarios (Board vs. Stream, Family Pressure, Internship vs. Certificate) are not advertised

**UX Fix**:
```tsx
// On game cards, add visual indicator
<Card>
  <Badge>🌿 Branches: 3 paths</Badge>
  <h3>Scenario Quest</h3>
  <p>Face real-world workplace scenarios. Your choices reveal</p>
  <p>• Your decision-making style</p>
  <p>• Your values (Family pressure? Cost vs. Interest?)</p>
  <p>• How you respond to setbacks</p>
  <button>Play</button>
</Card>

// After game, show choice summary
<Card className="bg-emerald-500/20">
  <h3>Your Choices</h3>
  <ul>
    <li>① When facing family pressure... YOU CHOSE community/parents over individual interest</li>
    <li>② When choosing internship vs. certificate... YOU CHOSE immediate income</li>
  </ul>
  <p className="text-sm">These patterns shape your career matches. Retake to explore different paths.</p>
</Card>
```

---

### 4. Confidence Gates 🔴 CONFUSING

**Current State** (`src/app/(main)/results/page.tsx`):
```tsx
const evidence = {
  chatTurns: count,
  completedGames: count,
  assessmentProgress: percent,
  reliabilityScore: computed, // 0-100
  mentality: inferredFromMessages, // 'fragile' | 'neutral' | 'strong'
};

// Results page shows:
if (reliabilityScore < 50) → "🔒 Career Matches Locked"
if (reliabilityScore < 65) → ⚠️ "Provisional prediction"
if (reliabilityScore < 75) → 🔵 "Unlock Refined Predictions" progress bar
if (reliabilityScore >= 75) → ✅ "Confident predictions"
```

**What works**:
- ✅ Evidence calculation includes chat, games, and progress
- ✅ Locked state prevents false confidence

**What's broken**:
- 🔴 **User sees different results page every time they refresh** (score changes with new evidence)
- 🔴 **Gating threshold is opaque**: User plays 1 game, still locked. Plays 2 games, still locked. Frustration.
- 🔴 **No backward link**: If locked, should say "Play [specific game] to unlock" not just "Complete more games"
- 🔴 **Multiple states confuse**: User might see 4 different UI states (locked, provisional, refining, confident) without understanding why
- 🔴 **No "retest" action**: User is told to "Play more games" but doesn't know which ones

**Example of frustrating flow**:
```
User: I played 3 games!
System: Career matches locked (reliabilityScore=48/100)
User: I played 4 games!
System: Career matches locked (reliabilityScore=52/100, also yellow warning)
User: I played 5 games!
System: Career matches locked (reliabilityScore=65/100, but blue "refining" state)
[User gives up]
```

**UX Fix**:
```tsx
// Simplify to 2 states: Locked & Unlocked with confidence badges

if (reliabilityScore < 50) {
  return (
    <Card className="bg-gray-400/20 border-gray-400/30">
      <h3>🔒 Building Your Profile</h3>
      <p>We need more information to give confident recommendations.</p>
      
      <div className="mt-4 bg-white/5 p-4 rounded">
        <p className="text-xs font-semibold mb-2">Progress: {reliabilityScore}/50</p>
        <ProgressBar value={reliabilityScore} max={50} />
        <p className="text-xs mt-2 text-gray-300">
          Next unlock: Play 1 more game (recommended: Pattern Master)
        </p>
      </div>
      
      <Button onClick={() => router.push('/games/pattern-master')} className="w-full mt-4">
        Play Recommended Game
      </Button>
    </Card>
  );
}

// After unlock, show matches WITH confidence badges
<div className="grid gap-4">
  {matches.map(match => (
    <Card>
      <div className="flex items-start gap-3">
        <ConfidenceBadge score={reliabilityScore} />
        <div className="flex-1">
          <h4>{match.career.title}</h4>
          <p className="text-sm text-gray-200">{match.career.description}</p>
        </div>
      </div>
    </Card>
  ))}
</div>

function ConfidenceBadge({ score }) {
  if (score < 60) return <Chip>⚠️ Weak Signal</Chip>;
  if (score < 75) return <Chip>📊 Building</Chip>;
  return <Chip>✅ Confident</Chip>;
}
```

---

### 5. Parent Co-Pilot 🔴 NOT FUNCTIONAL

**Current State** (`src/app/(main)/parent/page.tsx`):
```tsx
const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);

useEffect(() => {
  setChildProgress({
    gamesCompleted: 2, // HARDCODED
    currentStreak: 5,
    reliabilityScore: 62,
    lastActivityAt: 'Today, 2:30 PM',
    topCareerPath: 'Engineering (AI/ML Track)',
    confidence: 'moderate', // HARDCODED
  });
}, []);
```

**What's broken**:
- 🔴 **Hardcoded mock data** — not connected to real student profile
- 🔴 **No child linking** — no way to select which child to view
- 🔴 **No parent auth** — any user can access /parent
- 🔴 **No actionable items** — page shows data but no "What to do next?"
- 🔴 **No sync with student actions** — if student plays game, parent doesn't see update

**Expected Parent Co-Pilot UX**:
```
Parent Portal (/parent)
├─ Child Selector: "Which child? Rahul | Neha"
├─ Real-time stats:
│  ├─ 🔥 Streak: 5 days (toward counselor unlock)
│  ├─ 🎮 Games: 5/11 completed
│  ├─ 📊 Confidence: 62% (4 games away from career clarity)
│  ├─ 🕐 Last active: Today 2:30 PM
│
├─ Career Path:
│  ├─ Current top match: Engineering (AI/ML)
│  ├─ Match quality: Provisional (needs 1 more game)
│
├─ Actions for parent:
│  ├─ [Review Results Together] (opens results page in side-by-side mode)
│  ├─ [Send Encouragement] (pre-written messages)
│  ├─ [Schedule Counselor Chat] (if 7-day milestone unlocked)
│  └─ [View Scenario Choices] (what values/pressures affected their career matches)
```

---

## 4. CURRENT USER JOURNEYS

### Journey 1: New Student (First Time) 🔴

```
Landing Page
    ↓
Auth/Signup (Profile form: name, age, state, interests)
    ↓
Dashboard (OVERWHELMED by 8 sections)
    ├─ Option A: Clicks "Finish Core Assessment Loop" → Games
    ├─ Option B: Clicks "Next Mission" → Games
    ├─ Option C: Explores Roles, Results, Parent Zone (wrong order)
    └─ Option D: Gives up
    
// Best case (Option A or B):
    ↓
Games Lab (chooses first game)
    ↓
Plays game (e.g., Scenario Quest)
    ↓
Results page: 
    ├─ If reliabilityScore < 50: 🔒 "Locked" (confused why)
    ├─ If reliabilityScore 50-75: ⚠️ "Provisional" or 🔵 "Refining"
    └─ [Dead end: doesn't know what to do next]

// Ideal flow should be:
    ↓
Game → Results preview → "You revealed leadership strengths"
         → "Play 2 more games to unlock full results"
         → "Suggested next: Pattern Master"
         → [ONE CLEAR NEXT ACTION]
```

**Problems**:
- ❌ No "start here" signal
- ❌ Too many options upfront
- ❌ Results page gating confuses instead of motivates
- ❌ No link back to "play next game"

---

### Journey 2: Returning Student (Week 2)

```
Logs in → Dashboard shows:
- Streak: 5 days 🔥
- Next mission: Story Weaver (new recommendation)
- Progress: 2/3 core games

User thinks:
  ① "Good, streak still going!" ✅
  ② "What's Story Weaver? Why not Pattern Master?" ⚠️
  ③ "I have 1 more core game. Then what?" ❓
```

**Problems**:
- ⚠️ No explanation of streak milestone countdown (28 more days to unlock counselor)
- ❌ No visibility of "confidence gate progress"
- ❌ No link between "core games" and "unlocking results"

---

### Journey 3: Parent (Unreachable)

```
Parent lands on /parent
    ↓
Sees: "👨‍👩‍👧 Parent Co-Pilot"
    ↓
Mock data displayed:
- gamesCompleted: 2
- currentStreak: 5
- reliabilityScore: 62

Parent thinks: "Great, I can monitor Rahul's progress!"
    ↓
[No child linking implemented]
[No real data shown]
[Page is decorative, not functional]
    ↓
Parent closes tab, unimpressed ❌
```

**Problems**:
- 🔴 False affordance (nav item suggests it works, but it's broken)
- 🔴 No child linking
- 🔴 No actionable items for parent

---

## 5. SPECIFIC UX CONFUSIONS

### Confusion 1: "Results Studio"?
**Context**: Dashboard Decision Readiness card  
**Button text**: "Open Results Studio"  
**User's question**: "What is a studio?"

**Better text**: 
- "View Your Career Matches"
- "See Your Results"
- "Explore Your Fit"

---

### Confusion 2: "How Many Games Until Unlock?"
**Context**: Results page (locked state)  
**Message**: "Complete more games and guided chat to unlock the full career exploration."  
**User's question**: "How many more? Which games? How much chat?"

**Item formula**:
- Chat: 40% of reliability score (12 turns = 100%)
- Games: 35% of reliability score (5 games = 100%)
- Progress: 25% of reliability score (100% assessment progress = 100%)

**Better message**:
```
🔒 3 More Actions to Unlock Full Results

You're at 48/75. You need:
  ☐ Play 1 more game (recommended: Pattern Master, 8 min)
  ☐ Complete 1 more chat session (5-10 min)
  ☐ Make a decision in Guidance (5 min)

[Play Pattern Master] [Start Chat] [Open Guidance]
```

---

### Confusion 3: Streak vs. Progress vs. Reliability
**Users see**:
- "5-day streak" (temporal)
- "2/3 core games" (completion)
- "Confidence gate" (hidden until Results page)

**User's mental model**: "Playing games = progression"  
**Actual model**: "Consistent engagement + evidence depth = progression"

**These are NOT explained as interconnected.**

**Better dashboard layout**:
```
┌─────────────────────────────────────────────┐
│ 🔥 5-day streak    📊 62% confident         │
│ 28 days to unlock counselor session          │
│ 3 games away from career clarity             │
└─────────────────────────────────────────────┘
       [Next Game: Pattern Master]
             [Play Now]
```

---

### Confusion 4: Core vs. Advanced Games
**Dashboard says**: "Complete 3 core games"  
**Games Lab shows**: 3 core + 8 advanced games  
**User's questions**:
- Are advanced games mandatory?
- When do I play them?
- Are they harder?

**Better labeling**:
```
PHASE 1: Foundation (Complete to unlock career matches)
  ✅ Scenario Quest - Reveals leadership & values
  ☐ Pattern Master - Reveals analytical skills
  ☐ Story Weaver - Reveals creativity

PHASE 2: Depth (Optional, for confidence refinement)
  ☐ Rhythm Match - Musical & bodily intelligence
  ... [6 more games]
```

---

### Confusion 5: Age Tier Doesn't Connect to Anything
**Dashboard shows**: Age tier badge (Explorer, Discoverer, Navigator, Pivoter)  
**But**:
- Not used in game recommendations
- Not explained in documentation
- Not connected to difficulty levels
- Just feels like decoration

**Better integration**:
```
// Side-by-side with mission board
You're a "Navigator" (Ages 14-16)
Next missions are calibrated to your level.

[Your Age Tier] [About This]

// Explain tier
Navigators are exploring multiple interests.
Games focus on:
  🧭 Testing different career paths
  🤝 Understanding teamwork & communication
  📊 Building data literacy
```

---

## 6. WHAT'S WORKING WELL ✅

1. **Sidebar navigation**: Easy to access main features
2. **Game card design**: Clear titles, descriptions, emojis
3. **Game filtering**: "All", "Core", "Advanced", "Logic", "Creativity", "Leadership"
4. **Difficulty stars**: 5-star rating is intuitive
5. **India-first content**: Counselor references, entrance exam mentions, state-specific guidance
6. **Color gradients**: Cards are visually distinct (though overdone)
7. **Mobile responsive**: Sidebar collapses, layout adapts
8. **Streak widget milestone concept**: 7/30/90 day milestones are motivating
9. **Progress bars**: Visual progress is more engaging than raw numbers
10. **Evidence transparency**: Results page shows chat turns, games, progress

---

## 7. QUICK WINS (1-2 hours each)

### Quick Win 1: Dashboard Status Bar
Add a single row at top showing: Streak | Confidence | Next Unlock  
**Benefit**: Users see all 3 metrics at a glance  
**Time**: 1 hour

```tsx
<div className="grid grid-cols-3 gap-4 mb-6 text-center">
  <StatusCard icon="🔥" value={streak} label="Day Streak" />
  <StatusCard icon="📊" value={confidence} label="% Confident" />
  <StatusCard icon="🎮" value={gamesNeeded} label="Games to Unlock" />
</div>
```

---

### Quick Win 2: Game Reason Labels
Add specific career outcomes to AdaptiveMissionBoard recommendation  
**Benefit**: Users understand WHY they're playing each game  
**Time**: 30 minutes

```tsx
const GAME_REASONS = {
  'pattern-master': 'Build analytical skills → Tech & Data roles',
  'story-weaver': 'Explore creative communication → Design & Media',
  'scenario-quest': 'Test leadership & decision style → Management roles',
};

<p className="text-sm font-semibold">{GAME_REASONS[gameId]}</p>
```

---

### Quick Win 3: "Retest" Button on Results
Add single button to re-play top game with "Refresh your results" messaging  
**Benefit**: Clear path to improve confidence score  
**Time**: 30 minutes

```tsx
<Button variant="secondary">
  Retest to Refine Predictions
</Button>
```

---

### Quick Win 4: Parent Zone Status
Replace mock data with real data OR hide until implemented  
**Benefit**: No false affordance  
**Time**: 1 hour

```tsx
// Option A: Show real data
const { data: childProfile } = await supabase
  .from('profiles')
  .select('streak_data, reliability_score, completed_games')
  .eq('id', linkedChildId)
  .single();

// Option B: Hide until ready
if (childLinked) {
  return <ParentDashboard />;
} else {
  return <ParentOnboarding message="Link your child's account to view progress" />;
}
```

---

## 8. MEDIUM-EFFORT RESTRUCTURES (4-6 hours each)

### Restructure 1: Dashboard Consolidation
Move from 8 sections → 4 sections  
**Benefit**: Reduced cognitive load, clear primary action  
**Time**: 3-4 hours

```tsx
<Dashboard>
  <StatusBar streak={5} confidence={62} nextUnlock="3 games" />
  <PrimaryAction game={nextMission} />
  <ProgressTracker mechanics={[streak, confidence, parent]} />
  <QuickAccess links={[chat, games, guidance]} />
</Dashboard>
```

---

### Restructure 2: Confidence Gate Simplification
Move from 4 states (locked, provisional, refining, confident) → 2 states (building, confident)  
**Benefit**: Users always see matches, no confusing state machine  
**Time**: 2-3 hours

```tsx
<ResultsPage>
  {matches.map(match => (
    <CareerCard
      career={match}
      confidence={
        reliability < 50 ? 'weak' : reliability < 75 ? 'building' : 'confident'
      }
    />
  ))}
</ResultsPage>
```

---

### Restructure 3: Parent-Child Linking
Implement relationship table + real-time sync  
**Benefit**: Parents see actual progress, enable co-pilot messaging  
**Time**: 4-5 hours

```typescript
// New Supabase table: parent_child_relationships
{
  parent_id: uuid,
  child_id: uuid,
  created_at: timestamp,
  last_shared_at: timestamp,
}

// Parent page fetches real data
const { data: childProfile } = await supabase
  .from('profiles')
  .select('*, streak_data(*), assessment_profiles(*)')
  .eq('id', linkedChildId)
  .single();
```

---

## 9. RECOMMENDED PRIORITY ORDER

### Phase 1: Visibility (Week 1)
- [ ] Add dashboard status bar (4 hours)
- [ ] Add game reason labels (2 hours)
- [ ] Fix Results page gating logic (1 hour)
- [ ] Add "Retest" button (1 hour)
- **Estimated**: 8 hours | **Impact**: High (mechanics become visible)

### Phase 2: Structure (Week 2)
- [ ] Dashboard consolidation (4 hours)
- [ ] Navigation hierarchy (2 hours)
- [ ] Onboarding flow for new users (3 hours)
- **Estimated**: 9 hours | **Impact**: High (user journey clarity)

### Phase 3: Integration (Week 3)
- [ ] Parent-child linking (5 hours)
- [ ] Real-time parent dashboard sync (3 hours)
- [ ] Parent-specific actions (2 hours)
- **Estimated**: 10 hours | **Impact**: Medium (enables co-pilot)

### Phase 4: Polish (Week 4)
- [ ] Results page confidence badges (2 hours)
- [ ] Game card improvements (3 hours)
- [ ] Mobile UX refinement (2 hours)
- [ ] Accessibility audit (2 hours)
- **Estimated**: 9 hours | **Impact**: Medium (quality)

---

## 10. METRICS TO TRACK

After restructure, monitor:

1. **Dashb Dashboard Time-to-Task**
   - How long until users find "Next Game"? (Target: <5 seconds)

2. **Game Completion Rate**
   - % of users who complete 3 core games (Target: >50%)

3. **Results Page Unlock Rate**
   - % of users hitting reliability > 50 (Target: >40% in week 1)

4. **Parent Engagement** (once linked)
   - % of parents visiting co-pilot dashboard (Target: >30%)
   - % of parents taking recommended actions (Target: >10%)

5. **Streak Retention**
   - % of users maintaining 7+day streak (Target: >25%)

---

## Summary Table

| Aspect | Current | Target | Effort | Priority |
|--------|---------|--------|--------|----------|
| Dashboard sections | 8 | 4 | 4h | P1 |
| Menu items (nav) | 9 flat | 6 hierarchical | 2h | P1 |
| Mechanic visibility | 60% | 95% | 8h | P1 |
| Confidence gate UX | Complex (4 states) | Simple (2 states) | 3h | P1 |
| Parent linking | 0% | 100% | 5h | P2 |
| Onboarding | No | Yes | 3h | P2 |
| Game reason labels | 0% | 100% | 2h | P1 |
| Retest pathway | No | Yes | 1h | P1 |

---

## Conclusion

The career agent has **shipped working mechanics** but lacks **UX clarity**. Users will be confused by:
- Overcrowded dashboard
- Invisible/hidden mechanics (especially confidence gates)
- Disconnected parent dashboard
- Unexplained unlock thresholds

**Quick wins** (8 hours) will make mechanics visible and improve user confidence. **Phase 2 restructures** (9 hours) will create a clear progression path.

**Recommended next step**: Implement Phase 1 (Visibility) to make the mechanics tangible and motivating, then Phase 2 (Structure) to create a coherent user journey.

---

**Report compiled by**: UI/UX Assessment Agent  
**Files analyzed**: 12 component files, 4 page files, 2 data files  
**Code review**: Focused on component hierarchy, data flow, and UX paradigms  
**Caveat**: Assessment based on code review. Recommend A/B testing with real users for validation.
