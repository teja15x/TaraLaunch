/**
 * ═══════════════════════════════════════════════════════════════
 * PHASE 2 INTEGRATION: STEP-BY-STEP EXECUTION GUIDE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Follow these steps sequentially. Each step builds on the previous.
 * Estimated total time: 1.5-2 hours
 * 
 * DO NOT skip steps. Test after each step before moving to the next.
 */

# PHASE 2 INTEGRATION: STEP-BY-STEP

## ✅ PRE-FLIGHT CHECK

Before starting, verify:
- [ ] You have Supabase project access
- [ ] You have VS Code open with career-agent workspace
- [ ] You have database shell/SQL editor ready
- [ ] Terminal available for Node.js testing

---

## STEP 1: Execute Database Migration (5 minutes)
**Goal**: Create 4 new tables in Supabase

### 1.1 Open Supabase SQL Editor
1. Go to Supabase dashboard → Your project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query** (top right)

### 1.2 Copy Migration SQL
1. Open file: `supabase/migrations/009_evidence_model.sql` in VS Code
2. Select **ALL** content (Ctrl+A)
3. Copy (Ctrl+C)

### 1.3 Execute Migration
1. Paste into Supabase SQL Editor
2. Click **Run** (or Cmd+Enter)
3. Wait for success message

### 1.4 Verify Tables Created
1. Go to Supabase **Data Browser** (left sidebar)
2. Expand tables list
3. Verify these 4 tables exist:
   - ✅ `evidence_log`
   - ✅ `contradictions`
   - ✅ `constraint_profiles`
   - ✅ `counseling_sessions`

### 1.5 Check RLS Policies
1. Go to **Authentication** → **Policies** (left sidebar)
2. Select table: `evidence_log`
3. Verify 3 policies exist:
   - ✅ Users can SELECT own data
   - ✅ Users can INSERT own data
   - ✅ Users can UPDATE own data
4. Repeat for other 3 tables

**Status**: ✅ COMPLETE if all 4 tables + RLS policies visible

---

## STEP 2: Test Persistence Functions Compile (5 minutes)
**Goal**: Verify no TypeScript errors in persistence layer

