# Contributing Guide

## Branching Policy

- `main` is protected and always stable.
- Create feature branches from latest `main`.
- One branch should cover one task only.

```bash
git checkout main
git pull origin main
git checkout -b feature/<task-name>
```

## Commit Style

Use short, scoped commit messages:

- `feat: add evidence summary in match response`
- `fix: handle missing trait scores in advanced mode`
- `refactor: split contradiction helpers`
- `docs: update setup instructions`

## Pull Request Checklist

- Code compiles and runs locally.
- `npm run lint` passes.
- Any schema change includes a new migration in `supabase/migrations/`.
- API changes mention request/response impact.
- No secrets are committed.

## Team Working Agreement (2 Developers)

- Developer A focuses on backend and DB:
  - `src/app/api/**`
  - `src/lib/career-engine/**`
  - `supabase/migrations/**`

- Developer B focuses on UI and client flow:
  - `src/components/**`
  - `src/app/(main)/**`
  - `src/store/**`
  - `src/data/**`

If both must touch one file, sync before coding and merge smaller PRs first.

## Recommended Daily Workflow

1. Pull latest `main`
2. Start feature branch
3. Implement and test
4. Open PR early (draft PR is fine)
5. Rebase branch on latest `main`
6. Merge after review

## Conflict Handling

When conflict happens:

```bash
git fetch origin
git rebase origin/main
```

Resolve conflicts carefully, run lint/build again, then continue:

```bash
git add .
git rebase --continue
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```
