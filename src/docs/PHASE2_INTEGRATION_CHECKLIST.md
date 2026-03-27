/**
 * ═══════════════════════════════════════════════════════════════
 * PHASE 2 INTEGRATION CHECKLIST
 * Wire Evidence Persistence into API Routes
 * ═══════════════════════════════════════════════════════════════
 * 
 * This document maps exactly which API routes need changes and
 * which persistence functions to wire in. Use as integration guide.
 */

// ─────────────────────────────────────────────────────────────
// ROUTE 1: /src/app/api/career/match/route.ts
// ─────────────────────────────────────────────────────────────
// File: POST /api/career/match
// Purpose: Match careers to student profile
//
// INTEGRATION TASKS:
//
// Task 1.1: Initialize Session
// ├─ At start of POST handler
// ├─ Call: const session = await getOrCreateCounselingSession(supabase, userId, ageTier, language)
// ├─ Usage: Ensures evidence_log entries have valid session_id
// └─ Impact: Creates session record if not exists
//
// Task 1.2: Log Assessment Signals
// ├─ After RIASEC/Gardner/Big Five extraction from counselingContext
// ├─ Call: await logAssessmentEvidence(supabase, userId, sessionId, 'riasec', 'extroversion', 75.0)
// ├─ Repeat: For each assessed dimension
// ├─ Functions: logAssessmentEvidence(), logGameEvidence(), logConstraintEvidence()
// └─ Impact: Populates evidence_log table
//
// Task 1.3: Log Game Signals
// ├─ After game results extraction
// ├─ Call: await logGameEvidence(supabase, userId, sessionId, 'pattern-master', 85, 'logical-reasoning', 0.15)
// ├─ Usage: gameId, score, careerDimension, maxWeight from games.ts
// └─ Impact: Enforces weight cap (games never exceed 15%)
//
// Task 1.4: Capture Constraints
// ├─ After family context extraction
// ├─ Call: await saveConstraintProfile(supabase, userId, { affordability_level: 'medium', location_flexibility: true, ... })
// └─ Impact: Populates constraint_profiles table for explainability
//
// Task 1.5: Check Unresolved Contradictions
// ├─ Before stage gate validation
// ├─ Call: const unresolvedContradictions = await getUnresolvedContradictions(supabase, sessionId)
// ├─ Usage: Block recommendation stage if high-severity contradictions remain
// └─ Impact: Feeds into stageGates blocking logic (already implemented)
//
// Task 1.6: Add Evidence Summary to Response
// ├─ Before returning ranked careers
// ├─ Call: const summary = await getEvidenceSummary(supabase, sessionId)
// ├─ Usage: Include in response for Phase 4 explainability
// └─ Response field: evidence_summary { evidence_count, by_source: {...}, quality_score: 0.75 }
//
// CURRENT STATE: Route exists & validates stage gates. No evidence logging wired yet.
// PRIORITY: HIGH - Core signal capture
// ESTIMATED: 30 minutes


// ─────────────────────────────────────────────────────────────
// ROUTE 2: /src/app/api/chat/route.ts
// ─────────────────────────────────────────────────────────────
// File: POST /api/chat
// Purpose: Conversational counseling with contradiction detection
//
// INTEGRATION TASKS:
//
// Task 2.1: Initialize Session
// ├─ At start of POST handler
// ├─ Call: const session = await getOrCreateCounselingSession(supabase, userId, ageTier, language)
// └─ Usage: Ensures chat evidence goes to same session
//
// Task 2.2: Log Chat Evidence After Extraction
// ├─ After counselor identifies career signals in conversation
// ├─ Call: await logEvidence(supabase, userId, sessionId, { source: 'chat', signal: 'Student loves coding', weight: 0.05, ... })
// ├─ Signal extraction: Career interest, constraint revelation, role understanding
// └─ IMPORTANT: Chat signals capped at 40% total (primary source weight)
//
// Task 2.3: Log Contradictions When Detected
// ├─ After detectContradictions() identifies conflict (ALREADY IMPLEMENTED in code)
// ├─ Call: await logContradiction(supabase, userId, sessionId, contradiction)
// ├─ Contradictions already detected in system prompt via reprobes
// └─ IMPORTANT: Log for audit trail and explainability
//
// Task 2.4: Resolve Contradiction After Reprobe
// ├─ After counselor successfully addresses conflict
// ├─ Call: await resolveContradiction(supabase, contradictionId, 'Student clarified priorities')
// └─ Usage: Marks contradiction as resolved with resolution_move context
//
// Task 2.5: Log Constraint Revelation
// ├─ When student mentions affordability, location, family, language barriers
// ├─ Call: await logConstraintEvidence(supabase, userId, sessionId, 'affordability', 'medium') 
// └─ Usage: Progressive constraint capture during conversation
//
// CURRENT STATE: Contradiction detection implemented in system prompt. No logging wired.
// PRIORITY: MEDIUM - Builds audit trail for explainability
// ESTIMATED: 20 minutes