### 2.1 Open Terminal
1. Press Ctrl+` (backtick) to open integrated terminal
2. Navigate to workspace: `cd c:\Users\teja1\Downloads\career-agent--main\ (1)\career-agent--main`

### 2.2 Run TypeScript Compiler Check
```bash
npx tsc --noEmit
```

### 2.3 Verify No Errors
- Look for lines with `error TS`
- If found, something is wrong. Contact me.
- If none, proceed to STEP 3

**Status**: ✅ COMPLETE if compiler clean

---

## STEP 3: Integrate /api/career/match Route (30 minutes)
**Goal**: Wire evidence logging into match endpoint

### 3.1 Open Route File
- File: `src/app/api/career/match/route.ts`

### 3.2 Add Imports (Top of file)
Add these imports after existing imports:
```typescript
import { 
  getOrCreateCounselingSession,
  logAssessmentEvidence,
  logGameEvidence,
  logConstraintEvidence,
  getUnresolvedContradictions,
  getEvidenceSummary,
  saveConstraintProfile
} from '@/lib/supabase/evidencePersistence';
```

### 3.3 Initialize Session (At start of POST handler)
After extracting userId, add:
```typescript
// Initialize or retrieve counseling session
const session = await getOrCreateCounselingSession(
  supabase,
  userId,
  counselingContext.ageTier || 'teen',  // Extract from context
  counselingContext.language || 'en'    // Extract from context
);
```

### 3.4 Log Assessment Evidence
After extracting RIASEC/Gardner/Big Five scores, add:
```typescript
// Log assessment evidence if available
if (counselingContext.riasecResults) {
  for (const [dimension, score] of Object.entries(counselingContext.riasecResults)) {
    await logAssessmentEvidence(
      supabase,
      userId,
      session.id,
      'riasec',
      dimension,
      score as number
    );
  }
}
```

### 3.5 Log Game Evidence
After extracting game results, add:
```typescript
// Log game evidence if available
if (counselingContext.gameScores && Array.isArray(counselingContext.gameScores)) {
  for (const gameResult of counselingContext.gameScores) {
    const GameDefinition = games.find(g => g.id === gameResult.gameId);
    if (GameDefinition) {
      await logGameEvidence(
        supabase,
        userId,
        session.id,
        gameResult.gameId,
        gameResult.score,
        'career-fit',  // Dimension
        GameDefinition.max_evidence_weight || 0.15
      );
    }
  }
}
```

### 3.6 Save Constraint Profile
Before returning response, add:
```typescript
// Save student constraints
if (counselingContext.constraints) {
  await saveConstraintProfile(
    supabase,
    userId,
    counselingContext.constraints
  );
}
```

### 3.7 Add Evidence Summary to Response
Before returning ranked careers, add:
```typescript
// Get evidence summary for explainability
const evidenceSummary = await getEvidenceSummary(supabase, session.id);
```

Then in the response, add field:
```typescript
return NextResponse.json({
  rankedCareers: careers,
  stageGateStatus: { ... }, // Existing
  // NEW FIELD:
  evidenceSummary: evidenceSummary || {},
  // END NEW
});
```

### 3.8 Test Route
1. Start dev server: `npm run dev`
2. Call the route with test payload (use Postman or curl)
3. Check response includes `evidenceSummary`
4. Check Supabase Data Browser → `evidence_log` table → New rows appear

**Status**: ✅ COMPLETE if evidence logged to DB

---

## STEP 4: Integrate /api/chat Route (20 minutes)
**Goal**: Wire contradiction logging into chat endpoint

### 4.1 Open Route File
- File: `src/app/api/chat/route.ts`

### 4.2 Add Imports (Top of file)
```typescript
import { 
  getOrCreateCounselingSession,
  logEvidence,
  logContradiction,
  resolveContradiction,
  logConstraintEvidence
} from '@/lib/supabase/evidencePersistence';
```

### 4.3 Initialize Session (At start of POST handler)
```typescript
// Initialize counseling session
const session = await getOrCreateCounselingSession(
  supabase,
  userId,
  ageTier || 'teen',
  language || 'en'
);
```

### 4.4 Log Chat Signals
After counselor extracts career signal from message, add:
```typescript
// Log chat evidence when signal detected
if (detectedSignal) {  // Your existing signal detection logic
  await logEvidence(
    supabase,
    userId,
    session.id,
    {
      source: 'chat',
      signal: detectedSignal.text,
      weight: 0.03,  // Chat signals are smaller weight
      career_dimension: 'general-interest'
    }
  );
}
```

### 4.5 Log Contradictions Detected
After detectContradictions() call, add:
```typescript
// Log detected contradictions
const detectedContradictions = detectContradictions(newMessage, previousMessages);
for (const contradiction of detectedContradictions) {
  await logContradiction(
    supabase,
    userId,
    session.id,
    contradiction
  );
}
```

### 4.6 Test Route
1. Dev server still running
2. Call chat endpoint with test message
3. Check Supabase → `evidence_log` table → "chat" source rows appear
4. Check `contradictions` table → New rows if contradictions detected

**Status**: ✅ COMPLETE if chat signals logged

---

## STEP 5: Integrate Assessment Routes (15 minutes)
**Goal**: Wire evidence logging into assessment completion endpoints

### 5.1 Find Assessment Routes
- Files location: `src/app/api/assessment/`
- Look for completion routes, e.g.:
  - `src/app/api/assessment/riasec/complete/route.ts`
  - `src/app/api/assessment/gardner/complete/route.ts`
  - `src/app/api/assessment/big-five/complete/route.ts`

### 5.2 For Each Assessment Route
Repeat pattern for each:

#### 5.2.1 Add Imports
```typescript
import { 
  getOrCreateCounselingSession,
  logAssessmentEvidence
} from '@/lib/supabase/evidencePersistence';
```

#### 5.2.2 Initialize Session
```typescript
const session = await getOrCreateCounselingSession(
  supabase,
  userId,
  ageTier || 'teen',
  language || 'en'
);
```

#### 5.2.3 Log Each Dimension
After calculating scores:
```typescript
// Log RIASEC dimensions
const dimensions = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
for (const dim of dimensions) {
  await logAssessmentEvidence(
    supabase,
    userId,
    session.id,
    'riasec',
    dim,
    results[dim]  // Your dimension score
  );
}
```

### 5.3 Test Assessment Routes
1. Complete one assessment (e.g., RIASEC)
2. Check Supabase → `evidence_log` table → 6 RIASEC dimension rows appear
3. Verify `source` = "assessment"
4. Verify `career_dimension` matches each dimension

**Status**: ✅ COMPLETE if all assessment routes logging

---

## STEP 6: Integration Test (20 minutes)
**Goal**: Full flow test - chat → assessment → match

### 6.1 Run Full Counseling Flow
1. Start with fresh browser session
2. User enters chat → Types a career interest
3. Verify evidence_log shows "chat" entry
4. Complete one assessment (RIASEC)
5. Verify evidence_log shows 6 "assessment" entries
6. Call match endpoint
7. Verify evidence_summary returns non-empty

### 6.2 Check Data Consistency
1. Go to Supabase Data Browser
2. Open `evidence_log` table
3. Verify: All rows have same `session_id`
4. Verify: All rows have correct `user_id`
5. Verify: All rows have `source` populated
6. Verify: Timestamp fields populated

### 6.3 Verify Quality Metrics
1. Supabase SQL Editor → New Query:
```sql
SELECT 
  session_id,
  COUNT(*) as total_evidence,
  COUNT(DISTINCT source) as source_count
