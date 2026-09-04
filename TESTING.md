# TESTING

## Run checks

```bash
npm run lint
npm run build
```

## Manual flow test (minimum)

1. Open `/`
2. Continue to `/talk`
3. Enter: `I don't know what career I want`
4. Confirm Tara responds naturally
5. Open `/experience/product-management-launch-crunch`
6. Make decisions through the scenario
7. Complete reflection
8. Verify:
   - Evidence appears in `/explore` and `/journey`
   - Tara Moment appears on `/home`
   - Next action appears on `/next`
9. Reload app and verify memory/journey persist

## Demo mode test

- Ensure `OPENAI_API_KEY` is unset and flow still works end-to-end.
