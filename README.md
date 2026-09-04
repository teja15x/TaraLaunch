# TaraLaunch (Tara)

Tara is a personal navigation intelligence app.

Core loop:

`Talk -> Understand -> Experience -> Observe -> Reflect -> Insight -> Next Action -> Memory -> Journey`

## Current foundation in this repository

- Opening cinematic Tara Cycle scene (`/`)
- Core app surfaces: `/home`, `/talk`, `/explore`, `/experience`, `/journey`, `/next`
- Structured memory model with edit/delete/export support
- Product Management experience with multi-step choice -> consequence flow
- Reflection -> evidence -> hypothesis -> Tara Moment -> next action generation
- Demo mode (works without OpenAI key)
- OpenAI provider architecture behind a common provider interface
- API routes for conversation and insight generation (`/api/tara/chat`, `/api/tara/insight`)
- Foundation Postgres schema migration for Tara entities in `supabase/migrations/013_tara_foundation.sql`

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: `http://localhost:3000`

## Modes

- **Demo Mode**: if `OPENAI_API_KEY` is missing, Tara uses `DemoAIProvider`.
- **OpenAI Mode**: if `OPENAI_API_KEY` is present, Tara uses `OpenAIProvider`.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

For deeper docs, see:
- `PRODUCT.md`
- `ARCHITECTURE.md`
- `API.md`
- `DATABASE.md`
- `DEVELOPMENT.md`
- `ENVIRONMENT.md`
- `SECURITY.md`
- `TESTING.md`