// ─────────────────────────────────────────────────────────────
// ROUTE 3: /src/app/api/assessment/[assessmentType]/complete/route.ts
// ─────────────────────────────────────────────────────────────
// File: POST /api/assessment/riasec/complete (and gardner, big-five)
// Purpose: Log assessment completions
//
// INTEGRATION TASKS:
//
// Task 3.1: Initialize Session
// ├─ At start of POST handler
// └─ Call: const session = await getOrCreateCounselingSession(supabase, userId, ageTier, language)
//
// Task 3.2: Log Each Dimension Score
// ├─ After calculating RIASEC dimension scores
// ├─ Call: await logAssessmentEvidence(supabase, userId, sessionId, 'riasec', 'realistic', 78.5)
// ├─ Repeat for all 6 RIASEC dimensions
// ├─ Similar for Gardner (8 intelligences) and Big Five (5 traits)
// └─ Usage: Complete evidence trail for assessment completions
//
// CURRENT STATE: Assessment routes exist but no evidence logging
// PRIORITY: HIGH - Need to track assessment completion for stage gates
// ESTIMATED: 15 minutes


// ─────────────────────────────────────────────────────────────
// ROUTE 4: /src/app/api/games/[gameId]/submit/route.ts (if exists)
// ─────────────────────────────────────────────────────────────
// File: POST /api/games/pattern-master/submit
// Purpose: Log game results
//
// INTEGRATION TASKS:
//
// Task 4.1: Initialize Session
// └─ Call: const session = await getOrCreateCounselingSession(supabase, userId, ageTier, language)
//
// Task 4.2: Log Game Score with Weight Enforcement
// ├─ After calculating game score
// ├─ Call: await logGameEvidence(supabase, userId, sessionId, gameId, score, 'career-dimension', 0.15)
// ├─ Weight capped at 0.15 (15%) per games.ts
// └─ Usage: Enforces guardrail that games never exceed 15% total influence
//
// CURRENT STATE: Check if game submission route exists
// PRIORITY: MEDIUM - Not blocking but needed for evidence completeness
// ESTIMATED: 10 minutes


// ─────────────────────────────────────────────────────────────
// ROUTE 5: /src/app/api/roles/[roleId]/depth-test/submit/route.ts (if exists)
// ─────────────────────────────────────────────────────────────
// File: POST /api/roles/software-engineer/depth-test/submit
// Purpose: Log role understanding test results
//
// INTEGRATION TASKS:
//
// Task 5.1: Initialize Session
// └─ Call: const session = await getOrCreateCounselingSession(supabase, userId, ageTier, language)
//
// Task 5.2: Log Role Depth Test
// ├─ After scoring role understanding test
// ├─ Call: await logRoleDepthTestEvidence(supabase, userId, sessionId, roleId, 'beginner', { misconceptions: 2 })
// ├─ depthLevel: 'beginner' | 'intermediate' | 'advanced'
// └─ Usage: Validates career understanding before recommendation
//
// CURRENT STATE: Check if role test route exists
// PRIORITY: LOW - Nice to have but not blocking
// ESTIMATED: 10 minutes


