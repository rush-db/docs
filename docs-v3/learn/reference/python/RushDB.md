---
sidebar_position: 0
---

# RushDB

The `RushDB` class is the main entry point for interacting with RushDB from Python. It manages authentication, HTTP communication, and exposes all API namespaces.

## Initialization

```python
from rushdb import RushDB

# Connect to RushDB Cloud
db = RushDB("RUSHDB_API_KEY")

# Connect to a self-hosted engine (direct mode)
db = RushDB(
    "ENGINE_TOKEN",
    direct=True,
    engine_url="http://127.0.0.1:3000",
)
```

## Constructor

```python
RushDB(
    api_key: str,
    base_url: Optional[str] = None,
    url: Optional[str] = None,
    direct: bool = False,
    engine_url: Optional[str] = None,
    engine_token: Optional[str] = None,
    scope: Optional[str] = None,
)
```

| Parameter  | Type  | Description                                                                                                                                                         |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`      | `str`  | A RushDB Cloud API key, or the engine token in direct mode                                                                                                  |
| `url`          | `str`  | A RushDB Cloud API endpoint other than the default. When provided without `/api/`, the path `/api/v1` is appended automatically. Defaults to `https://api.rushdb.com/api/v1` |
| `base_url`     | `str`  | Deprecated alias for `url`                                                                                                                                  |
| `direct`       | `bool` | Talk to a self-hosted RushDB engine instead of RushDB Cloud. Methods in `CLOUD_ONLY_METHODS` raise `CloudOnlyError` before sending anything            |
| `engine_url`   | `str`  | The engine's base URL, e.g. `http://127.0.0.1:3000`. Required when `direct=True`                                                                            |
| `engine_token` | `str`  | The engine token, when it differs from `api_key`                                                                                                            |
| `scope`        | `str`  | The tenant, on an engine started with `--multitenant`                                                                                                       |

In direct mode, `db.engine.execute()` runs any [Protocol v1](../../../engine/connectivity/http-api.md) operation.

## Namespaces

All database operations are accessed through sub-namespaces on the client instance.

### `db.records`

CRUD and bulk operations on records.

