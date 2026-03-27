# Game-Integrated Evaluation System 🎮

## Overview
The evaluation process is now **interactive and game-driven**. Instead of a one-shot matching, Career Buddy guides users through a journey where games reveal hidden strengths and improve career recommendations.

---

## Three-Tier Evaluation Architecture

### Tier 1: Adaptive Matching (Initial Assessment)
**Endpoint**: `POST /api/career/match` with `mode=adaptive`

**What it does:**
1. Calculate initial career matches (top 10)
2. Identify **confidence gaps** - dimensions where we're unsure about the student
3. Recommend targeted mini-games to fill those gaps
4. Return narrative: "We're less sure about your [dimension]. Let's play [game] to clarify!"

**Request:**
```json
{
  "mode": "adaptive",
  "traitScores": { 
    "artistic": 35, 
    "linguistic": 55,
    "social": 72,
    ...
  },
  "completedGames": [],
  "allGames": [/* game definitions */]
}
```

**Response:**
```json
{
  "mode": "adaptive",
  "matches": [
    {
      "career": { title: "UX Designer", description: "...", ... },
      "score": 85,
      "confidence": 72
    }
  ],
  "gaps": [
    {
      "dimension": "artistic",
      "type": "gardner",
      "confidence": 35,
      "gap": 65,
      "targetGames": [
        { "id": "story-weaver", "title": "Story Weaver", "emoji": "📝" }
      ]
    }
  ],
  "suggestedGames": [
    {
      "id": "story-weaver",
      "title": "Story Weaver",
      "duration": "8-12 min",
      "insight": "Reveals your creativity, written expression, and emotional intelligence"
    }
  ],
  "nextAction": "We're less certain about your artistic strengths. Let's do a quick Story Weaver to clarify!",
  "recoveryPlan": "Playing this will strengthen our assessment..."
}
```

---

### Tier 2: Game Submission (Interactive Signals)
**Endpoint**: `POST /api/game/submit` (synchronous)

**What happens:**
1. User plays game (ScenarioQuest, PatternMaster, StoryWeaver, etc.)
2. Game responses submitted with user answers
3. LLM extracts trait signals in real-time
4. Assessment profile updated immediately
5. **Before/after traits** captured for impact comparison

**Flow:**
```
Before traits: { artistic: 35, linguistic: 55, social: 72 }
    ↓
User plays Story Weaver (8 min)
    ↓
Game submit with creative writing responses
    ↓
LLM extraction: "Excellent metaphors, emotional depth, unique voice detected"
    ↓
After traits: { artistic: 68, linguistic: 72, social: 74, empathy: 81 }
```

---

### Tier 3: Re-Matching (Confidence Boost)
**Endpoint**: `POST /api/career/match` with `mode=rematch`

**What it does:**
1. Compare before/after trait scores
2. Recalculate career scores with new signals
3. Highlight **improved/changed matches**
4. Show impact with deltas: "UX Designer moved from 65 → 78 (+13 points!)

**Request:**
```json
{
  "mode": "rematch",
  "beforeTraits": { "artistic": 35, "linguistic": 55, "social": 72 },
  "afterTraits": { "artistic": 68, "linguistic": 72, "social": 74, "empathy": 81 }
}
```

**Response:**
```json
{
  "mode": "rematch",
  "before": [
    { "title": "Software Engineer", "score": 78 },
    { "title": "Product Manager", "score": 72 },
    { "title": "UX Designer", "score": 65 }
  ],
  "after": [
    { "title": "Software Engineer", "score": 76 },
    { "title": "UX Designer", "score": 78 },
    { "title": "Product Manager", "score": 71 }
  ],
  "improvements": [
    {
      "career": "UX Designer",
      "before": 65,
      "after": 78,
      "improvement": 13
    }
  ],
  "message": "🚀 Wow! That game revealed some amazing things about you. Check how your best matches evolved!"
}
```

---

## Integration with In-Chat Games

### Example Chat User Journey:

```
User: "I'm interested in tech but also creative..."

Assistant (Career Buddy):
  "Interesting! Let me understand your creative side better.
   Let me ask a few quick questions..."
  [10-15 exchanges about interests, skills, pain points]

System (Every 10 messages):
  → Extract traits from chat via /api/assessment/extract
  → Call /api/career/match?mode=adaptive
  → Get initial matches + confidence gaps + suggested games

Assistant (In-chat message):
  "So far you're really showing strong problem-solving and 
   people skills. But I want to understand your creative side better.
   
   ✨ Let's play a quick mini-game. I'll give you a story starter,
   and you write the next paragraph. This will show me how you think."
   
   [Render PollComponent or MiniGameWrapper in chat]
   
   📝 Story Weaver - Match the story with creative connections
   [Game embedded in chat, user interacts]
   
   User responds with creative story...
   
System (After game):
  → POST to /api/game/submit with responses
  → Extract scores synchronously
  → Capture before/after traits

Assistant (Narrative):
  "WOW! 🎨 You just showed me something amazing - you have 
   a real creative eye and emotional intelligence!
   
   Let me see what this means for your career path...
   
   [Call /api/career/match?mode=rematch]
   
   This changes things! It looks like UX Design and Product 
   Strategy are even stronger fits than we thought."
```

---

## Key Design Principles

### 1. **Confidence Over Perfection**
- We show how *sure* we are about each match (0-100%)
- Low-confidence dimensions get suggested games
- Games boost confidence in specific areas

### 2. **Narrative-Driven**
- Instead of raw scores, users see stories
- "We're less sure about X" → Game recommendation
- "That game showed us Y" → Updated matches with improvements

### 3. **Synchronous Feedback**
- Game submission → immediate extraction → immediate re-match
- Users see before/after changes instantly
- Creates sense of impact and progress

### 4. **No Disruption to Chat**
- Games embedded as rich message types
- Optional (can refuse and continue chatting)
- Doesn't require leaving conversational context

### 5. **Language-Aware**
- All game evaluation happens in user's language
- Extraction prompt includes language parameter
- Trait signals are consistent across languages

---

## Technical Implementation

### New Routes:
```
POST /api/career/match
├── mode=adaptive ← Gap analysis + game suggestions
├── mode=rematch  ← Before/after comparison
└── mode=advanced ← Legacy (current endpoint)

POST /api/game/submit (NEW)
└── Synchronous scoring with trait extraction
```

### New Files:
- `src/lib/career-engine/adaptiveMatching.ts` - Core logic
- `src/types/game.ts` - Type extensions (IN PROGRESS)
- `src/components/chat/RichMessage.tsx` - Multi-type renderer (IN PROGRESS)
- `src/app/api/game/submit/route.ts` - Game submission handler (IN PROGRESS)

### Updated Files:
- `src/lib/career-engine/index.ts` - Export new functions
- `src/app/api/career/match/route.ts` - Add new modes (staged as route-enhanced.ts)

---

## Phase Implementation (From Session Plan)

**Phase 1**: Core infrastructure (types + RichMessage renderer + sync API)  
**Phase 2**: Adaptive triggering (role + hobbies + pain-based game suggestions)  
**Phase 3**: Assessment blending (sync scoring + career re-match)  
**Phase 4**: Language adaptation (parameter passing to existing system prompt)  
**Phase 5**: E2E testing + feature flags + mobile/voice guardrails  

---

## Next: Interactive Chat Integration

The chat agent will:
1. Extract traits every 10 messages
2. Call `adaptiveMatch()` to get gaps + suggestions
3. Render suggested games as embedded interactive components
4. On completion, re-match with boosted traits
5. Show narrative of career evolution

This creates a **living evaluation** that gets smarter with every game played!
