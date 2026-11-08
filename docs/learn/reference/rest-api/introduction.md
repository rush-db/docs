---
title: RushDB Cloud REST API
description: "Overview of the RushDB Cloud REST API at api.rushdb.com/api/v1: bearer API key authentication and the endpoints for records, search, AI and transactions."
sidebar_position: 0
---

# REST API

:::info Cloud
The REST API is RushDB Cloud's API. A self-hosted engine does not serve it: reach the engine through the SDKs' direct mode, or its own [native protocol](../../../engine/connectivity/http-api.md), PostgreSQL wire, gRPC and Bolt listeners.
:::

Base URL: `https://api.rushdb.com/api/v1`
Auth: `Authorization: Bearer YOUR_API_KEY`

```bash
curl -X POST https://api.rushdb.com/api/v1/records \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"label":"MOVIE","data":{"title":"Inception","rating":8.8}}'
```

Interactive docs: [Swagger UI](https://api.rushdb.com/api) · [OpenAPI JSON](https://api.rushdb.com/api-json)

## Endpoints

| Group                                                                     | Description                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Records](./records/create-records.md)               | Create, read, update, delete, search, import, export |
| [Relationships](./relationships.md)                  | Attach and detach edges between records              |
| [Labels](./labels.md)                                | Query which types exist and their counts             |
| [Properties](./properties.md)                        | Inspect field names, types, and value ranges         |
| [Transactions](./transactions.md)                    | Atomic multi-step operations                         |
| [AI & Semantic Search](./ai-and-vectors/overview.md) | Schema export, embedding indexes, vector and hybrid search |
| [Keyword Search](./text-search.md)                   | Text indexes and BM25 keyword search                 |
| [Raw Queries](./raw-queries.md)                      | openCypher statements run by the engine              |
