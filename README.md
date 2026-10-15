<p align="center">
  <a href="https://docs.rushdb.com">
    <img src="./static/img/favicon.svg" width="96" height="96" alt="RushDB logo" />
  </a>
</p>

<h1 align="center">RushDB Documentation</h1>

<p align="center">
  The source of truth for <a href="https://docs.rushdb.com">docs.rushdb.com</a>—from your first record to production graph infrastructure and durable agent memory.
</p>

<p align="center">
  <a href="https://docs.rushdb.com/get-started/quick-tutorial"><strong>Quick start</strong></a>
  ·
  <a href="https://docs.rushdb.com/learn/records-and-queries"><strong>Learn RushDB</strong></a>
  ·
  <a href="https://docs.rushdb.com/connect"><strong>Connect tools</strong></a>
  ·
  <a href="https://docs.rushdb.com/deploy/local-hosting"><strong>Deploy</strong></a>
</p>

<p align="center">
  <img alt="Docusaurus 3" src="https://img.shields.io/badge/Docusaurus-3.x-3ECC5F?logo=docusaurus&logoColor=white" />
  <img alt="Node.js 20 through 26" src="https://img.shields.io/badge/Node.js-20%20to%2026-339933?logo=nodedotjs&logoColor=white" />
  <img alt="pnpm 10" src="https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white" />
  <a href="./LICENSE"><img alt="Apache 2.0 license" src="https://img.shields.io/badge/License-Apache--2.0-blue" /></a>
</p>

This repository contains the official documentation for RushDB: a property-centric Labeled Meta Property Graph (LMPG) database and memory layer for modern applications and AI agents. It covers RushDB Cloud and self-hosting, TypeScript and Python SDKs, the REST API, MCP and agent integrations, records and relationships, structured queries, semantic search, and production operations.

## Explore the documentation

