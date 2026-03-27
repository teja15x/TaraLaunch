# Career Deciding Agent Setup

## Where to add the API key

Open `.env.local` in the project root and paste your key here:

```env
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4o
```

Project root:

`C:\Users\teja1\Downloads\career-agent--main (1)\career-agent--main`

## Main agent files

- `src/lib/career-agent/prompt.ts`
- `src/app/api/chat/route.ts`
- `src/app/(main)/chat/page.tsx`
- `src/app/(main)/roles/page.tsx`
- `src/data/careerRoles.ts`

## What the agent does

- Guides Indian students across a 7-day journey
- Understands pressure, interests, stress, and blockers
- Explains pathways, exams, courses, and future role outcomes
- Gives honest fit analysis and alternatives
- Supports multilingual counseling direction and voice-ready chat UI

## Model note

- The app now defaults to `gpt-4o` for better dialect and tone control.
- You can override it with `OPENAI_MODEL` in `.env.local`.
