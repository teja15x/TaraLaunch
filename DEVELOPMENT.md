# DEVELOPMENT

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Main implementation files

- Domain: `src/lib/tara/*`
- Experiences: `src/data/tara/experiences.ts`
- Store: `src/store/tara.ts`
- Product pages: `src/app/(main)/*`
- APIs: `src/app/api/tara/*`

## Build checks

```bash
npm run lint
npm run build
```
