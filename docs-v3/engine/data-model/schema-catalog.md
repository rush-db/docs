---
format: "md"
title: "Schema catalog"
sidebar_position: 5
custom_edit_url: "https://github.com/rush-db/rushdb/edit/main/docs/manual/data-model/schema-catalog.md"
---

<!-- Generated from docs/manual/data-model/schema-catalog.md in the RushDB engine repository by scripts/sync-engine-manual.mjs. Edit it there. -->

# Schema catalog

This page describes the schema catalog: the exact, continuously maintained
record of which labels, properties, types and relationship shapes exist in a
tenant, and the `describe` and `propertyValues` operations that read it. It
is for developers building schema-aware tools (form builders, query builders,
AI agents that need to know what data exists) and for anyone exploring an
unfamiliar dataset. The `rdb` helper used in the examples is defined in the
[Quickstart](../getting-started/quickstart.md#1-install-and-start-a-node).

## An emergent schema

RushDB has no `CREATE TABLE` and no schema declaration. Instead, every commit
updates a catalog as a side effect of the write:

| The catalog records | For example |
|---|---|
| Every label and how many records carry it | `Person: 3`, `Company: 1` |
| Every property, per type, with how many records carry it | `born` (number) on 3 records; a property only ever set to `null` has type `null` |
| Whether a property holds arrays | `languages` is an array property |
| Properties whose name exists with several types | `code` as both string and number |
| Value dictionaries per label and property | distinct values of `status`, with counts |
| Every relationship shape with its count and properties | `Person -INFLUENCED-> Person: 2` |

Because the catalog is maintained on every commit, reading it does not scan
your records. Counts are exact, never estimates.

## List labels

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"describe","describe":{
  "kind":"labels","query":{}}}}'
```

```json
{"protocolVersion":1,"response":{"kind":"labels","labels":["Person","Company","address","department"]}}
```

## Describe the whole schema

`describe.schema` returns labels with record counts, properties and
relationship shapes in one response:

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"describe","describe":{
  "kind":"schema","query":{},"detail":"catalog"}}}'
```

```json
{
  "protocolVersion": 1,
  "response": {
    "kind": "schema",
    "schema": {
      "labels": [
        { "name": "Person", "recordsCount": 3 },
        { "name": "Company", "recordsCount": 1 }
      ],
      "properties": [
        { "id": "p…", "name": "born", "type": "number", "recordsCount": 3, "isArray": false }
      ],
      "relationships": [
        { "sourceLabel": "Person", "targetLabel": "Person", "type": "INFLUENCED", "count": 2,
          "properties": [ { "name": "via", "type": "string", "relationshipsCount": 2 } ] }
      ]
    }
  }
}
```

The request takes:

| Field | Meaning |
|---|---|
| `query` | A query document (`labels`, `predicate`) that scopes the description. `{}` describes the whole tenant. |
| `detail` | `"full"` (default) adds sample values and min/max per property; `"catalog"` returns only catalog facts and never reads records. |
| `skip`, `limit` | Paginate the `properties` list. |

## Properties

`describe.properties` returns the property list on its own:

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"describe","describe":{
  "kind":"properties","query":{"labels":["Person"]}}}}'
```

Each entry has:

| Field | Meaning |
|---|---|
| `id` | A stable property id (`p` followed by 16 hex digits), usable in place of the name in `propertyValues`. Ids are local to the tenant. |
| `name` | The normalised property name (see [Property names](properties-and-types.md#property-names)). |
| `type` | Display type: `string`, `number`, `boolean` or `datetime`. |
| `recordsCount` | Exact number of records carrying the property. |
| `isArray` | `true` when the property holds arrays. |
| `siblingTypes` | Present when the same name also exists with other display types; lists those types by logical name (`int64`, `float64`, `utf8`, `boolean`, `datetime`). Integers and floats are both `number`, so they are never each other's sibling. |
| `label` | The label the entry was observed on, when the response is broken down per label. |
| `sampleValues`, `min`, `max` | With `detail: "full"`: a bounded set of distinct values and the observed range. Unfiltered requests sample up to 10,000 records for these; counts stay exact. |

A property name stored with several types appears once per display type
(per label when broken down by label); integers and floats are one `number`
entry with their combined count. A client
that caches property types should treat a non-empty `siblingTypes` as a sign
that one cached type does not cover every record.

> **Note:** `detail: "catalog"` cannot be combined with a non-empty
> `predicate`; drop the predicate or use the default `full` detail.

## Relationship shapes

The `relationships` part of `describe.schema` aggregates edges by
`(sourceLabel, type, targetLabel)`:

| Field | Meaning |
|---|---|
| `sourceLabel`, `targetLabel` | Labels of the endpoints. |
| `type` | Relationship type. |
| `count` | Number of relationships with this shape. |
| `properties` | Each property carried by relationships of this shape, with its display type and `relationshipsCount` (relationships of this shape that carry it). |

This is the cheapest way to answer "how are my labels connected?". Use the
`relationships` query only when you need the individual edges; see
[Relationships](relationships.md#list-relationships).

## Narrowing with a predicate

`describe.labels`, `describe.properties`, `describe.schema` and
`propertyValues` all accept the same query document as a records query. A
`labels` list or `predicate` narrows every count to the matching records:

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"describe","describe":{
  "kind":"schema","query":{"labels":["Person"],"predicate":{"born":{"$gte":1900}}}}}}'
```

Without a predicate the answer comes straight from the catalog, independent
of data size. With a predicate the engine first finds the matching records,
then counts labels, properties and relationship shapes over that set — a cost
that grows with the number of matches and is bounded by the request's memory
budget (a request that would exceed it fails with `resource_exhausted` rather
than returning a partial count). A relationship shape is counted when at
least one endpoint is in the match set. This is how faceted search UIs are
built; see [Facets](../query/facets.md).

## Property values

`propertyValues` reads the value domain of one property:

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"query","query":{
  "kind":"propertyValues","property":"languages","mode":"topK","limit":5,
  "query":{"labels":["Person"]}}}}'
```

| `mode` | Returns |
|---|---|
| `values` (default) | Distinct values; `limit` caps how many are shipped, `truncated` says whether it did. |
| `count` | `distinctCount` only. |
| `range` | `min` and `max` only (numeric order for numbers, lexical order otherwise). |
| `topK` | The `limit` most frequent values, with record counts in `counts`. |

`distinctCount` is always exact and untruncated. With an empty predicate the
answer comes from the per-label value dictionaries.

## Remove a property everywhere

`deleteProperty` removes a property from the whole tenant: every value of
it, in every type, and its catalog entries. Use it to clean up a misspelled or
retired field.

```bash
rdb '{"protocolVersion":1,"operation":{"kind":"mutate","mutation":{
  "kind":"deleteProperty","name":"nickname"}}}'
```

`name` is matched by its normalised form. The response reports, as
`affected`, how many owners (records or relationships) carried the property.
Naming a property that does not exist is an error.

A property name used both on records and on relationships is two separate
properties; one call removes one of them. Repeat the call until it reports
that the property does not exist to remove both.

> **Warning:** `deleteProperty` is tenant-wide and cannot be undone. To remove
> a property from a single record, `replace` the record without it.

## See also

- [Properties and types](properties-and-types.md)
- [Facets](../query/facets.md)
- [Aggregations](../query/aggregations.md)
- [Derived state](../architecture/derived-state.md) — how the catalog is
  maintained
