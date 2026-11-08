---
sidebar_position: 0
title: AI and semantic search REST API
description: "Overview of the RushDB Cloud AI endpoints: graph schema discovery as Markdown or JSON, embedding indexes, and semantic search over indexed properties."
---

# AI & semantic search

RushDB is a **self-aware memory layer for agents, humans, and apps**. It continuously understands its own structure — labels, fields, value distributions, relationships — and exposes that knowledge so agents can reason over real data without hallucinating schema details, and apps can retrieve semantically relevant context on demand.

The AI API covers three capabilities:

| Capability            | Description                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Graph Schema**      | Self-describing schema discovery: label names, field types, value ranges, and the relationship map — always up to date |
| **Embedding Indexes** | Per-label vector policies that turn string properties into long-term semantic memory                                   |
| **Semantic Search**   | Cosine/euclidean similarity retrieval over indexed properties, for agents and apps alike                               |

---

## How it fits together

```
┌─────────────────────────────────────────────────────┐
│  Your data (records + relationships)                │
│                                                     │
│  BOOK { title: "...", description: "..." }          │
└────────────────────┬────────────────────────────────┘
                     │
         POST /api/v1/ai/indexes
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Embedding index policy                             │
│  label: BOOK  property: description  dims: 1536    │
│  sourceType: managed | external                     │
└────────────────────┬────────────────────────────────┘
                     │
      Backfill (managed) / inline vectors (external)
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Vector stored on VALUE relationship                │
│  rel._emb_managed_cosine_1536 = [0.1, 0.2, ...]    │
└────────────────────┬────────────────────────────────┘
                     │
          POST /api/v1/ai/search
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Records ranked by similarity score                 │
│  result.__score = 0.94  (cosine similarity)        │
└─────────────────────────────────────────────────────┘
```

---

## Quick links

