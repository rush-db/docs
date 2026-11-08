---
title: Delete records REST API
sidebar_label: Delete records
description: Delete one RushDB record by ID, or every record that matches a query, through the record delete endpoints of the RushDB Cloud REST API.
sidebar_position: 7
---

# Delete records

## Delete by ID

`DELETE /api/v1/records/:entityId`

```bash
curl -X DELETE https://api.rushdb.com/api/v1/records/movie-123 \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

## Bulk delete

`POST /api/v1/records/delete`

Delete all records matching a query.

```bash
curl -X POST https://api.rushdb.com/api/v1/records/delete \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"labels": ["MOVIE"], "where": {"rating": {"$lt": 5}}}'
```

:::warning
Omitting `where` deletes **all** records with the given label.
:::
