---
format: "md"
title: "Facets"
sidebar_position: 10
custom_edit_url: "https://github.com/rush-db/rushdb/edit/main/docs/manual/query/facets.md"
---

<!-- Generated from docs/manual/query/facets.md in the RushDB engine repository by scripts/sync-engine-manual.mjs. Edit it there. -->

# Facets

Facets answer "what is in this result set?": which labels the matching
records carry, which properties they have and with what types, which values
a property takes and how often, and how the records are connected. In RushDB
every facet takes the **same query document** as a records search, so the
facet counts always describe exactly the records the search would return.
This page shows each facet request and how narrowing works.

## The facet requests

| Request | Returns |
|---|---|
| `describe.labels` | Label names present in the match set. |
| `describe.properties` | Property entries: name, type, number of records carrying it, array shape, samples, min/max. |
| `describe.schema` | Labels with record counts, property entries, and relationship shapes, from one match set. |
| `query.propertyValues` | Distinct values of one property: the list, an exact distinct count, the min/max range, or the most frequent values with counts. |

Each one takes a `query` with `labels` and `predicate`
([Filtering](filtering.md) syntax). `select`, `groupBy`, `order` and
pagination fields in that document do not affect facets.

## Narrowing by the query document

Without a `predicate`, facets are answered from maintained catalogs (label
counters, property support counts, per-label value dictionaries), so their
cost does not depend on the number of records. With a `predicate`, RushDB
resolves the matching records once and counts labels, properties, values
and relationships over that match set, without building record JSON.

A typical faceted-search page sends the same document to a listing and to
the facets:

```bash
QUERY='{ "labels": ["Person"], "predicate": { "city": "Riga" } }'

# The page of results
curl -s http://127.0.0.1:3000/protocol/v1/execute \
  -H "Authorization: Bearer $RUSHDB_TOKEN" -H "Content-Type: application/json" \
  -d "{\"protocolVersion\":1,\"operation\":{\"kind\":\"query\",\"query\":{\"kind\":\"records\",\"query\":$QUERY}}}"

# Distinct ages of exactly those records, most frequent first
curl -s http://127.0.0.1:3000/protocol/v1/execute \
  -H "Authorization: Bearer $RUSHDB_TOKEN" -H "Content-Type: application/json" \
  -d "{\"protocolVersion\":1,\"operation\":{\"kind\":\"query\",\"query\":{\"kind\":\"propertyValues\",\"property\":\"age\",\"mode\":\"topK\",\"limit\":5,\"query\":$QUERY}}}"
```

Counts cover the whole match set (not a page of it), so their cost is linear
in the number of matching records. The match set is bounded by the per-query
working-set budget: a match set that does not fit fails with
`resource_exhausted`; a facet never returns a partial count. A predicate on a
property with a declared ordered index is resolved from the index (see
[Indexes](../indexes-and-search/indexes.md)).

## Labels

```json
{
  "protocolVersion": 1,
  "operation": {
    "kind": "describe",
    "describe": { "kind": "labels", "query": { "predicate": { "city": "Riga" } } }
  }
}
```

```json
{ "kind": "labels", "labels": ["Company", "Person"] }
```

| Query | Labels returned |
|---|---|
| No `labels`, no `predicate` | Every label in the tenant. |
| `labels`, no `predicate` | The requested labels that currently have records. |
| With `predicate` | Labels of the matching records. |

For per-label record counts, use `describe.schema`.

## Properties

```json
{
  "kind": "describe",
  "describe": {
    "kind": "properties",
    "query": { "labels": ["Person"] },
    "detail": "catalog",
    "skip": 0,
    "limit": 50
  }
}
```

| Field | Default | Meaning |
|---|---|---|
| `query` | — | The query document. |
| `detail` | `full` | `full` adds `sampleValues` and `min`/`max` (an unfiltered request samples up to 10,000 records for these; counts stay exact). `catalog` returns names, types, exact counts, array shape and type-split markers from catalogs only, without reading records, and rejects a non-empty `predicate`. |
| `skip`, `limit` | all | Slice of the returned property entries. |

