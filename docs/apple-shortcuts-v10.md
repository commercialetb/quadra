# Apple Shortcuts v10

La review queue Siri di Quadra ora supporta:
- retry del match via `/api/shortcut/resolve-review` con `mode: "retry"`
- auto-resolve via `/api/shortcut/resolve-review` con `mode: "auto_resolve"`
- campi persistenti di confidence e retry nello schema Supabase

## Retry JSON
```json
{
  "itemId": "REVIEW_ITEM_ID",
  "mode": "retry"
}
```

## Auto-resolve JSON
```json
{
  "itemId": "REVIEW_ITEM_ID",
  "mode": "auto_resolve"
}
```
