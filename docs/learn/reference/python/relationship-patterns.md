---
sidebar_position: 2
title: Relationship patterns API (Python SDK)
sidebar_label: Relationship patterns
description: Use db.relationships.patterns in the RushDB Python SDK to queue schema analysis, then approve, ignore or delete the relationship patterns Cloud suggests.
---

# Relationship patterns

:::info Cloud
This capability is provided by RushDB Cloud. It is not available on a self-hosted engine, where the SDK raises `CloudOnlyError` before sending anything.
:::

RushDB can analyze the project schema and suggest relationships that are not materialized yet. Suggestions are reviewable: no relationship is created until you approve a pattern.

Access the API through `db.relationships.patterns`.

## Methods

| Method                                         | Description                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `list()`                                       | List saved patterns, schema relationships, and analysis status         |
| `analyze()`                                    | Queue schema analysis to generate suggestions                          |
| `approve(pattern_id)`                          | Approve a suggestion and apply its relationships                       |
| `ignore(pattern_id)`                           | Ignore a suggestion without applying it                                |
| `delete(pattern_id, *, delete_existing=False)` | Delete a saved pattern, optionally removing materialized relationships |

## Review flow

```python
from rushdb import RushDB

db = RushDB("RUSHDB_API_KEY")

# Queue analysis. Fetch results with list() after the analysis completes.
db.relationships.patterns.analyze()

result = db.relationships.patterns.list()
for pattern in result.data["patterns"]:
    print(pattern["id"], pattern["type"], pattern["confidence"])

db.relationships.patterns.approve("pattern-id")
```

Use `ignore()` when a suggestion does not fit your domain model:

```python
db.relationships.patterns.ignore("pattern-id")
```

Deleting a saved pattern does not delete relationships that it already created unless you opt in:

```python
db.relationships.patterns.delete("pattern-id", delete_existing=True)
```

For lifecycle details, matching modes, REST endpoints, and MCP tools, see [Suggested Relationship Patterns](../../relationships/suggested-patterns.mdx).
