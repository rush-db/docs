---
sidebar_position: 0
title: Python SDK reference
description: Install the RushDB Python SDK with pip, connect to RushDB Cloud or a self-hosted engine in direct mode, and browse the reference for each class.
---

# Python SDK

The official Python SDK for RushDB. Compatible with Python 3.8+.

## Installation

```bash
pip install rushdb
```

## Quick start

```python
from rushdb import RushDB

db = RushDB("RUSHDB_API_KEY")

# Store a record
db.records.create(
    label="User",
    data={"name": "Alice", "role": "engineer"},
)

# Query records
result = db.records.find({
    "labels": ["User"],
    "where": {"role": "engineer"},
    "limit": 10,
})
```

To connect to a self-hosted engine, use direct mode with the engine's URL and token:

```python
db = RushDB("ENGINE_TOKEN", direct=True, engine_url="http://127.0.0.1:3000")
```

See [SDKs](../../../connect/sdks.mdx) for what direct mode offers.

## API reference

| Class                                                                  | Description                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [RushDB](./RushDB.md)                               | Main client — entry point for all operations                                          |
| [Record](./record.md)                               | Typed record class with instance methods (`attach`, `detach`, `update`, `delete`)     |
| [Relationship Patterns](./relationship-patterns.md) | Review and apply AI-suggested relationships                                           |
| [SearchQuery](./SearchQuery.md)                     | Query builder types and interfaces                                                    |
| [SearchResult](./search-result.md)                  | Paginated result wrapper returned by `find`, `records.vector_search`, and `ai.search` |
| [Transaction](./transaction.md)                     | ACID transaction handle                                                               |
