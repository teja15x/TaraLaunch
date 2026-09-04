# ARCHITECTURE

## Frontend

- Next.js App Router + TypeScript
- Main product routes under `src/app/(main)`:
  - `home`
  - `talk`
  - `explore`
  - `experience`
  - `journey`
  - `next`
- Opening cinematic cycle on `/` via `JourneyScene` + `TaraOpeningExperience`

## State and domain

- Domain contracts: `src/lib/tara/types.ts`
- Core behavior helpers: `src/lib/tara/model.ts`
- Experience definitions: `src/data/tara/experiences.ts`
- Client persistent state (Demo foundation): `src/store/tara.ts` (Zustand + local storage)

## AI layer

- Shared provider interface: `src/lib/tara/ai/types.ts`
- Demo provider: `src/lib/tara/ai/demoProvider.ts`
- OpenAI provider: `src/lib/tara/ai/openaiProvider.ts`
- Provider switch: `src/lib/tara/ai/provider.ts`

## API boundaries

- Chat response API: `POST /api/tara/chat`
- Tara moment/insight API: `POST /api/tara/insight`
- Both routes use schema validation (`zod`) and provider abstraction.

## Persistence strategy

- Current runtime flow is client-persisted demo state for portability.
- Database foundation schema is prepared in Supabase migration for server persistence adoption.