| Method                                                                    | Description                                                                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create(label, data, *, options, vectors, transaction)`                   | Create a single record                                                                                                                                      |
| `create_many(label, data, *, options, vectors, transaction)`              | Create multiple flat records. `vectors` accepts both a flat list of dicts (one per row, auto-wrapped) and a nested list of lists (explicit per-row entries) |
| `import_json(data, label, *, options, transaction)`                       | Import nested/complex JSON payloads; `label` may be omitted for container objects whose top-level values are objects or arrays of nested records            |
| `import_csv(label, data, *, options, parse_config, vectors, transaction)` | Import records from CSV text                                                                                                                                |
| `upsert(data, label, *, options, vectors, transaction)`                   | Create or update a record                                                                                                                                   |
| `set(target, data, *, label, vectors, transaction)`                       | Replace all fields of a record                                                                                                                              |
| `update(target, data, *, transaction)`                                    | Partially update a record                                                                                                                                   |
| `find(search_query, *, record_id, transaction)`                           | Search records; returns `SearchResult`                                                                                                                      |
| `find_one(search_query, *, transaction)`                                  | Return the first match or `None`                                                                                                                            |
| `find_uniq(search_query, *, transaction)`                                 | Return the single match or `None`; raises if more than one                                                                                                  |
| `find_by_id(target, *, transaction)`                                      | Fetch record(s) by ID                                                                                                                                       |
| `delete(search_query, *, transaction)`                                    | Delete all records matching a query                                                                                                                         |
| `delete_by_id(target, *, transaction)`                                    | Delete record(s) by ID                                                                                                                                      |
| `attach(source, target, *, options, transaction)`                         | Create relationships between records                                                                                                                        |
| `detach(source, target, *, options, transaction)`                         | Remove relationships between records                                                                                                                        |
| `export(search_query, *, transaction)`                                    | Export matching records as CSV text                                                                                                                         |
| `vector_search(params, transaction)` | Vector search over an embedding index; add `text` for a hybrid search. See [Semantic Search](../../semantic-search/semantic-search.mdx) |
| `text_search(params, transaction)` | Keyword (BM25) search over a text index. See [Keyword Search](../../semantic-search/keyword-search.mdx) |

### `db.tx`

Transaction lifecycle management.

| Method                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `begin(ttl)`            | Start a new transaction; returns `Transaction` |
| `get(transaction)`      | Retrieve an existing transaction by ID         |
| `commit(transaction)`   | Commit a transaction by object or ID           |
| `rollback(transaction)` | Roll back a transaction by object or ID        |

See also: [Transaction](./transaction.md) for the `commit()` / `rollback()` instance methods and context manager usage.

### `db.labels`

Discover record labels in the database.

| Method                               | Description                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `find(search_query, *, transaction)` | Return a dict of `{label: count}` matching the query |

### `db.properties`

Inspect property metadata.

| Method                                                   | Description                          |
| -------------------------------------------------------- | ------------------------------------ |
| `find(search_query, *, transaction)`                     | List all properties matching a query |
| `find_by_id(property_id, *, transaction)`                | Retrieve a property by ID            |
| `delete(property_id, *, transaction)`                    | Delete a property by ID              |
| `find_values(property_id, *, search_query, transaction)` | List distinct values for a property  |

### `db.relationships`

Query relationships, bulk-create them, and review inferred relationship patterns.

| Method                                                                       | Description                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `find(search_query, *, pagination, transaction)`                             | Search relationships; returns `List[Relationship]`          |
| `create_many(*, source, target, type, direction, many_to_many, transaction)` | Bulk-create relationships by key-match or cartesian product |

#### `db.relationships.patterns`

Review and manage relationship patterns inferred from the project schema. See [Relationship Patterns](./relationship-patterns.md) for the full review flow.

| Method                                         | Description                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `list()`                                       | List saved patterns, schema relationships, and analysis status         |
| `analyze()`                                    | Queue schema analysis to generate suggestions                          |
| `approve(pattern_id)`                          | Approve a suggestion and apply its relationships                       |
| `ignore(pattern_id)`                           | Ignore a suggestion without applying it                                |
| `delete(pattern_id, *, delete_existing=False)` | Delete a saved pattern, optionally removing materialized relationships |

### `db.ai`

Schema exploration and natural-language search. Embedding index management is available under `db.ai.indexes`; vector search is `db.records.vector_search`.

| Method                                        | Description                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `search(prompt, current_query, transaction)` | Natural-language search: turns the prompt into a SearchQuery and runs it. RushDB Cloud only |
| `get_schema(params, *, transaction)`          | Return the full graph schema as structured JSON                         |
| `get_schema_markdown(params, *, transaction)` | Return the schema as compact Markdown (token-efficient, for LLMs)       |

#### `db.ai.indexes`

| Method                             | Description                                           |
| ---------------------------------- | ----------------------------------------------------- |
| `find()`                           | List all embedding index policies                     |
| `create(params)`                   | Create a new embedding index for a property           |
| `delete(index_id)`                 | Delete an embedding index by ID                       |
| `stats(index_id)`                  | Get how many records an index covers and has vectors for |
| `upsert_vectors(index_id, params)` | Bulk-seed an external index with pre-computed vectors |

### `db.text_indexes`

BM25 text indexes, used by `records.text_search` and the keyword leg of a hybrid search.

| Method                | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `find()`              | List text indexes with their `status` and `pending` changes     |
| `create(params)`      | Declare a text index: `label`, `property` (or `*`), optional `name` and `consistency` |
| `suggest_name(params)` | The default name a new text index would get                    |
| `delete(name)`        | Drop a text index by name                                       |

### `db.query`

Raw openCypher statements, run by the engine. On a self-hosted engine, start it with `--languages cypher`.

| Method                      | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| `raw(body, *, transaction)` | Execute a raw Cypher query string with optional parameters |

### `db.settings`

Project configuration.

| Method  | Description                           |
| ------- | ------------------------------------- |
| `get()` | Retrieve the current project settings |

## Instance Methods

### `ping()`

```python
def ping() -> bool
```

Tests connectivity to the RushDB server. Returns `True` if the server is reachable, `False` otherwise. Safe to use in conditional checks — never raises.

```python
if db.ping():
    print("Connected")
else:
    raise RuntimeError("Cannot reach RushDB server")
```

## Usage Example

```python
from rushdb import RushDB

db = RushDB("RUSHDB_API_KEY")

# Create records
user = db.records.create("User", {"name": "Alice", "email": "alice@example.com"})
post = db.records.create("Post", {"title": "Hello World", "published": True})

# Connect them
db.records.attach(user, post, options={"type": "AUTHORED"})

# Query
results = db.records.find({
    "labels": ["User"],
    "where": {"email": {"$contains": "@example.com"}},
    "limit": 10
})

for record in results:
    print(record["name"])

# Transaction
tx = db.tx.begin(ttl=10000)
try:
    db.records.create("Log", {"event": "login"}, transaction=tx)
    tx.commit()
except Exception:
    tx.rollback()

# Or use the context manager — auto-commits on success, auto-rolls back on error
with db.tx.begin() as tx:
    db.records.create("Log", {"event": "login"}, transaction=tx)
```
