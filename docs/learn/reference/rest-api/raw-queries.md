---
title: Raw queries REST API
sidebar_label: Raw queries
description: Run openCypher statements in the RushDB engine through POST /api/v1/query/raw in the RushDB Cloud REST API, with a worked employees example.
sidebar_position: 8
---

# Raw queries

Runs an openCypher statement in the RushDB engine. See [openCypher](../../../engine/languages/cypher.md) in the engine manual for the supported statements.

### REST API

`POST /api/v1/query/raw`

```bash
curl -X POST https://api.rushdb.com/api/v1/query/raw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -d '{
    "query": "MATCH (n:Person) RETURN n.name AS name LIMIT $limit",
    "params": { "limit": 10 }
  }'
```

Response: one object per row, keyed by the `RETURN` columns.

```json
{ "data": { "records": [{ "name": "Ada" }] }, "success": true }
```

### Real-world example: employees at a company

```bash
curl -X POST https://api.rushdb.com/api/v1/query/raw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -d '{
    "query": "MATCH (c:Company { name: $company })-[:EMPLOYS]->(p:Person) RETURN p.name AS name, p.email AS email, c.name AS company ORDER BY name LIMIT $limit",
    "params": { "company": "Acme Corp", "limit": 50 }
  }'
```
