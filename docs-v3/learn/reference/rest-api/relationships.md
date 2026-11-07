---
sidebar_position: 3
---

# Relationships

## Attach

`POST /api/v1/relationships/:entityId`

```bash
# Single target
curl -X POST https://api.rushdb.com/api/v1/relationships/$MOVIE_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"targetIds": "$ACTOR_ID", "type": "STARS_IN", "direction": "out", "properties": {"role": "lead"}}'

# Multiple targets
curl -X POST https://api.rushdb.com/api/v1/relationships/$MOVIE_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"targetIds": ["$ACTOR1_ID", "$ACTOR2_ID"], "type": "STARS_IN"}'
```

| Field        | Type                 | Description                                       |
| ------------ | -------------------- | ------------------------------------------------- |
| `targetIds`  | `string \| string[]` | Target record ID(s)                               |
| `type`       | `string`             | Relationship type. Defaults to `__RUSHDB__RELATION__DEFAULT__` |
| `direction`  | `"in" \| "out"`      | Direction from source to target (`out` = default) |
| `properties` | `object`             | Optional user-defined edge properties             |

## Detach

`PUT /api/v1/relationships/:entityId`

```bash
curl -X PUT https://api.rushdb.com/api/v1/relationships/$MOVIE_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"targetIds": "$ACTOR_ID", "typeOrTypes": ["STARS_IN"]}'
```

| Field         | Type                 | Description                                                         |
| ------------- | -------------------- | ------------------------------------------------------------------- |
| `targetIds`   | `string \| string[]` | Target record ID(s)                                                 |
| `typeOrTypes` | `string \| string[]` | Types to remove. Omit to remove relationships of every type         |
| `direction`   | `"in" \| "out"`      | Direction to remove. Omit to remove relationships pointing either way |

Detach can't run inside a transaction: with `X-Transaction-Id` it returns `400` and rolls the transaction back.


## Update Properties

`PATCH /api/v1/relationships/:entityId`

Changes the properties of existing relationships of one type from `:entityId` to each target. Properties not named in `set` or `unset` are kept; pairs without such a relationship are skipped. Needs RushDB 3.0.4 or newer.

```bash
curl -X PATCH https://api.rushdb.com/api/v1/relationships/$MOVIE_ID \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "targetIds": "$ACTOR_ID",
    "type": "STARS_IN",
    "set": {"billing": 2, "since": "2010-07-16T10:00:00.000Z"},
    "unset": ["scenes"],
    "types": {"since": "datetime"}
  }'
```

| Field       | Type                     | Description                                                                                          |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `targetIds` | `string \| string[]`     | Target record ID(s)                                                                                  |
| `type`      | `string`                 | Relationship type to update                                                                          |
| `direction` | `"in" \| "out"`          | Direction from source to target (`out` = default)                                                    |
| `set`       | `object`                 | Properties to write; `null` stores an explicit null                                                  |
| `unset`     | `string[]`               | Property names to remove                                                                             |
| `types`     | `Record<string, string>` | Type of a `set` property: `string`, `number`, `boolean` or `datetime` (an ISO 8601 string stored as a datetime) |

Returns `{"message": …, "updated": n}` with the number of relationships changed. Like detach, it can't run inside a transaction.


## Bulk Create by Key Match

`POST /api/v1/relationships/create-many`

```bash
curl -X POST https://api.rushdb.com/api/v1/relationships/create-many \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"label": "MOVIE",  "key": "id"},
    "target": {"label": "ACTOR",  "key": "movieId"},
    "type": "STARS_IN",
    "direction": "out",
    "properties": {"source": "imdb", "confidence": 0.98}
  }'
```

| Field        | Type                    | Description                                                                                     |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `source`     | `{label, key?, where?}` | Source selector                                                                                 |
| `target`     | `{label, key?, where?}` | Target selector                                                                                 |
| `type`       | `string`                | Relationship type                                                                               |
| `direction`  | `string`                | `in` or `out`                                                                                   |
| `properties` | `object`                | Shared user-defined properties to write on each created edge                                    |
| `manyToMany` | `boolean`               | Cartesian product mode — requires non-empty `where` on both sides unless join keys are provided |

## Bulk Delete

`POST /api/v1/relationships/delete-many`

Same shape as `create-many`. Omit `type` to delete any type.

```bash
curl -X POST https://api.rushdb.com/api/v1/relationships/delete-many \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"label": "MOVIE", "key": "id"},
    "target": {"label": "ACTOR", "key": "movieId"},
    "type": "STARS_IN"
  }'
```

:::warning
Setting `manyToMany: true` without join keys requires `where` filters on both sides — the cartesian product is otherwise unbounded and the request is rejected. Key joins (`source.key` + `target.key`) never need `where` scoping.
:::

## Search Relationships

`POST /api/v1/relationships/search`

```bash
curl -X POST https://api.rushdb.com/api/v1/relationships/search \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": { "labels": ["MOVIE"], "where": { "title": "Inception" } },
    "target": { "labels": ["ACTOR"], "where": { "country": "USA" } },
    "where": { "type": "STARS_IN", "role": "lead" },
    "limit": 50
  }'
```

`where` filters relationship edges: `type` maps to the relationship type and every other field maps to a user-defined edge property. Use `source` and `target` for endpoint record predicates.

## Suggested Patterns

RushDB can analyze a project's schema and propose relationship patterns for review before applying them. See [Suggested Relationship Patterns](../../relationships/suggested-patterns.mdx) for the lifecycle, SDK examples, and all five REST endpoints.

## Direction

| Value             | Meaning         |
| ----------------- | --------------- |
| `"out"` (default) | source → target |
| `"in"`            | target → source |
