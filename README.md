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

RushDB is a self-describing, graph-native database that helps AI agents reason over data with confidence: progressively introspect what's queryable—without guesswork.

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
pnpm lint:design   # design and content conventions (DESIGN.md, AGENTS.md)
pnpm build
```

For changes to styles or components, also render the reference pages in both themes and both widths, with an accessibility check:

```bash
pnpm start          # in one terminal
pnpm audit:ui       # in another; screenshots land in .ui-audit/
```

To inspect the production output locally:

```bash
pnpm serve
```

`pnpm build` validates document routes, fails on broken Docusaurus links, warns on broken Markdown links, builds the local search index, copies raw documentation sources, and generates the `llms*.txt` files under `build/`.

## Documentation versions

The repository serves both documentation generations at once. The default generation owns `/`; the other is available at `/<version>/`.

- `docs/` and `sidebars.v3.ts` contain the 3.x documentation, served at `/`: RushDB on its own engine, used through RushDB Cloud or self-hosted.
- `v2/` and `sidebars.ts` contain the RushDB 2.x (legacy, Neo4j-based) documentation, served at `/2.x/` with a legacy banner on every page. `sidebars.v2.ts` prefixes its root-relative links with `/2.x/`.
- [docs-versioning.ts](docs-versioning.ts) contains `DEFAULT_DOCS_VERSION` (`'3.x'`). The route base, sidebars, the version link in the sidebar footer, noindex rules and the generated `llms.txt` files follow that one value.
- The site has no redirects: every URL is a real page or a 404. 2.x pages and tag pages carry `noindex, follow` and are left out of the sitemap, so search engines and AI answers cite the current docs.

### The 3.x tree

| Path in `docs/` | Content | Source |
| --- | --- | --- |
| `index.mdx`, `get-started/`, `deploy.mdx` | Overview, choosing Cloud or self-hosting, quick tutorial, distribution channels | This repository |
| `connect/` | SDKs (Cloud and direct mode), MCP, skills, agent memory integrations | This repository |
| `learn/` | Records, SearchQuery, relationships, keyword/semantic/hybrid search, agent memory, tutorials, SDK/MCP/REST references | This repository |
| `rushdb-cloud/` | What RushDB Cloud adds, API keys, projects | This repository |
| `migration/` | Moving from 2.x | This repository |
| `engine/` | The engine manual: install, data model, query languages, connectivity, indexes, operations, architecture, reference | **Generated** from `docs/manual` in the engine repository |

Never edit `docs/engine/` here. Edit the manual in the engine repository, then copy it in:

```bash
pnpm sync:engine-manual            # reads ../rust-rushdb by default; pass another path as an argument
pnpm check:engine-manual           # fails if docs/engine is stale
```

In 3.x pages, link to other pages with relative file paths (`../learn/semantic-search/hybrid-search.mdx`), so links keep working whichever version owns `/`. Mark Cloud-only features as such, and say what a self-hosted engine offers instead.

Keep a 2.x page self-contained. When it uses a root-relative link inside a reusable MDX component, use `docsPathForVersion('2.x', '/path')` so the link remains inside `/2.x/` after the default changes.

## Design and conventions

The portal follows the RushDB website's identity: Geist and Geist Mono, the website's colour tokens, square edges and mono uppercase labels.

- [DESIGN.md](DESIGN.md) is the visual system: tokens, type, layout and components.
- [AGENTS.md](AGENTS.md) is the doctrine: which component to use for what, styling and content rules, accessibility floor and definition of done.
- [src/css/tokens.css](src/css/tokens.css) holds the values, copied from the website. Change them there first.

## Authoring documentation

1. Add or update a `.md` or `.mdx` file under `docs/` for 3.x or `v2/` for 2.x (legacy).
2. Give the page concise `title` and `description` front matter, in sentence case.
3. Register new navigation entries in `sidebars.v3.ts` for 3.x or `sidebars.ts` for 2.x; both sidebars are intentionally curated rather than autogenerated.
4. Use root-relative links for documentation routes, such as `/learn/semantic-search`, and `/img/...` paths for assets under `static/img/`.
5. Avoid moving published pages: the site has no redirects, so an old URL becomes a 404. If a move is unavoidable, link the new page from wherever the old one was linked.
6. Run `pnpm types:check`, `pnpm lint:design` and `pnpm build` before submitting the change. For 3.x, also run `pnpm check:v3-content` (rejects 2.x claims in 3.x pages) and `pnpm verify:v3-quickstart` (runs the Quick Tutorial against a local engine; set `RUSHDB_BIN` to a `rushdb` binary).

Prefer a focused example that readers can run over an exhaustive abstract explanation. State prerequisites before commands, keep terminology consistent with the SDKs and REST API, and distinguish RushDB Cloud behavior from self-hosted behavior whenever they differ.

## Repository map

| Path                     | Purpose                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `docs/`                  | 3.x documentation source pages; `docs/engine/` is generated.                   |
| `v2/`                    | 2.x (legacy) documentation source pages, served under `/2.x/`.                 |
| `sidebars.ts`            | Curated 2.x (legacy) navigation hierarchy.                                     |
| `sidebars.v3.ts`         | Curated 3.x navigation hierarchy.                                              |
| `docs-versioning.ts`     | Default version, per-version paths and sidebars, unpublished pages.            |
| `scripts/`               | Engine-manual sync, content and design checks, UI audit, Quick Tutorial verification. |
| `static/`                | Images, favicons, social cards, and other directly served assets.              |
| `src/components/`        | Reusable MDX and documentation UI components.                                  |
| `src/theme/`             | Swizzled Docusaurus theme components and navigation behavior.                  |
| `src/css/tokens.css`     | Design tokens copied from the RushDB website.                                  |
| `src/css/custom.css`     | Documentation theme built on the tokens (see DESIGN.md).                       |
| `DESIGN.md`, `AGENTS.md` | Visual system and doctrine for every docs change.                              |
| `plugins/`               | Local Docusaurus plugins for tutorials and Tailwind processing.                |
| `docusaurus.config.ts`   | Site metadata, structured data, sitemap, search, raw-source export.            |
| `plugins/agent-readable.cjs` | Writes the `.md` page copies, `llms.txt`, `llms-full.txt` and the per-section files. |

Generated directories—`build/` and `.docusaurus/`—are intentionally ignored and should not be edited or committed.

## Production output

The site is configured for `https://docs.rushdb.com` at the root path. A production build writes the deployable static site to `build/`, including:

- HTML, assets, sitemap, and the local search index;
- a Markdown copy of every page (3.x and 2.x) at its URL with `.md` instead of the trailing slash: `/connect/mcp/` → `/connect/mcp.md`, linked from the page as `<link rel="alternate" type="text/markdown">` (`pnpm start` serves them too);
- `llms.txt` (sections follow the sidebar's top-level categories) and `llms-<section>.txt`;
- `llms-full.txt` and `llms-<section>-full.txt`, every 3.x page as Markdown;
- `robots.txt` (from `static/`) and `sitemap.xml` with `lastmod` dates from git.

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
