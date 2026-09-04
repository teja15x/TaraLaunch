# ENVIRONMENT

## Required

None for Demo Mode.

## Optional for live AI

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional override)

## Optional for Supabase-backed auth/data

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Behavior

- With `OPENAI_API_KEY`: `OpenAIProvider`
- Without key: `DemoAIProvider`