| Section                                                           | What you will find                                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [Quick start](https://docs.rushdb.com/get-started/quick-tutorial) | The shortest path from an API key to storing and querying data.                                                                   |
| [Learn](https://docs.rushdb.com/learn/records-and-queries)        | Core graph concepts, records, relationships, SearchQuery, semantic search, agent memory, API references, and practical tutorials. |
| [Connect](https://docs.rushdb.com/connect)                        | SDKs, REST, MCP, agent skills, and native OpenClaw and Hermes memory integrations.                                                |
| [Deploy](https://docs.rushdb.com/deploy/local-hosting)            | Docker, source and Helm installation, cloud hosting, infrastructure, configuration, security, backup, and troubleshooting.        |
| [RushDB Cloud](https://docs.rushdb.com/rushdb-cloud)              | Billing, project isolation, licensing, services, and managed-versus-self-hosted guidance.                                         |

The site includes local full-text search, responsive navigation, Mermaid diagrams, syntax-highlighted examples, reusable MDX components, raw page sources, and machine-readable documentation indexes for agents and LLM tooling.

## Local development

Requirements:

- Node.js 20–26
- pnpm 10

Install the locked dependency graph and start the development server:

```bash
pnpm install --frozen-lockfile
pnpm start
```

Docusaurus serves the site at `http://localhost:3000` with live reload.

Before opening a pull request, run the high-signal checks for a production-ready site:

```bash
pnpm types:check
pnpm build
```

To inspect the production output locally:

```bash
pnpm serve
```

`pnpm build` validates document routes, fails on broken Docusaurus links, warns on broken Markdown links, builds the local search index, copies raw documentation sources, and generates the `llms*.txt` files under `build/`.

## Documentation versions

The repository serves both documentation generations at once. The default generation owns `/`; the other is available at `/<version>/`.

- `docs/` and `sidebars.ts` contain the current 2.x, Neo4j-backed documentation.
- `docs-v3/` and `sidebars.v3.ts` contain the 3.x documentation: RushDB on its own engine, used through RushDB Cloud or self-hosted.
- [docs-versioning.ts](docs-versioning.ts) contains `DEFAULT_DOCS_VERSION`. Change its value from `'2.x'` to `'3.x'` when 3.x is ready to own `/`. The route base, sidebars, version switcher, legacy redirects, and generated LLMS content follow that one value.

### The 3.x tree

| Path in `docs-v3/` | Content | Source |
| --- | --- | --- |
| `index.mdx`, `get-started/`, `deploy.mdx` | Overview, choosing Cloud or self-hosting, quick tutorial, distribution channels | This repository |
| `connect/` | SDKs (Cloud and direct mode), MCP, skills, agent memory integrations | This repository |
| `learn/` | Records, SearchQuery, relationships, keyword/semantic/hybrid search, agent memory, tutorials, SDK/MCP/REST references | This repository |
| `rushdb-cloud/` | What RushDB Cloud adds, API keys, projects | This repository |
| `migration/` | Moving from 2.x | This repository |
| `engine/` | The engine manual: install, data model, query languages, connectivity, indexes, operations, architecture, reference | **Generated** from `docs/manual` in the engine repository |

Never edit `docs-v3/engine/` here. Edit the manual in the engine repository, then copy it in:

```bash
pnpm sync:engine-manual            # reads ../rust-rushdb by default; pass another path as an argument
pnpm check:engine-manual           # fails if docs-v3/engine is stale
```

In 3.x pages, link to other pages with relative file paths (`../learn/semantic-search/hybrid-search.mdx`), so links keep working whichever version owns `/`. Mark Cloud-only features as such, and say what a self-hosted engine offers instead.

Keep a 2.x page self-contained. When it uses a root-relative link inside a reusable MDX component, use `docsPathForVersion('2.x', '/path')` so the link remains inside `/2.x/` after the default changes.

## Authoring documentation

1. Add or update a `.md` or `.mdx` file under `docs/` for 2.x or `docs-v3/` for 3.x.
2. Give the page concise `title` and `description` front matter.
3. Register new navigation entries in `sidebars.ts` for 2.x or `sidebars.v3.ts` for 3.x; both sidebars are intentionally curated rather than autogenerated.
4. Use root-relative links for documentation routes, such as `/learn/semantic-search`, and `/img/...` paths for assets under `static/img/`.
5. When moving a published page, add its legacy URL to `redirects-migration.ts`.
6. Run `pnpm types:check` and `pnpm build` before submitting the change. For 3.x, also run `pnpm check:v3-content` (rejects 2.x claims in 3.x pages) and `pnpm verify:v3-quickstart` (runs the Quick Tutorial against a local engine; set `RUSHDB_BIN` to a `rushdb` binary).

Prefer a focused example that readers can run over an exhaustive abstract explanation. State prerequisites before commands, keep terminology consistent with the SDKs and REST API, and distinguish RushDB Cloud behavior from self-hosted behavior whenever they differ.

## Repository map

| Path                     | Purpose                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `docs/`                  | 2.x documentation source pages, organized by public route.                     |
| `docs-v3/`               | 3.x documentation source pages; `docs-v3/engine/` is generated.                |
| `sidebars.ts`            | Curated 2.x navigation hierarchy and sidebar icons.                            |
| `sidebars.v3.ts`         | Curated 3.x navigation hierarchy.                                              |
| `docs-versioning.ts`     | Default version, per-version paths and sidebars, unpublished pages.            |
| `scripts/`               | Engine-manual sync, 3.x content check, and Quick Tutorial verification.        |
| `static/`                | Images, favicons, social cards, and other directly served assets.              |
| `src/components/`        | Reusable MDX and documentation UI components.                                  |
| `src/theme/`             | Swizzled Docusaurus theme components and navigation behavior.                  |
| `src/css/custom.css`     | RushDB documentation theme and responsive styling.                             |
| `plugins/`               | Local Docusaurus plugins for tutorials and Tailwind processing.                |
| `redirects-migration.ts` | Redirects that preserve previously published URLs.                             |
| `docusaurus.config.ts`   | Site metadata, search, redirects, raw-source export, and LLM-index generation. |

Generated directories—`build/` and `.docusaurus/`—are intentionally ignored and should not be edited or committed.

## Production output

The site is configured for `https://docs.rushdb.com` at the root path. A production build writes the deployable static site to `build/`, including:

- HTML, assets, sitemap, and the local search index;
- original page sources under `build/raw-docs/`;
- `llms.txt` and section-specific compact indexes;
- `llms-full.txt` and section-specific full-content bundles.

Publish the contents of `build/` with the static hosting platform used for `docs.rushdb.com`.

## Related projects

- [RushDB](https://github.com/rush-db/rushdb) — the RushDB 3 engine (`rushdb`) and its manual
- [RushDB JavaScript SDK](https://github.com/rush-db/javascript-sdk) — `@rushdb/javascript-sdk`
- [RushDB Python](https://github.com/rush-db/rushdb-python) — Python SDK
- [RushDB MCP Server](https://github.com/rush-db/mcp-server) — `@rushdb/mcp-server`
- [RushDB Skills](https://github.com/rush-db/skills) — Agent Skills
- [RushDB Agent Memory Contract](https://github.com/rush-db/agent-memory-contract) — shared agent-memory protocol
- [RushDB OpenClaw Memory](https://github.com/rush-db/rushdb-openclaw-memory) — native OpenClaw memory integration
- [RushDB Hermes Memory](https://github.com/rush-db/rushdb-hermes-memory) — native Hermes Agent memory provider

## License

Apache-2.0. See [LICENSE](./LICENSE).
