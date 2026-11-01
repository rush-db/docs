<p align="center">
  <a href="https://docs.rushdb.com">
    <img src="./static/img/favicon.svg" width="96" height="96" alt="RushDB logo" />
  </a>
</p>

<h1 align="center">RushDB Documentation</h1>

<p align="center">
  Documentation for RushDB, the database for AI: self-hosted RushDB, RushDB Cloud, SDKs, query languages and protocols. Published at <a href="https://docs.rushdb.com">docs.rushdb.com</a>.
</p>

<p align="center">
  <a href="https://docs.rushdb.com/get-started/quick-tutorial"><strong>Quick start</strong></a>
  ·
  <a href="https://docs.rushdb.com/learn/records-and-queries"><strong>Learn RushDB</strong></a>
  ·
  <a href="https://docs.rushdb.com/connect"><strong>Connect tools</strong></a>
  ·
  <a href="https://docs.rushdb.com/deploy"><strong>Deploy</strong></a>
  ·
  <a href="https://docs.rushdb.com/engine"><strong>Engine manual</strong></a>
</p>

<p align="center">
  <img alt="Docusaurus 3" src="https://img.shields.io/badge/Docusaurus-3.x-3ECC5F?logo=docusaurus&logoColor=white" />
  <img alt="Node.js 20 through 26" src="https://img.shields.io/badge/Node.js-20%20to%2026-339933?logo=nodedotjs&logoColor=white" />
  <img alt="pnpm 10" src="https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white" />
  <a href="./LICENSE"><img alt="Apache 2.0 license" src="https://img.shields.io/badge/License-Apache--2.0-blue" /></a>
</p>

RushDB is the database for AI. It records fields, types and values on every write, so agents can read the schema before they query.

This repository is the source of docs.rushdb.com. RushDB 3.x is served at the root; RushDB 2.x (legacy, Neo4j-based) is served at [`/2.x/`](https://docs.rushdb.com/2.x/get-started/quick-tutorial) and receives security fixes only until 2027-10-28.

## Explore the documentation

| Section                                                           | What you will find                                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [Quick start](https://docs.rushdb.com/get-started/quick-tutorial) | The shortest path from an API key to storing and querying data.                                                                   |
| [Learn](https://docs.rushdb.com/learn/records-and-queries)        | Records, relationships, SearchQuery, keyword, semantic and hybrid search, agent memory, SDK/MCP/REST references, and tutorials.   |
| [Connect](https://docs.rushdb.com/connect)                        | SDKs, SQL and Cypher, MCP, agent skills, and native OpenClaw and Hermes memory integrations.                                      |
| [Deploy](https://docs.rushdb.com/deploy)                          | RushDB Cloud or self-hosted RushDB from a script, Homebrew, Docker, Cargo or a release archive, and taking it to production.      |
| [Engine manual](https://docs.rushdb.com/engine)                   | Install, data model, query languages, connectivity, indexes, operations, architecture and reference for self-hosted RushDB.      |
| [RushDB Cloud](https://docs.rushdb.com/rushdb-cloud)              | What RushDB Cloud adds, API keys and projects.                                                                                    |
| [Migrate from 2.x](https://docs.rushdb.com/migration/from-2x)     | Moving a RushDB 2.x (legacy) project to RushDB 3.                                                                                 |

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

- `docs-v3/` and `sidebars.v3.ts` contain the 3.x documentation, served at `/`: RushDB on its own engine, used through RushDB Cloud or self-hosted.
- `docs/` and `sidebars.ts` contain the RushDB 2.x (legacy, Neo4j-based) documentation, served at `/2.x/` with a legacy banner on every page. `sidebars.v2.ts` prefixes its root-relative links with `/2.x/`.
- [docs-versioning.ts](docs-versioning.ts) contains `DEFAULT_DOCS_VERSION` (`'3.x'`). The route base, sidebars, version switcher, legacy redirects, and generated LLMS content follow that one value.
- [docs-version-redirects.ts](docs-version-redirects.ts) derives redirects from the two file trees, so URLs from before 3.x owned `/` keep working: `/3.x/<path>` → `/<path>`, and an old unversioned 2.x URL with no 3.x page at the same path → `/2.x/<path>`.

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

1. Add or update a `.md` or `.mdx` file under `docs-v3/` for 3.x or `docs/` for 2.x (legacy).
2. Give the page concise `title` and `description` front matter.
3. Register new navigation entries in `sidebars.v3.ts` for 3.x or `sidebars.ts` for 2.x; both sidebars are intentionally curated rather than autogenerated.
4. Use root-relative links for documentation routes, such as `/learn/semantic-search`, and `/img/...` paths for assets under `static/img/`.
5. When moving a published page, add its legacy URL to `redirects-migration.ts`.
6. Run `pnpm types:check` and `pnpm build` before submitting the change. For 3.x, also run `pnpm check:v3-content` (rejects 2.x claims in 3.x pages) and `pnpm verify:v3-quickstart` (runs the Quick Tutorial against a local engine; set `RUSHDB_BIN` to a `rushdb` binary).

Prefer a focused example that readers can run over an exhaustive abstract explanation. State prerequisites before commands, keep terminology consistent with the SDKs and REST API, and distinguish RushDB Cloud behavior from self-hosted behavior whenever they differ.

## Repository map

| Path                     | Purpose                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `docs/`                  | 2.x (legacy) documentation source pages, served under `/2.x/`.                 |
| `docs-v3/`               | 3.x documentation source pages; `docs-v3/engine/` is generated.                |
| `sidebars.ts`            | Curated 2.x (legacy) navigation hierarchy and sidebar icons.                   |
| `sidebars.v3.ts`         | Curated 3.x navigation hierarchy.                                              |
| `docs-versioning.ts`     | Default version, per-version paths and sidebars, unpublished pages.            |
| `scripts/`               | Engine-manual sync, 3.x content check, and Quick Tutorial verification.        |
| `static/`                | Images, favicons, social cards, and other directly served assets.              |
| `src/components/`        | Reusable MDX and documentation UI components.                                  |
| `src/theme/`             | Swizzled Docusaurus theme components and navigation behavior.                  |
| `src/css/custom.css`     | RushDB documentation theme and responsive styling.                             |
| `plugins/`               | Local Docusaurus plugins for tutorials and Tailwind processing.                |
| `redirects-migration.ts` | Redirects that preserve previously published URLs.                             |
| `docs-version-redirects.ts` | Redirects from the pre-3.x-default layout, generated from the doc trees.    |
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

- [RushDB](https://github.com/rush-db/rushdb) — RushDB, the database for AI: the `rushdb` server and CLI, and its manual
- [RushDB JavaScript SDK](https://github.com/rush-db/javascript-sdk) — `@rushdb/javascript-sdk`
- [RushDB Python](https://github.com/rush-db/rushdb-python) — Python SDK
- [RushDB MCP Server](https://github.com/rush-db/mcp-server) — `@rushdb/mcp-server`
- [RushDB Skills](https://github.com/rush-db/skills) — Agent Skills
- [RushDB Agent Memory Contract](https://github.com/rush-db/agent-memory-contract) — shared agent-memory protocol
- [RushDB OpenClaw Memory](https://github.com/rush-db/rushdb-openclaw-memory) — native OpenClaw memory integration
- [RushDB Hermes Memory](https://github.com/rush-db/rushdb-hermes-memory) — native Hermes Agent memory provider

## License

Apache-2.0. See [LICENSE](./LICENSE).