| Topic                                                                                  | Description                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Schema](#graph-schema)                                                                | Schema discovery with `POST /api/v1/ai/schema/md` and `POST /api/v1/ai/schema` |
| [Indexing](./indexing.md)                          | Create and manage managed embedding indexes                                    |
| [Advanced Indexing — BYOV](./advanced-indexing.md) | Bring Your Own Vectors: external indexes, inline writes                        |
| [Semantic Search](./search.md)                     | Query by meaning with `POST /api/v1/ai/search`                                 |
| [Writing with Vectors](./write-with-vectors.md)    | Attach vectors at create / upsert / importJson time                            |
| [Agent Skills](#agent-skills)                                                          | Installable skills that teach any compatible agent to use RushDB               |

---

## Graph schema

The schema endpoints expose a live snapshot of your database structure — without any manual schema definitions.

### Get schema (Markdown)

`POST /api/v1/ai/schema/md`

Returns the full schema as compact Markdown — the **recommended format for LLM context injection**: token-efficient, human-readable, and ready to paste into a system prompt or tool result.

#### Request Body

| Field    | Type             | Required | Description                                                                  |
| -------- | ---------------- | -------- | ---------------------------------------------------------------------------- |
| `labels` | array of strings | no       | Restrict output to specific labels. Omit (or pass `[]`) for the full schema. |
| `force`  | boolean          | no       | Recalculate now instead of serving the cached schema.                        |

#### Example request

```bash
curl -X POST https://api.rushdb.com/api/v1/ai/schema/md \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -d '{"labels": ["Order"]}'
```

#### Example response

The Markdown arrives as a JSON string in `data`:

```json
{
  "data": "# Graph Schema\n\n## Labels\n\n| Label | Count |\n|-------|------:|\n| `Order` | 5 |\n\n---\n\n## `Order` (5 records)\n\n### Properties\n\n| Property | ID | Type | Values / Range | Semantic Search |\n|----------|----|------|----------------|-----------------|\n| `createdAt` | `p000000000000000b` | datetime | `2026-10-02T09:15:00.000Z`..`2026-11-03T11:00:00.000Z` | — |\n| `status` | `p0000000000000009` | string | `paid`, `shipped`, `pending`, `cancelled` | — |\n| `total` | `p000000000000000a` | number | `79.8`..`499` | — |\n\n### Relationships\n\n| Traversal | Count | Edge Properties |\n|-----------|------:|-----------------|\n| `(Order)-[:CONTAINS]->(Product)` | 6 | `quantity:number` |\n| `(Order)-[:PLACED_BY]->(User)` | 5 | — |\n\n### Relationship Properties\n\n| Traversal | Property | Type | Values / Range | Relationships |\n|-----------|----------|------|----------------|--------------:|\n| `(Order)-[:CONTAINS]->(Product)` | `quantity` | number | `1`..`2` | 6 |",
  "success": true
}
```

The same `data`, rendered:

```text
# Graph Schema

## Labels

| Label | Count |
|-------|------:|
| `Order` | 5 |

---

## `Order` (5 records)

### Properties

| Property | ID | Type | Values / Range | Semantic Search |
|----------|----|------|----------------|-----------------|
| `createdAt` | `p000000000000000b` | datetime | `2026-10-02T09:15:00.000Z`..`2026-11-03T11:00:00.000Z` | — |
| `status` | `p0000000000000009` | string | `paid`, `shipped`, `pending`, `cancelled` | — |
| `total` | `p000000000000000a` | number | `79.8`..`499` | — |

### Relationships

| Traversal | Count | Edge Properties |
|-----------|------:|-----------------|
| `(Order)-[:CONTAINS]->(Product)` | 6 | `quantity:number` |
| `(Order)-[:PLACED_BY]->(User)` | 5 | — |

### Relationship Properties

| Traversal | Property | Type | Values / Range | Relationships |
|-----------|----------|------|----------------|--------------:|
| `(Order)-[:CONTAINS]->(Product)` | `quantity` | number | `1`..`2` | 6 |
```

The **ID** column holds each property's ID for `GET /api/v1/properties/:id/values`. **Traversal** rows read from the section's label: `->` is an outgoing relationship, `<-` an incoming one. A full example with three labels and a vector index is in [Schema self-awareness](../../../agent-memory/schema-self-awareness.mdx#what-the-agent-receives).

#### Filtered request (single label)

```bash
curl -X POST https://api.rushdb.com/api/v1/ai/schema/md \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -d '{"labels": ["Order"]}'
```

Returns only the `Order` section. The underlying cache still covers the full schema — filtering is applied in-memory.

---

### Get schema (JSON)

`POST /api/v1/ai/schema`

Returns the same schema as a structured JSON array. Each element describes one label.

#### Request Body

| Field    | Type             | Required | Description                                             |
| -------- | ---------------- | -------- | ------------------------------------------------------- |
| `labels` | array of strings | no       | Restrict to specific labels. Omit for the full schema.  |
| `force`  | boolean          | no       | Recalculate now instead of serving the cached schema.   |

#### Example response

For `{"labels": ["Order"]}`, the same data as the Markdown example above:

```json
{
  "data": [
    {
      "label": "Order",
      "count": 5,
      "properties": [
        {
          "id": "p000000000000000b",
          "name": "createdAt",
          "type": "datetime",
          "recordsCount": 5,
          "isArray": false,
          "min": "2026-10-02T09:15:00.000Z",
          "max": "2026-11-03T11:00:00.000Z"
        },
        {
          "id": "p0000000000000009",
          "name": "status",
          "type": "string",
          "recordsCount": 5,
          "isArray": false,
          "values": [
            "paid",
            "shipped",
            "pending",
            "cancelled"
          ],
          "min": "cancelled",
          "max": "shipped"
        },
        {
          "id": "p000000000000000a",
          "name": "total",
          "type": "number",
          "recordsCount": 5,
          "isArray": false,
          "min": 79.8,
          "max": 499
        }
      ],
      "relationships": [
        {
          "label": "Product",
          "type": "CONTAINS",
          "direction": "out",
          "count": 6,
          "properties": [
            {
              "name": "quantity",
              "type": "number",
              "relationshipsCount": 6,
              "min": 1,
              "max": 2
            }
          ]
        },
        {
          "label": "User",
          "type": "PLACED_BY",
          "direction": "out",
          "count": 5
        }
      ]
    }
  ],
  "success": true
}
```

- `count`: records with the label. Items are sorted by count, largest first.
- `properties[].id`: pass to `GET /api/v1/properties/:id/values` to list every distinct value. A property with the same name and type has the same ID under every label.
- `properties[].recordsCount`: records of this label that have the property. `isArray` is `true` when they store it as an array.
- `properties[].values`: up to 10 sample values for strings; `["true", "false"]` for booleans.
- `properties[].min` / `.max`: the range of numbers and datetimes (ISO 8601). Non-array strings and booleans also get an alphabetical min and max.
- `properties[].vectorIndexes`: present when the property has vector indexes. Each has `id`, `name`, `sourceType`, `similarityFunction`, `dimensions`, `status` (`pending`, `indexing`, `awaiting_vectors`, `ready` or `error`) and `modelKey`. Query a `ready` one with `POST /api/v1/ai/search`.
- `relationships[].direction`: `out` when this label is the source, `in` when it is the target. `count` is the number of relationships of that type between the two labels.
- `relationships[].properties`: the properties stored on those relationships, with `relationshipsCount` and, like record properties, sample `values` or a `min` / `max` range.

---

:::note Caching
Both endpoints share one cached schema per project, kept for an hour. After that, a call still gets the cached schema straight away while a refresh runs in the background, so no call waits for a recalculation unless the project has no cached schema yet or the body has `"force": true`. `force` waits for a schema that includes every write made before the call.
:::

:::tip Agent quickstart
Call `POST /api/v1/ai/schema/md` first in every AI session. Without it, models will hallucinate label and field names.
:::

---

## Agent skills

`@rushdb/skills` is a collection of [Agent Skills](https://agentskills.io) — installable instructions that teach any skills-compatible AI agent (Claude, GitHub Copilot, Cursor, Windsurf, and others) to use RushDB efficiently, without manual system prompt engineering.

```bash
npx skills add rush-db/skills
```

| Skill                    | What it teaches                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rushdb-query-builder`   | Discovery-first queries, traversals, aggregation, and scope-safe semantic recall                                                                                  |
| `rushdb-agent-memory`    | Route persistent memory across native providers, MCP, and custom harnesses without duplicate writes                                                               |
| `rushdb-memory-adapter`  | Build and validate lifecycle-aware RushDB memory plugins and providers                                                                                            |
| `rushdb-data-modeling`   | LMPG model design, nested imports, schema evolution, and canonical memory records                                                                                 |
| `rushdb-faceted-search`  | Build faceted filter UIs — discover properties and types, enumerate distinct values, map to widgets, assemble a live `where` clause                               |
| `rushdb-domain-template` | Design a tailored schema for any domain through guided conversation — interview, entity/relationship mapping, bootstrap payload, and 10 built-in domain templates |

Each skill bundles a `SKILL.md` with concise instructions and optional reference files (like the full SearchQuery spec) that the agent loads on demand.

:::note MCP server vs. Agent Skills
The [MCP server](../../../../connect/mcp.mdx) gives agents direct tool access to RushDB at runtime. Agent Skills teach agents _how_ to use those tools correctly — they complement each other.
:::
