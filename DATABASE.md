# DATABASE

Supabase migration: `supabase/migrations/013_tara_foundation.sql`

## Added schema

- `tara` schema
- Structured entities for users, profiles, life stages, memories, conversations/messages,
  experiences/attempts/states, observations, evidence, hypotheses, reflections, decisions,
  outcomes, careers, skills, education paths, opportunities, professionals, experiments,
  projects, next actions, career passports, future self entries, parent shares, consents,
  safety events, analytics events.

## Security model

- Foreign keys with user ownership
- RLS enabled on user-owned tables
- Owner-only policies using `auth.uid()`

## Notes

- Career seed data can be inserted into `tara.careers`
- Experience catalog can be synced from app definitions into `tara.experiences`
