---
name: rushdb-docs-page
description: Step-by-step playbook for adding, moving or rewriting a page in the RushDB docs (docs/ for 3.x, v2/ for 2.x). Use whenever a task adds or changes documentation content, a sidebar entry, code samples, tabs or callouts, so the page follows the docs doctrine instead of improvising.
---

# Adding or changing a docs page

The rules live in `AGENTS.md` (decision table, content rules) and `DESIGN.md` (how things look). This skill is the order of work.

## 1. Place the page

- 3.x pages go under `docs/`, 2.x (legacy, security fixes only) under `v2/`. Never edit `docs/engine/`: it is generated from the engine repository (`pnpm sync:engine-manual`).
- Pick the section by the reader's task: Get started, Connect, Learn, RushDB Cloud. Keep the sidebar at three levels or fewer.
- Moving a published page: avoid it. The site has no redirects, so the old URL becomes a 404; update every link to it.

## 2. Front matter and title

```md
---
title: Store records
description: Create, upsert, update and delete records with the SDKs and the REST API.
---
```

- Sentence case for `title`, headings and `sidebar_label`; product and type names keep their case.
- `description` is one sentence; it feeds search snippets, social cards and `llms.txt`.

## 3. Write the page

- Open with what the page lets the reader do, then the task, then the explanation.
- Code in several languages: `import Tabs from '@site/src/components/LanguageTabs'` and `import TabItem from '@theme/TabItem'`; values `python`, `typescript`, `javascript`, `shell`. The component sets labels and order.
- Fences use canonical languages (`bash`, `python`, `typescript`, `javascript`, `json`, `yaml`, `sql`, `cypher`, `http`, `text`); add `title="path/file.ts"` for files.
- Callouts: `:::note`, `:::tip`, `:::warning`, `:::danger`. No `> **Note:**` blockquotes.
- Options and fields: a Markdown table.
- Link other 3.x pages with relative file paths (`../learn/search-query/where-operators.md`).
- Mark Cloud-only features as such and say what a self-hosted engine offers instead.
- End with `## Next steps` (guides) or `## See also` (references).

## 4. Register it

- Add it to `sidebars.v3.ts` (or `sidebars.ts` for 2.x). Both sidebars are curated.

## 5. Check it

```bash
pnpm check:v3-content   # 3.x: no 2.x claims
pnpm lint:design        # tabs, fences, callouts, sentence case, styles
pnpm build              # broken links fail the build
```

Look at the page with `pnpm start` in light and dark, at desktop and phone width. For copy review, use the `ux-writing`, `plain-writing` and `stop-slop` skills.
