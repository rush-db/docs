---
sidebar_position: 7
---

# Keyword Search

BM25 keyword search over text indexes. See [Keyword Search](../../semantic-search/keyword-search.mdx) for the concepts, consistency modes and query syntax.

## List text indexes

`GET /api/v1/text-indexes`

```bash
curl https://api.rushdb.com/api/v1/text-indexes \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

```json
{
  "data": [
    {
      "name": "Article.body.text",
      "label": "Article",
      "property": "body",
      "consistency": "eventual",
      "status": "ready",
      "pending": 0
    }
  ],
  "success": true
}
```

## Create a text index

`POST /api/v1/text-indexes`

| Field         | Type   | Required | Description                                                                              |
| ------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| `label`       | string | **yes**  | Label of the records to index.                                                           |
| `property`    | string | **yes**  | A property name, or `*` for every string of the record.                                  |
| `name`        | string | no       | Unique within the project. Defaults to `<label>.<property>.text` (`all` in place of `*`). |
| `consistency` | string | no       | `"eventual"` (default) or `"immediate"`.                                                 |

```bash
curl -X POST https://api.rushdb.com/api/v1/text-indexes \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"label": "Article", "property": "body"}'
```

The index is built online: `status` is `building` until it turns `ready`.

`POST /api/v1/text-indexes/name-suggestion` with `label` and `property` returns `{ "name": ... }`, the default name a new index would get.

## Drop a text index

`DELETE /api/v1/text-indexes/:name`

```bash
curl -X DELETE https://api.rushdb.com/api/v1/text-indexes/Article.body.text \
  -H "Authorization: Bearer $RUSHDB_API_KEY"
```

## Search

`POST /api/v1/search/text`

| Field      | Type             | Required | Description                                                               |
| ---------- | ---------------- | -------- | ------------------------------------------------------------------------- |
| `query`    | string           | **yes**  | Keywords; a blank query matches nothing.                                  |
| `index`    | string           | no       | The text index, by name. Otherwise the one ready text index of the first label. |
| `property` | string           | no       | Narrows the choice of text index to one over this property.               |
| `labels`   | array of strings | no       | Labels to search within.                                                  |
| `where`    | object           | no       | Filter applied **before** ranking.                                        |
| `skip`     | number           | no       | Results to skip (default `0`).                                            |
| `limit`    | number           | no       | Maximum results (default `10`).                                           |
| `allTerms` | boolean          | no       | Every unmarked keyword must match.                                        |
| `phrase`   | boolean          | no       | Match the keywords as one phrase.                                         |

```bash
curl -X POST https://api.rushdb.com/api/v1/search/text \
  -H "Authorization: Bearer $RUSHDB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "graph database", "labels": ["Article"], "limit": 10}'
```

```json
{
  "data": [
    { "__id": "0192f0c4-7a1e-7b8a-9c3d-2f6e5a4b3c21", "__label": "Article", "__score": 2.41, "title": "Graph databases explained" }
  ],
  "total": 1,
  "meta": { "textSearch": { "matches": 1, "pending": 0 } },
  "success": true
}
```

`total` counts every match, not only the page. `meta.textSearch.pending` is how many changes the index had not applied when the search ran.