FROM evidence_log
WHERE user_id = '<test-user-id>'
GROUP BY session_id;
```
2. Run query
3. Verify counts look reasonable (e.g., 1 chat + 6 assessment = 7 total)

**Status**: ✅ COMPLETE if full flow working

---

## STEP 7: Cleanup & Documentation (10 minutes)
**Goal**: Prepare for Phase 3

### 7.1 Verify No Errors
1. Stop dev server
2. Run: `npx tsc --noEmit`
3. Verify clean compilation

### 7.2 Document Current State
Update `src/docs/PHASE2_INTEGRATION_CHECKLIST.md`:
- [ ] Mark "Execute migration" as COMPLETE
- [ ] Mark "Wire persistence into /api/career/match" as COMPLETE
- [ ] Mark "Wire persistence into /api/chat" as COMPLETE
- [ ] Mark "Wire persistence into /api/assessment routes" as COMPLETE
- [ ] Mark "Test full evidence logging flow" as COMPLETE

### 7.3 Ready for Phase 3?
Now you can decide:
- **Option A**: Proceed to Phase 3 (Engine Split)
- **Option B**: Optional - Wire game/role test routes (low priority)

**Status**: ✅ COMPLETE if ready for Phase 3

---

## 📊 PROGRESS TRACKING

```
PHASE 2 INTEGRATION CHECKLIST
┌─────────────────────────────────────────┐
│ STEP 1: Execute Migration         [ ]   │
│ STEP 2: Verify Compilation        [ ]   │
│ STEP 3: Integrate /api/match      [ ]   │
│ STEP 4: Integrate /api/chat       [ ]   │
│ STEP 5: Integrate /api/assessment [ ]   │
│ STEP 6: Full Flow Test            [ ]   │
│ STEP 7: Cleanup                   [ ]   │
└─────────────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Migration failed in Supabase"
**Solution**: 
1. Check error message in SQL editor
2. Likely cause: Table already exists
3. Fix: Either drop table first OR use `CREATE TABLE IF NOT EXISTS` (already in migration)
4. Contact me with error text

### Issue: "TypeScript compilation error after adding imports"
**Solution**:
1. Check spelling of import path
2. Verify file exists: `src/lib/supabase/evidencePersistence.ts`
3. Verify exports are listed in that file
4. Run: `npm install` (in case types are missing)

### Issue: "Evidence not logging to DB after calling route"
**Solution**:
1. Check Supabase authentication (user_id correct?)
2. Check session_id is not null
3. Check RLS policy allows INSERT for your user
4. Add console.log() before & after logEvidence() for debugging
5. Contact me with details

### Issue: "Response doesn't include evidenceSummary field"
**Solution**:
1. Check you added the field to response JSON
2. Check getEvidenceSummary() didn't error
3. Add try-catch around evidence retrieval
4. Fall back to empty object if error

---

## ✅ DONE WHEN...

Phase 2 Integration is complete when:
- [x] 4 new tables visible in Supabase Data Browser
- [x] RLS policies enabled on all tables
- [x] TypeScript compilation clean
- [x] /api/match route logs evidence
- [x] /api/chat route logs contradictions
- [x] /api/assessment routes log dimension scores
- [x] Full counseling flow works end-to-end
- [x] Evidence visible in Supabase DB
- [x] No production errors on any route

---

## NEXT: PHASE 3

Once Phase 2 Integration complete, we move to:
**Phase 3 - Engine Split**: Separate HypothesisEngine (early stages) from RecommendationEngine (recommendation stage)

Ready to proceed? Say "**step 1**" when you want to start.
