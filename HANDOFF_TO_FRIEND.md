# 🚀 CAREER DECIDING AGENT: HANDOFF DOCUMENT

Hello! If you are reading this, you are taking over the backend development of the "Career Deciding Agent" startup. 

Please copy and paste this ENTIRE DOCUMENT into your GitHub Copilot / ChatGPT so it understands the exact context of the project before you start coding the Django Backend!

---

## 1. The Core Vision
**The Problem:** Traditional career counseling fails Indian students. They face intense "herd mentality" (Everyone must do B.Tech/NEET/UPSC), paralyzing tier-based rank anxiety (failing JEE, ending up in Tier-3 colleges with TCS/Infosys), and heavy family expectations. 
**The Product:** A 7-day, AI-driven career mentoring journey. It uses gamified psychometrics, diagnoses the psychological root of a student's confusion, uses "Contradiction Guardrails" to shatter delusions, and assigns real-world accountability tasks.

## 2. Current Architecture (To be ported to Django)
Currently, this is a Next.js 14 App Router project with a massive AI rules engine sitting in `src/lib/`. The database is Supabase.

### The 3 Core AI Engines We Built:
1. **The Confusion Diagnosis Engine:** Diagnoses student archetypes based on intake (`parent_vs_passion`, `information_void`, `fear_of_failure`).
2. **Action Extraction Engine:** The AI is told to assign homework in the format `[ACTION: Task | DUE: 3 days]`. The engine parses this and saves it to the database.
3. **Contradiction Guardrails:** Stops students from making bad choices (e.g. tight budget but wants MS in US).

---

## 3. Python Django Backend Porting Guide
The goal is to move the Next.js `/api/chat` route to a Django REST Framework (DRF) backend.

### A. The Confusion Diagnosis Engine (Python Version)
Create `career_engine/confusion_matrix.py`:

```python
def diagnose_confusion(confusion_text="", stressors_text="", family_pressure_text=""):
    combined_text = f"{confusion_text} {stressors_text} {family_pressure_text}".lower()
    
    scores = {
        "parent_vs_passion": 0, "information_void": 0, 
        "multi_potentialite": 0, "fear_of_failure": 0, "herd_mentality": 0
    }
    
    if any(w in combined_text for w in ["dad", "mom", "parents", "expect", "force"]):
        scores["parent_vs_passion"] += 3
    if "no idea" in combined_text or "clueless" in combined_text:
        scores["information_void"] += 4
    if "fail" in combined_text or "scared" in combined_text:
        scores["fear_of_failure"] += 3
        
    highest_archetype = max(scores, key=scores.get)
    highest_score = scores[highest_archetype]
    
    if highest_score == 0: return {"archetype": "unclear", "protocol": "Ask clarifying questions."}
        
    return {
        "archetype": highest_archetype,
        "protocol": get_counseling_protocol(highest_archetype)
    }

def get_counseling_protocol(archetype):
    protocols = {
        "parent_vs_passion": "[DIAGNOSIS: PARENT VS PASSION] Validate feelings, don't villainize parents, use data.",
        "fear_of_failure": "[DIAGNOSIS: FEAR OF FAILURE] Emotional triage. Skill over brand."
    }
    return protocols.get(archetype, "")
```

### B. The Main Chat API Route (`api/views.py`)
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .career_engine.confusion_matrix import diagnose_confusion
import openai

@api_view(['POST'])
def chat_endpoint(request):
    data = request.data
    user_message = data.get('message', '')
    student_intake = data.get('studentIntake', {})
    
    # 1. Run Python Diagnosis Engine
    diagnosis = diagnose_confusion(
        student_intake.get('confusion', ''),
        student_intake.get('stressors', ''),
        student_intake.get('familyPressure', '')
    )
    
    # 2. Call OpenAI (Ensure to enforce the ONE QUESTION ONLY rule)
    system_prompt = f"""
    You are the Career Deciding Agent for Indian students.
    {diagnosis['protocol']}
    Always assign homework using [ACTION: description | DUE: 3 days].
    Ask exactly ONE question per turn.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_message}]
    )
    
    raw_ai_reply = response.choices[0].message.content
    # Note: Ensure to run the action extraction regex here to save tasks to Django Models
    
    return Response({"message": raw_ai_reply})
```

## 4. Next Steps for the Django Dev
1. Create a new Django project alongside the Next.js one.
2. Build Django Models that match our Supabase schema (`user_streaks`, `student_action_items`, `chat_messages`).
3. Port the massive System Prompt located in `src/lib/career-agent/prompt.ts` completely into your Python backend.
4. Update the Next.js Frontend to fetch from `http://localhost:8000/api/chat` instead of the internal Next.js route!