// ─────────────────────────────────────────────────────────────
// MIGRATION EXECUTION (One-time setup)
// ─────────────────────────────────────────────────────────────
// File: supabase/migrations/009_evidence_model.sql
//
// Steps:
// 1. Copy entire SQL file content
// 2. Go to Supabase dashboard → SQL Editor
// 3. New query → Paste & Execute
// 4. View tables in Data Browser to verify creation
// 5. Check RLS policies in Authentication → Policies
//
// Verification:
// ├─ evidence_log table created with 10 columns
// ├─ contradictions table created with 9 columns
// ├─ constraint_profiles table created with 9 columns
// ├─ counseling_sessions table created with 12 columns
// ├─ All tables have RLS enabled
// └─ Helper functions: calculate_evidence_quality_score, get_evidence_summary
//
// PRIORITY: CRITICAL - Must run before any logging
// ESTIMATED: 5 minutes (execution)


// ─────────────────────────────────────────────────────────────
// NEW IMPORTS NEEDED (Add to route files)
// ─────────────────────────────────────────────────────────────
//
// In /src/app/api/career/match/route.ts:
// ├─ import { getOrCreateCounselingSession, logAssessmentEvidence, logGameEvidence, logConstraintEvidence, getUnresolvedContradictions, getEvidenceSummary, saveConstraintProfile } from '@/lib/supabase/evidencePersistence';
// └─ import { aggregateCareerEvidence } from '@/lib/supabase/evidenceAggregation';
//
// In /src/app/api/chat/route.ts:
// ├─ import { getOrCreateCounselingSession, logEvidence, logContradiction, resolveContradiction, logConstraintEvidence } from '@/lib/supabase/evidencePersistence';
// └─ No changes to detectContradictions import (already there from Phase 1)
//
// In assessment routes:
// ├─ import { getOrCreateCounselingSession, logAssessmentEvidence } from '@/lib/supabase/evidencePersistence';
// └─ Pattern: getOrCreateCounselingSession() at start, then log each dimension
//
// In game routes (if exist):
// ├─ import { getOrCreateCounselingSession, logGameEvidence } from '@/lib/supabase/evidencePersistence';
// └─ Always use logGameEvidence() NOT logEvidence() to enforce weight caps


// ─────────────────────────────────────────────────────────────
// TESTING CHECKLIST (After each route integration)
// ─────────────────────────────────────────────────────────────
//
// For each integrated route:
// ├─ ✅ No TypeScript compilation errors
// ├─ ✅ Route starts HTTP server without errors
// ├─ ✅ Call route with test payload
// ├─ ✅ Check Supabase dashboard → evidence_log table → New rows appear
// ├─ ✅ Check counseling_sessions table → Session created/updated
// ├─ ✅ Verify row count increases after each call
// ├─ ✅ Response still returns expected fields (backward compatibility)
// └─ ✅ RLS prevents other users from seeing data
//
// For all routes combined:
// ├─ ✅ Run full counseling flow: chat → assessment → game → match
// ├─ ✅ Verify all evidence_log rows have correct session_id
// ├─ ✅ Verify source diversity (chat, assessment, game entries)
// ├─ ✅ Check getEvidenceSummary returns correct counts
// └─ ✅ Optional: Run evidence aggregation for top career to verify explainability data


// ─────────────────────────────────────────────────────────────
// SUMMARY: INTEGRATION ROADMAP
// ─────────────────────────────────────────────────────────────
//
// Total Routes to Update: 5
// ├─ Route 1: /api/career/match → Task 1.1-1.6 (HIGH priority)
// ├─ Route 2: /api/chat → Task 2.1-2.5 (MEDIUM priority)
// ├─ Route 3: /api/assessment/*/complete → Task 3.1-3.2 (HIGH priority)
// ├─ Route 4: /api/games/*/submit → Task 4.1-4.2 (MEDIUM priority)
// └─ Route 5: /api/roles/*/depth-test → Task 5.1-5.2 (LOW priority)
//
// Estimated Total Time: 1.5-2 hours
// ├─ Migration execution: 5 minutes
// ├─ Route 1 integration: 30 minutes
// ├─ Route 2 integration: 20 minutes
// ├─ Route 3 integration: 15 minutes
// ├─ Route 4-5 integration: 20 minutes
// └─ Testing & verification: 20 minutes
//
// BLOCKING: None - All persistence functions ready, schema created, routes exist
// NEXT PHASE: Phase 3 (Engine split) can begin after Phase 2 integration complete
