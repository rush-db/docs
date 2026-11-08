---
title: Update records REST API
sidebar_label: Update records
description: "Update RushDB records through the RushDB Cloud REST API: PATCH for a partial update that keeps unspecified fields, or a full replacement of a record."
sidebar_position: 6
---

# Update records

## Partial update

`PATCH /api/v1/records/:entityId`

Unspecified fields are preserved.

```bash
curl -X PATCH https://api.rushdb.com/api/v1/records/movie-123 \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data": {"rating": 9.0}}'
```

## Full replacement

`PUT /api/v1/records/:entityId`

All previous fields are removed, then replaced with the new data.

```bash
curl -X PUT https://api.rushdb.com/api/v1/records/movie-123 \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"label": "MOVIE", "data": {"title": "Inception", "rating": 9.0, "genre": "sci-fi"}}'
```

## Request body

| Field   | Type     | Description                         |
| ------- | -------- | ----------------------------------- |
| `label` | `string` | (Optional) New label for the record |
| `data`  | `object` | Properties to write                 |

## See also

- [Writing Records with Vectors](../ai-and-vectors/write-with-vectors.md) — attach embedding vectors when creating or upserting records
