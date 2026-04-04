# Career Agent

Career Agent is an AI-driven career discovery and counseling platform for students.
It combines chat guidance, psychometric assessments, and game-based signals to generate explainable career recommendations.

## Core Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth + Postgres)
- OpenAI
- Tailwind CSS + Zustand

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Add environment file:

```bash
cp .env.example .env.local
```

3. Fill required keys in `.env.local` (Supabase + OpenAI).

4. Run dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Important Directories

```text
src/
	app/                # Next.js routes, layouts, API endpoints
		api/              # Server routes (chat, career match, assessments, payments)
	components/         # Reusable UI components
	lib/                # Core business logic (career engine, supabase helpers, openai)
	data/               # Static data (careers, games, guidance)
	types/              # Shared TypeScript contracts
	store/              # Zustand state

supabase/
	migrations/         # SQL migrations (source of truth for DB schema)

docs/
	SETUP_GUIDE.md      # Setup + deployment walkthrough
	CAREER_AGENT_SETUP.md
	...                 # Domain and product docs
```

## Collaboration Workflow (Two Developers)

Use this workflow to avoid merge conflicts:

1. Keep `main` always deployable.
2. Create one branch per task:

```bash
git checkout main
git pull origin main
git checkout -b feature/<short-task-name>
```

3. Commit small and clear:

```bash
git add .
git commit -m "feat: add contradiction persistence in chat route"
```

4. Push and open PR:

```bash
git push -u origin feature/<short-task-name>
```

5. Rebase/merge latest `main` before final merge:

```bash
git checkout main
git pull origin main
git checkout feature/<short-task-name>
git rebase main
```

## Work Split Recommendation

For two contributors, split by area:

- Dev A: `src/app/api/**`, `src/lib/career-engine/**`, `supabase/migrations/**`
- Dev B: `src/components/**`, `src/app/(main)/**`, `src/data/**`, `src/store/**`

This reduces overlap and conflict risk.

## Database and Migrations

- New schema changes must go into a new file in `supabase/migrations/`.
- Never edit old migrations that were already applied in shared environments.
- Keep migration names incremental and descriptive.

## Phase Status (Current)

- Phase 0: Guardrails and type foundation completed.
- Phase 1: Stage gates and contradiction detection completed.
- Phase 2: Evidence persistence schema/helpers completed; integration in progress.

## Developer Commands

```bash
npm run dev      # local development
npm run lint     # lint checks
npm run build    # production build validation
```

## Reference Docs

- See `docs/SETUP_GUIDE.md` for environment setup details.
- See `docs/CAREER_AGENT_SETUP.md` for feature-level onboarding.
- See `src/docs/COUNSELING_OS_GUARDRAILS.md` for counseling architecture rules.
