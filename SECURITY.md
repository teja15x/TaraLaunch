# SECURITY

## Implemented controls in this foundation

- Server-side AI key usage only (`OPENAI_API_KEY` is never exposed to client code)
- API input validation with `zod`
- User ownership + RLS architecture in DB migration
- Structured memory model with explicit update/delete support

## Expectations for production hardening

- Enforce authenticated access for all user data APIs
- Persist memory/evidence on server with RLS-only access
- Add rate limits on AI routes
- Add audit trail for memory mutation and parent sharing changes
- Add consent checks for minors and safety escalation flow
