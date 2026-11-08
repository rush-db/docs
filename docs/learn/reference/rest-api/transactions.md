---
title: Transactions REST API
sidebar_label: Transactions
description: Begin, check, commit and roll back RushDB transactions with the RushDB Cloud REST API, and pass X-Transaction-Id to include other requests in them.
sidebar_position: 6
---

# Transactions

## Begin transaction

`POST /api/v1/tx`

```bash
TX_ID=$(curl -s -X POST https://api.rushdb.com/api/v1/tx \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ttl": 10000}' | jq -r '.data.id')
```

| Field | Type     | Description                          |
| ----- | -------- | ------------------------------------ |
| `ttl` | `number` | TTL in ms. Default: 5000. Max: 55000 |
| `autocommit` | `boolean` | Commit instead of rolling back when the TTL elapses. Default: `false` |

Send `X-Transaction-Id: <id>` with record creates, updates, sets, deletes by id, attaches and imports to stage them. Other writes return `400` inside a transaction and roll it back; see [Transactions](../../records-and-queries/transactions.mdx#supported-operations).

## Check transaction existence

`GET /api/v1/tx/:txId`

```bash
curl https://api.rushdb.com/api/v1/tx/$TX_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

## Commit transaction

`POST /api/v1/tx/:txId/commit`

```bash
curl -X POST https://api.rushdb.com/api/v1/tx/$TX_ID/commit \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

## Roll back transaction

`POST /api/v1/tx/:txId/rollback`

```bash
curl -X POST https://api.rushdb.com/api/v1/tx/$TX_ID/rollback \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

## Use with requests

Pass `X-Transaction-Id` with the transaction ID on any create, update, delete, or relationship endpoint:

```bash
curl -X POST https://api.rushdb.com/api/v1/records \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Transaction-Id: $TX_ID" \
  -d '{"label": "MOVIE", "data": {"title": "Inception"}}'
```

## Full example

```bash
# 1. Begin
TX_ID=$(curl -s -X POST https://api.rushdb.com/api/v1/tx \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ttl": 10000}' | jq -r '.data.id')

# 2. Create records
MOVIE_ID=$(curl -s -X POST https://api.rushdb.com/api/v1/records \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Transaction-Id: $TX_ID" \
  -d '{"label": "MOVIE", "data": {"title": "Inception"}, "options": {"returnResult": true}}' | jq -r '.data.__id')

ACTOR_ID=$(curl -s -X POST https://api.rushdb.com/api/v1/records \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Transaction-Id: $TX_ID" \
  -d '{"label": "ACTOR", "data": {"name": "Leonardo DiCaprio"}, "options": {"returnResult": true}}' | jq -r '.data.__id')

# 3. Link
curl -X POST https://api.rushdb.com/api/v1/relationships/$MOVIE_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Transaction-Id: $TX_ID" \
  -d '{"targetIds": "'$ACTOR_ID'", "type": "STARS_IN"}'

# 4. Commit
curl -X POST https://api.rushdb.com/api/v1/tx/$TX_ID/commit \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```
