# API

## POST /api/tara/chat

Generates Tara conversation reply and structured memory operations.

### Request body

```json
{
  "message": "I don't know what career I want",
  "conversation": [{ "role": "assistant", "content": "..." }],
  "language": "en",
  "lifeStage": "college"
}
```

### Response body

```json
{
  "mode": "demo",
  "reply": "...",
  "suggestedNextStep": "...",
  "memoryOperations": [
    {
      "action": "upsert",
      "category": "goal",
      "key": "stated_goal",
      "value": "...",
      "confidence": "early-signal"
    }
  ]
}
```

## POST /api/tara/insight

Generates one Tara Moment based on evidence/hypothesis context.

### Request body

```json
{
  "evidenceSummary": "...",
  "hypothesisSummary": "...",
  "language": "en"
}
```

### Response body

```json
{
  "mode": "demo",
  "taraMoment": "..."
}
```