Each entry:

| Field | Meaning |
|---|---|
| `id` | Stable property id. |
| `name` | Property name. |
| `type` | `string`, `number`, `boolean`, or `datetime`. |
| `recordsCount` | Number of records that carry the property. |
| `label` | The label the entry was counted on, when reported per label. |
| `isArray` | Some occurrence is stored as an array. |
| `siblingTypes` | Other stored types for the same property name (for example, a property written both as a string and as a number); empty when there is one type. |
| `sampleValues` | A bounded set of distinct observed values (`full` only). |
| `min`, `max` | Smallest and largest observed scalar values (`full` only). |

## Schema

`describe.schema` returns all three facets from one match set:

```json
{
  "kind": "describe",
  "describe": { "kind": "schema", "query": { "labels": ["Person"], "predicate": { "age": { "$gte": 30 } } } }
}
```

```json
{
  "kind": "schema",
  "schema": {
    "labels": [{ "name": "Person", "recordsCount": 3 }],
    "properties": [{ "id": "…", "name": "age", "type": "number", "recordsCount": 3, "isArray": false }],
    "relationships": [
      { "sourceLabel": "Person", "targetLabel": "Company", "type": "WORKS_AT", "count": 3,
        "properties": [{ "name": "since", "type": "number", "relationshipsCount": 3 }] }
    ]
  }
}
```

`describe.schema` also accepts `detail`, `skip` and `limit` for its property
entries.

### Relationship shapes

Relationship shapes are grouped by `(sourceLabel, type, targetLabel)` with
an exact `count` and the properties observed on those relationships. Property
counts are per shape too: two shapes of the same type each list only the
properties their own relationships carry, so the unfiltered catalog and a
filtered read agree.

| Query | Shapes returned |
|---|---|
| No `labels`, no `predicate` | Every shape, from the relationship catalog. |
| `labels`, no `predicate` | Catalog shapes whose source or target label is one of the requested labels. |
| With `predicate` | Every relationship with at least one endpoint in the match set, each counted once. |

> **Tip:** When you need only relationship counts, use `describe.schema`
> rather than listing relationships with `query.relationships`: the schema
> facet reads the catalog instead of walking relationships.

## Property values

```bash
curl -s http://127.0.0.1:3000/protocol/v1/execute \
  -H "Authorization: Bearer $RUSHDB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "protocolVersion": 1,
    "operation": {
      "kind": "query",
      "query": {
        "kind": "propertyValues",
        "property": "city",
        "mode": "topK",
        "limit": 3,
        "query": { "labels": ["Person"] }
      }
    }
  }'
```

```json
{
  "kind": "propertyValues",
  "property": "city",
  "values": ["Riga", "Oslo"],
  "distinctCount": 2,
  "counts": [2, 1]
}
```

| `mode` | Response fields | Notes |
|---|---|---|
| `values` (default) | `values`, `distinctCount`, `truncated` | Distinct values. `limit` caps `values`; `truncated` is `true` when it did. |
| `count` | `distinctCount` | Exact number of distinct values. |
| `range` | `min`, `max`, `distinctCount` | Exact extremes; numbers compare numerically, other values lexically. Absent when there are no comparable values. |
| `topK` | `values`, `counts`, `distinctCount` | The `limit` most frequent values (default 10, at most 1,000) with the number of records carrying each, most frequent first. |

`distinctCount` is always exact and reflects every distinct value, even when
`values` is truncated. Array-valued properties contribute each element.

## Facets and data-access policies

When a tenant runs with an enforced data-access policy, `describe.labels`,
`describe.properties`, `describe.schema` and `describe.explain` are refused
with `unauthorized`; `query.propertyValues` remains available and counts
only records the policy allows. See [Security](../operations/security.md).

## See also

- [Schema catalog](../data-model/schema-catalog.md)
- [Search queries](search-queries.md)
- [Filtering](filtering.md)
- [Aggregations](aggregations.md)
- [Indexes](../indexes-and-search/indexes.md)
