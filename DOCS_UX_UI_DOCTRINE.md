# Documentation portal: UX/UI audit, doctrine and remediation plan

Audit date: 2026-11-08. Scope: docs.rushdb.com as built from `origin/main` (`fd51361`), the 3.x generation (`docs-v3/`) first, the 2.x legacy generation where it shares chrome.

> **Status, 2026-11-08: implemented on branch `design/website-identity`.** Section 10 lists what landed, where it departs from the plan below, and what is left. The doctrine now lives in [DESIGN.md](DESIGN.md) and [AGENTS.md](AGENTS.md); where this report and those files disagree, those files win. One decision changed after the audit: the docs use the website's colours **verbatim**, and contrast fixes will land on the website and the docs together (D3), so the "Docs deviations" table in 7.2 was not applied.

This report does three things:

1. Records what the docs portal looks and behaves like today, measured in the browser and in the code.
2. Proposes a **doctrine** for the portal: a `DESIGN.md` (visual system) and a `CLAUDE.md`/`AGENTS.md` (rules for building), modelled on how `rush-db/platform` governs its dashboard, with the visual identity taken from `rush-db/website`.
3. Lists every inconsistency found, with evidence, and a phased remediation plan.

The website keeps its own styles. Nothing here asks the website to change; where the website has the same defect as the docs, it is noted once as an optional upstream fix.

---

## Contents

- [1. Summary](#1-summary)
- [2. Method and sources](#2-method-and-sources)
- [3. The platform approach, and what transfers to docs](#3-the-platform-approach-and-what-transfers-to-docs)
- [4. The identity source: rushdb.com](#4-the-identity-source-rushdbcom)
- [5. Current state of the docs portal](#5-current-state-of-the-docs-portal)
- [6. Findings](#6-findings)
- [7. The doctrine](#7-the-doctrine)
  - [7.1 Principles](#71-principles)
  - [7.2 Tokens](#72-tokens)
  - [7.3 Typography](#73-typography)
  - [7.4 Layout and spacing](#74-layout-and-spacing)
  - [7.5 Shape, elevation, layers, motion](#75-shape-elevation-layers-motion)
  - [7.6 Components and the decision table](#76-components-and-the-decision-table)
  - [7.7 Navigation and information architecture](#77-navigation-and-information-architecture)
  - [7.8 Content and editorial rules](#78-content-and-editorial-rules)
  - [7.9 Accessibility floor](#79-accessibility-floor)
  - [7.10 Definition of done](#710-definition-of-done)
- [8. Remediation plan](#8-remediation-plan)
- [9. Decisions for the owner](#9-decisions-for-the-owner)
- [Appendix A. Measurements](#appendix-a-measurements)
- [Appendix B. Token mapping, old to new](#appendix-b-token-mapping-old-to-new)
- [Appendix C. Draft DESIGN.md front matter](#appendix-c-draft-designmd-front-matter)

---

## 1. Summary

The docs portal already borrows the website's colours (beige and orange in light, near-black and green in dark) and its uppercase mono CTA button. Almost everything else drifts away from the website and from itself:

- **Two different typefaces.** Docs use Manrope and JetBrains Mono; the website uses Geist and Geist Mono. Every page reads as a different product the moment it loads.
- **Two different shape languages.** The website is square (0 border radius on every element measured). Docs render nine distinct radii (4, 6, 6.4, 8, 10, 999px, 50%, and asymmetric variants) on the same page.
- **Decoration the website does not use.** Orange and green glows (`text-shadow`) on the H1, the active sidebar item, the active TOC item and active navbar links. The website has none; the platform doctrine bans glows outright.
- **Accessibility failures that come from the tokens, not from individual pages.** axe reports 67 to 374 serious colour-contrast failures per page in light mode. Most come from five colour pairs: muted sidebar links (`#777570` on beige, 3.79:1), the muted grey `#7a7268` (3.9 to 4.2:1), the orange accent used as text (3.66:1), and two syntax colours. In dark mode, body links are bright green on near-white text (1.17:1 against surrounding text), so links are told apart by colour alone.
- **No source of truth.** There is no `DESIGN.md`, no `CLAUDE.md`/`AGENTS.md`, no token file, no lint, and no vendored design skills in this repository. `src/css/custom.css` (2,071 lines) is the de facto system: 70 hex literals, 60 `rgb()/rgba()` literals, 115 `!important`, 24 selectors bound to Docusaurus' hashed class names, 19 distinct font sizes, the `.footer` block declared three times.
- **One thing, several ways.** Three tab implementations (Infima tabs + a CSS-mask icon set, `LanguageTabs` with inline SVG icons, an unused `ResponsiveTabs`, an unused shadcn `ui/tabs`), two callout styles (52 admonitions and 65 `> **Note:**` blockquotes), three "where next" headings ("See also" 98, "Next steps" 42, "Related" 5), two heading-case conventions (Title Case in Learn and Connect, sentence case in the Engine manual).

What already works and should be kept: the overall shell (collapsible left sidebar, right TOC, ⌘K search modal, "Copy Markdown" page actions), the 3.x/2.x version switch, the legacy banner on 2.x pages, raw-Markdown and `llms*.txt` outputs, and no horizontal scroll at 390px on any audited page.

**Audit health score** (impeccable `audit` rubric, 0–4 per dimension):

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 1 | Hundreds of AA contrast failures per light page; links by colour alone in dark; scrollable tables not focusable; no reduced-motion handling |
| 2 | Performance | 3 | Whole `lucide-react` namespace imported into the sidebar; render-blocking Google Fonts `@import`; otherwise lean |
| 3 | Theming | 1 | Light and dark both exist, but colours are hard-coded per theme rather than tokenised; a stray blue `--color-accent` (#3f81ff) survives in `@theme` |
| 4 | Responsive design | 3 | No overflow at 390px; mobile drawer has no version switch; 26px tap targets in the drawer |
| 5 | Implementation integrity | 1 | No system, no lint, hashed-class selectors, three tab systems, dead components |
| | **Total** | **9/20** | **Poor: needs a system before polish** |

The remediation plan (section 8) is six phases. Phase 0 (governance) and Phase 1 (tokens and identity) remove most findings in bulk, because most findings are one wrong token repeated hundreds of times.

---

## 2. Method and sources

**Read:**

- `rush-db/platform`: root `CLAUDE.md`, `platform/dashboard/CLAUDE.md` (client doctrine), `platform/dashboard/DESIGN.md` (visual system), `.claude/skills/` (vendored `impeccable`, `emil-design-eng`, `review-animations`, `webapp-testing`, `accessibility-audit`, `navigation-patterns`, `information-architecture`, `ux-writing`, `design-token-audit`, `rushdb-dashboard-feature`; sources pinned in `.claude/skills/SOURCES.md`).
- `rush-db/website` at `origin/main`: `src/styles/DESIGN_SYSTEM.md`, `src/styles/globals.css`, `src/styles/blog-article.css` (the article reading layout), `src/styles/fonts/index.ts`, `tailwind.config.js`, `src/components/lp/ui.tsx`, `src/components/lp/LPHeader.tsx`.
- `rush-db/docs` at `origin/main`: `docusaurus.config.ts`, `sidebars.v3.ts`, `src/css/custom.css`, every file in `src/theme/` and `src/components/`, `scripts/`, and all 205 pages in `docs-v3/` (scanned by script).

**Rendered:** a production-like dev server of `origin/main`, driven headless with Playwright (Chromium) because the Chrome extension was not connected in this session. 12 docs routes and 3 website routes, each in light and dark, at 1440×900 and 390×844, with computed-style probes and axe-core (WCAG 2.0/2.1/2.2 A and AA). Docs routes: `/`, `/get-started/quick-tutorial/`, `/connect/`, `/connect/sdks/`, `/learn/records-and-queries/store-records/`, `/learn/search-query/where-operators/`, `/engine/`, `/engine/languages/cypher/`, `/engine/reference/configuration-reference/`, `/learn/reference/typescript/`, `/learn/tutorials/`, `/2.x/`. Website routes: `/`, `/blog`, one blog article.

**Caveats:**

- The local `main` checkout was 4 commits behind `origin/main` and carries staged changes. The audit used `origin/main` only; the staged changes were not touched.
- `/2.x/` renders the 404 page on the dev server because client redirects only exist in production builds. The finding about the 404 page itself (no navigation) stands either way.
- Contrast numbers are axe's, computed on rendered pixels; a few nodes may be counted in both a parent and a child.

---

## 3. The platform approach, and what transfers to docs

The platform does not rely on taste. It governs UI with five layers that reinforce each other:

| Layer | Platform (dashboard) | What it buys | Docs equivalent proposed |
|---|---|---|---|
| **Doctrine** | `platform/dashboard/CLAUDE.md`: principles, a "need → use / not" decision table, page layouts, action hierarchy, data/forms/URL rules, a11y floor, definition of done | Features stop re-deciding the basics; a second implementation of a pattern is a bug | `AGENTS.md` (+ `CLAUDE.md` pointer) at the docs repo root, sections 7.1, 7.6–7.10 of this report |
| **Visual system** | `DESIGN.md` with machine-readable front matter (colours, type, radius, spacing, components) and a prose rationale, "recorded from the code, not invented" | One place to look; the qualitative parts are marked unconfirmed until the owner signs off | `DESIGN.md` at the docs repo root, sections 7.2–7.5, draft front matter in Appendix C |
| **Generated tokens** | `config/colors.ts` + `config/tokens.ts` → `pnpm theme:generate` → `src/theme.css` + `design-tokens.generated.ts`; never edited by hand | Every colour, size, radius, layer and duration has a name; undefined names fail | `src/css/tokens.css` holding the website's `--lp-*` values plus docs-only derived tokens; Infima variables mapped onto them in one block |
| **Mechanical enforcement** | ESLint bans raw colours, palette classes, arbitrary sizes, numeric z-index, bare easings, shadow sizes; violations baselined and only new ones fail | Rules survive contributors who never read the doctrine | Stylelint (CSS) + a `scripts/check-design.mjs` (TSX/MDX) wired into CI next to `check:v3-content` |
| **Skills + definition of done** | Vendored skills (`impeccable`, `webapp-testing`, `accessibility-audit`, …), a `/ui` catalogue, visual baselines, "checked in light and dark at 1440 and 390" | Every change is looked at, in both themes, at both widths | Same skills vendored into `.claude/skills/`, a `/design` catalogue page, Playwright screenshot + axe check in CI |

Two platform choices **do not** transfer:

- **Surface mode.** The dashboard is **Operate** (dense, grayscale, the data is the colour). Docs are **Read** (impeccable: "the visitor understands something… structure for comprehension, then make the reading experience worth staying in"). That changes the type scale (16–18px reading text, not 14px), the measure (60–75 characters), and where brand colour may appear.
- **The dashboard's look.** Manrope, OKLCH neutrals, 6px radius and a neutralised accent are the dashboard's identity. The docs' identity comes from the website (section 4), as requested.

From impeccable's Read mode, the rule that frames the whole doctrine:

> The world owns the frame and serves the column.

The *frame* (sidebar, page header, section openers, how code, tables and callouts are set) takes the website's palette, type and signature moves fully. The *reading column* stays calm: a reading face, real contrast, a real measure, nothing performing behind the text.

---

## 4. The identity source: rushdb.com

Recorded from `rush-db/website@origin/main` and the live site.

**Typefaces.** Geist (sans) for reading text; Geist Mono for structure: headings on marketing pages, labels, navigation, buttons, code (`src/styles/fonts/index.ts`). Weights 400, 500, 700 only.

**Type scale.** Nine steps, each with its line-height (`tailwind.config.js`, `--fs-*`):

| Token | px | Line-height |
|---|---|---|
| `2xs` | 11 | 1.4 |
| `xs` | 12 | 1.5 |
| `sm` | 14 | 1.55 |
| `base` | 16 | 1.65 |
| `md` | 18 | 1.6 |
| `lg` | 22 | 1.35 |
| `xl` | 28 | 1.25 |
| `2xl` | 36 | 1.15 |
| `3xl` | 48 | 1.08 |

**Colour tokens** (`globals.css`), light ("retro beige") and dark ("black and green"):

| Token | Light | Dark | Role |
|---|---|---|---|
| `lp-bg` | `#EDE9E0` | `#0A0A0B` | page |
| `lp-surface` | `#F5F2EB` | `#111113` | alternating sections, cards, code |
| `lp-panel` | `#F7F4ED` | `#131313` | code/terminal windows |
| `lp-raised` | `#FFFFFF` | `#1D1F22` | popovers, tooltips |
| `lp-border` | `#DAD6CE` | `#232327` | lines |
| `lp-border-strong` | `#C9C2B6` | `#3A3F45` | inputs, graph edges |
| `lp-text` | `#1C1A16` | `#F0F0EE` | headings, primary text |
| `lp-body` | `#3E3A34` | `#D0D4D1` | body copy |
| `lp-muted` | `#574F47` | `#A8A8B0` | secondary text |
| `lp-subtle` | `#6D675F` | `#7F8883` | labels, meta |
| `lp-accent` | `#C8540A` | `#00FF85` | brand accent |
| `lp-accent-hover` | `#B04808` | `#00E876` | accent hover |
| `lp-danger` | `#B83E3E` | `#FF6B6B` | status |
| `lp-warning` | `#B7791F` | `#F5B941` | status |
| `--code-*` | warm set | Material-like set | the only syntax palette |

**Shape.** Square. No rounded corners except dots (`rounded-full`). Measured on the live home and blog pages: zero elements with a non-zero radius.

**Signature moves** (the details that make it RushDB and not any other product):

- Uppercase mono labels with wide tracking (`t-label`: 12px, 500, 0.08em, `lp-subtle`) for eyebrows, group titles, table heads, tabs.
- Uppercase mono buttons (`t-button`: 14px, 700, 0.04em), square, accent fill or 1px ghost outline.
- The box-drawing tree glyph `└` as a list and TOC marker, coloured `color-mix(lp-subtle 55%, lp-bg)`, turning accent on the current item.
- Bracketed section numerals: `[01] LABEL`.
- Hairline `lp-border` rules between rows instead of cards and shadows.

**The reading layout already exists.** `blog-article.css` is a documentation-shaped page: a 280px sticky left rail (contents with `└` markers, reading progress), a 680px prose column, a 72px gap, Geist 18px/1.7 body in `lp-body`, mono-uppercase 14px section heads, square bordered code with a mono-uppercase toolbar and copy button, square tables with mono-uppercase 12px heads and no zebra striping, callouts as a 1px left rule with no fill, links that inherit the text colour with a subtle underline and turn accent on hover. This is the closest existing proof of what RushDB looks like in Read mode, and the doctrine builds on it.

**Two discrepancies inside the website** (recorded, not fixed here):

- `DESIGN_SYSTEM.md` says the `t-h1`…`t-h4` roles are mono **700**; `globals.css` renders them at 500 (`t-display` at 400). The rendered weight is what the site actually looks like; the doctrine follows the render.
- Light-mode accent text and accent fills fail AA: `#C8540A` on `#EDE9E0` is 3.67:1 as text, `#EDE9E0` on `#C8540A` is 3.66:1 on buttons (axe: 121 nodes on the live home page). Docs cannot inherit this as-is (section 7.2 derives AA variants). An upstream fix is optional and the website owner's call.

---

## 5. Current state of the docs portal

**Shell.** Docusaurus 3 with Infima, Tailwind v4 utilities (no preflight), a swizzled sidebar (`src/theme/DocSidebar/Desktop`) that carries the logo, a "GET API KEY" CTA, the version switch, a search trigger, the doc tree, community links, the theme switch and a collapse toggle. The top navbar is hidden on desktop (`.navbar { display: none !important }`) and appears only under 997px. The page footer is hidden. Right column: TOC, 320px or 380px wide, pushed to the viewport edge. Page header row: a section label ("Learn", "Engine Manual") on the left, "Copy Markdown" split button and a widescreen toggle on the right.

**Rendered identity, docs vs website** (computed styles, 1440px):

| Property | Docs | Website (home / article) | Gap |
|---|---|---|---|
| Sans face | Manrope | Geist | different face |
| Mono face | JetBrains Mono | Geist Mono | different face |
| Body text | 16px / 26.4px, `lp-text` (#1C1A16) | article 18px / 30.6px, `lp-body` | smaller; heading-black body |
| H1 | Manrope 48px / 700 with orange/green glow | article title Geist 36px / 500, −0.02em; marketing H1 Geist Mono | heavier, larger, glowing |
| H2 | Manrope 32px / 700 | article Geist Mono 14px / 500 uppercase 0.08em | no shared idea |
| H3 | Manrope 24px / 700 | article Geist Mono 14px / 500 | |
| Measure | 680px ≈ 82 characters | 680px at 18px ≈ 69 characters | too long |
| Inline code | 1em JetBrains Mono, 6px radius, 1px border | 0.85em Geist Mono, square, 1px border, `lp-surface` | rounded, larger |
| Code block | 8px radius, 14px/1.45 | square, toolbar with mono label and copy, 14px/1.75 | rounded, no toolbar label |
| Table head | Manrope 13.6px / 600 uppercase, opacity 0.65, tinted row, zebra body | Geist Mono 12px / 400 uppercase 0.08em `lp-subtle`, no tint, no zebra | different voice |
| Callout | 2px accent left border, accent-tinted fill, `0 8px 8px 0` radius, every type orange/green | 1px left rule, no fill | colour carries no meaning |
| Prose link | accent colour, no underline | inherits text colour, subtle underline, accent on hover | dark-mode links are green-on-white |
| Primary button | mono uppercase 12.8px / 700, square | mono uppercase 14px / 700, square | close; size differs |
| Radii on one page | 4, 6, 6.4, 8, 10, 999px, 50%, and asymmetric | none | |
| Font sizes on one page | 12 distinct (11, 11.2, 12.48, 12.8, 13, 13.5, 13.6, 14, 16, 24, 32, 48) | 9-step scale | off-scale sizes |
| Glow (`text-shadow`) | H1, active sidebar item, active TOC item, active navbar link | none | |

Screenshots of every route, theme and width were produced during the audit and can be regenerated with the script described in Phase 5 of the plan.

---

## 6. Findings

Severity: **P0** breaks access or identity for every reader; **P1** visible inconsistency on many pages; **P2** local inconsistency or maintainability; **P3** polish.

Locations are relative to the docs repository at `origin/main`.

### 6.1 Identity

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| ID-1 | P0 | Docs load Manrope + JetBrains Mono; the brand faces are Geist + Geist Mono. | `src/css/custom.css:1-2` (Google Fonts `@import`), `--ifm-font-family-*` at `:root` |
| ID-2 | P0 | Rounded corners everywhere (code 8px, inline code 6px, buttons and inputs 6px, search modal 10px, theme switch and sidebar controls pill/999px, admonitions `0 8px 8px 0`, tabs 4px, table wrapper 8px). The brand is square. | 22 `border-radius` declarations in `custom.css` with 15 distinct values; `rounded-*` utilities in `TutorialsIndex`, `DeployMethodCard`, `ui/tabs` |
| ID-3 | P1 | Glow effects (`text-shadow` 16–28px in accent) on H1, active TOC link, active sidebar link, active navbar link. The website has none; the platform bans glows. | `custom.css:193,196,1076,1187,1193,1249,1253,1257,1263` |
| ID-4 | P1 | Headings are heavy sans (700) at 48/32/24px. There is no mono "structure voice" anywhere in the reading column, so pages look generic Docusaurus with a beige background. | computed H1/H2/H3, Appendix A |
| ID-5 | P1 | The website's signature moves (`t-label` uppercase mono labels, `└` tree markers, bracketed numerals, hairline row lists) are absent, except on the CTA button and the tutorial tag chips. | visual review |
| ID-6 | P2 | A stray blue accent is defined in the Tailwind theme: `--color-accent: #3f81ff` (+ hover, focus, ring). It drives `focus:border-accent` in `TutorialsIndex` (search input focus turns blue). | `custom.css:19-23`, `src/components/TutorialsIndex.tsx:144` |
| ID-7 | P2 | The logo lockup in the sidebar reads "R docs" in light-weight mono; the website header reads "R rushdb". There is no product name on docs pages except in the `<title>`. | `src/theme/Logo/index.tsx`, `.navbar__brand` |
| ID-8 | P2 | Syntax palettes are hand-copied hex in `docusaurus.config.ts` and have already drifted from the website's `--code-*` tokens (dark: docs plain `rgb(195,206,227)`, comment `#546E7A`, property `#F77669`; website text `#d0d4d1`, comment `#5d636c`, property `#80cbc4`). | `docusaurus.config.ts` `lightCodeTheme`/`darkCodeTheme`; website `globals.css` |

### 6.2 Tokens and theming

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| TK-1 | P0 | No token layer. Colours are hex/rgba literals per theme, repeated across rules (70 hex, 60 rgb/rgba in `custom.css`; 9 hex in `DeployMethodCard.tsx`, 3 in `LanguageTabs.tsx`). Light sidebar text uses `rgba(0,0,0,.5)`, dark uses `rgba(255,255,255,.5)`; neither is a brand colour. | `custom.css` sidebar and TOC blocks (~lines 900–1200) |
| TK-2 | P1 | Infima's `emphasis-100…700` scale is repurposed as a neutral palette with values close to, but not equal to, the website's (`emphasis-500 #7a7268` vs `lp-subtle #6D675F`; dark `#7b7b84` vs `#7F8883`). The near-misses are exactly the colours that fail contrast. | `custom.css:62-68, 125-131` |
| TK-3 | P1 | Body text uses `lp-text` (#1C1A16 / #F0F0EE), the heading colour. The website reads body in `lp-body` (#3E3A34 / #D0D4D1). Pages feel louder and headings have no colour step. | computed `p` colour |
| TK-4 | P2 | Tailwind arbitrary values wrap Infima variables (`text-[var(--ifm-color-emphasis-500)]` ×11, `text-[11px]` ×11, `text-[13px]` ×6, `text-[12px]` ×4, `text-[15px]`, `text-[17px]`, `text-[1.1rem]`, `leading-[1.65]`, `max-w-[560px]`…). | `src/components/TutorialsIndex.tsx`, `DeployMethodCard.tsx` |
| TK-5 | P2 | `src/components/ui/tabs.tsx` uses shadcn token classes (`bg-muted`, `text-muted-foreground`, `ring-offset-background`, `bg-background`, `text-foreground`, `ring-ring`) that do not exist in this theme and render nothing. The component is unused. | `src/components/ui/tabs.tsx` |
| TK-6 | P2 | `Method` badge paints white text on an arbitrary inline colour with a 4px radius. Unused in 3.x; used by 2.x pages. | `src/components/ui/method.tsx` |
| TK-7 | P3 | `--rushdb-on-primary` and `.cta-button` restate the same colours in two places (`.cta-button` hard-codes `#c8540a`, `#b04808`, `#f5f2eb`, `#00ff85`, `#00e876`, `#0a0a0b`). | `custom.css:1617-1650` |

### 6.3 Accessibility

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| A11Y-1 | P0 | Light mode: hundreds of AA contrast failures per page. Grouped by colour pair across four pages: muted sidebar/TOC links `#777570` on `#EDE9E0` 3.79:1 (429 nodes); `#7a7268` on `#F5F2EB` 4.23:1 (tutorial tag chips, search label, kbd; 183+42); string tokens `#C8540A` on `#F5F2EB` 3.97:1 (132); comments `#9a8f85` 2.82:1 (71); numbers/booleans `#b45309` 4.49:1 (66); accent links and pagination `#C8540A` on `#EDE9E0` 3.66:1 (32); active sidebar/TOC `#C8540A` on tinted fill 3.19:1; "GET API KEY" button 3.97:1; section label `#9a9792` 2.4:1. | axe `color-contrast`; per page: home 67, quick tutorial 175, connect 148, SDKs 155, store records 271, where operators 314, engine README 92, cypher 198, config reference 179, TS reference 83, tutorials 374 |
| A11Y-2 | P0 | Dark mode: prose links are `#00FF85` inside `#F0F0EE` text, 1.17:1 between link and text, with no underline. Links are distinguishable by colour alone (WCAG 1.4.1). | axe `link-in-text-block` on home, store records (4), cypher (11) |
| A11Y-3 | P1 | Dark mode remaining failures: search label and kbd `#7b7b84` (4.49 and 4.26:1), the page section label `#545454` on `#0A0A0B` (2.61:1), comments `#546e7a` (3.49:1). | axe dark runs |
| A11Y-4 | P1 | Wide tables scroll horizontally inside `.markdown-table-wrapper` but the wrapper cannot receive focus, so keyboard users cannot scroll them. | axe `scrollable-region-focusable`: config reference ×6, cypher, store records |
| A11Y-5 | P1 | Blockquote links in light mode: accent link inside `#444950` blockquote text, 2.04:1 between them. | axe `link-in-text-block` on where operators, cypher |
| A11Y-6 | P1 | No `prefers-reduced-motion` handling anywhere in the docs CSS (the website has one). | `custom.css` |
| A11Y-7 | P2 | Focus styling is ad hoc: only the theme switch and the mobile `<select>` define `:focus-visible`/`:focus`; several controls remove the outline (`outline: none`) on the search input and theme switch. | `custom.css:671-694, 618-627` |
| A11Y-8 | P2 | The search modal is `role="dialog" aria-modal` but does not trap focus or return focus to the trigger on close. The "Copy Markdown" menu is `role="menu"` without arrow-key navigation. | `src/components/SearchModal.tsx`, `CopyPageButton.tsx` |
| A11Y-9 | P2 | Tutorial tag chips reuse `.tabs__item` with `pointer-events-none` (they look like tabs, are not tabs, and cannot be focused); filter chips on the index are buttons with no pressed state exposed. | `src/components/TutorialsIndex.tsx:71` |
| A11Y-10 | P3 | Sidebar section headers are links with `pointer-events: none` and `cursor: default`; they remain in the tab order as links that do nothing. | `custom.css` "Section header categories (non-collapsible)" block |

### 6.4 Reading layout and typography

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| RD-1 | P1 | The measure is ≈82 characters per line at 1440px (16px Manrope in a 680px column) and grows with the widescreen toggle. Read-mode target is 60–75. | probe: `measure 680px / 82ch` on every doc page; `tutorials` 1060px / 116ch |
| RD-2 | P1 | 19 distinct `font-size` values in `custom.css` (`0.7rem`, `0.78rem`, `0.8rem`, `0.8125rem`, `0.85rem`, `0.875rem`, `0.9rem`, `11.5px`, `13px`, `13.5px`, `14px`, …) plus 7 arbitrary sizes in components. None are on the brand scale. | `custom.css`, components |
| RD-3 | P1 | Heading hierarchy relies on size alone (48/32/24/20), all 700. H2 and H3 are separated by an `<hr>`-like rule in some pages and not in others. | computed styles, screenshots |
| RD-4 | P2 | Inline code is 1em in a 16px paragraph, with a 1px border and `vertical-align: middle`; in dense paragraphs it raises line boxes and reads louder than the words around it. In tables it wraps mid-token. | store records, cypher screenshots |
| RD-5 | P2 | Table cells are 16px body text while table heads are 13.6px; the website sets tables at 14px. Zebra striping (`rgba(0,0,0,.015)`) is invisible in practice and adds a rule. | `custom.css:1960-2005` |
| RD-6 | P2 | The tutorials index is laid out as a centred landing page (centred H1, centred lead, centred search, ~60 centred filter chips) inside a docs shell; it is the only page that does this. | `/learn/tutorials/` screenshot |
| RD-7 | P3 | `-webkit-font-smoothing: initial` on `body` disables the antialiasing the website enables. | `custom.css:96-101` |

### 6.5 Components: one thing, several ways

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| CP-1 | P1 | Three live tab systems and one dead one: Infima tabs with CSS-mask icons keyed by `data-lang` (`python`, `typescript`, `rest`, `mcp`), `LanguageTabs` with inline SVG icons, `ResponsiveTabs` (0 uses), `ui/tabs` (0 uses). The `rest` icon never matches in 3.x, where the value is `shell`. | `custom.css:1480-1600`, `src/components/LanguageTabs.tsx`, `ResponsiveTabs.tsx`, `ui/tabs.tsx` |
| CP-2 | P1 | Language tab labels and groups disagree: `label="Shell"` ×241 vs `label="shell"` ×14; `groupId="programming-language"` ×294 vs `groupId="language"` ×5 (so the reader's language choice does not carry onto `connect/langchain`); `value="js"` ×21 vs `value="javascript"` ×1; one `label="REST [Cloud]"`. | `learn/tutorials/search-and-queries/reusable-search-query.mdx`, `learn/tutorials/ai-and-rag/rag-pipeline.mdx`, `learn/tutorials/ai-and-rag/ai-semantic-search.mdx` (lowercase shell); `connect/langchain.mdx` (groupId); `connect/sdks.mdx` (REST [Cloud]) |
| CP-3 | P2 | Import aliases hide what a component is: `import Tabs from '@theme/TabItem'`, `import Tabs2 from '@theme/TabItem'`, `TabsHost`, `ThemeTabs`. | `learn/agent-memory/quickstart.mdx`, `learn/agent-memory/schema-self-awareness.mdx`, `learn/tutorials/agent-memory/agent-skills-with-openclaw.mdx` |
| CP-4 | P1 | Two callout systems: 52 admonitions (`:::note` 22, `:::warning` 14, `:::info` 6, `:::tip` 5, `:::danger` 3, `:::caution` 2) and 65 blockquotes opening with `**Note**`/`**Warning**`/`**Important**`. The engine manual (synced from the engine repository) uses only blockquotes. All admonition types are painted in the accent colour, so a warning and a tip look the same. | `custom.css:1284-1316`; content scan |
| CP-5 | P2 | Buttons: four unrelated styles (square uppercase mono CTA; rounded 6px Manrope "Copy Markdown" split button at 13.5px; pill theme switch; round 32px icon buttons) with heights 30–36px. | `custom.css` `.cta-button`, `.copy-page-*`, `.rushdb-theme-switch`, `.rushdb-sidebar-control` |
| CP-6 | P2 | Search has three triggers with three styles (sidebar fake input, mobile navbar icon button, mobile sidebar fake input) and the modal restyles the plugin with 14 `!important` overrides on hashed class names. | `custom.css:370-640` |
| CP-7 | P2 | `DeployMethodCard` (402 lines) and `TutorialsIndex` (182 lines) each carry their own card, chip and badge styles; 2.x-only `DeployMethodCard` still ships in the bundle for 3.x. | components |
| CP-8 | P3 | Icons come from four sources: lucide (sidebar categories), CSS-mask data URIs (SDK links, tabs), inline SVG (LanguageTabs, Logo), raster/brand images (Connect sidebar). Sizes 13, 15, 16, 18, 20, 22px. | `custom.css`, `DocSidebarItem/Category`, `LanguageTabs` |

### 6.6 Navigation and information architecture

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| NV-1 | P1 | Active states differ by surface: sidebar leaf = accent text + grey fill + glow; sidebar category = bold black; TOC = accent text + grey fill + glow; tabs = accent text + grey fill; version switch = accent bold. Active state relies on colour (plus a faint fill) everywhere. | screenshots, computed styles |
| NV-2 | P1 | The mobile drawer has no version switch, so 2.x/3.x cannot be changed on a phone except by URL. | Playwright: `.navbar-sidebar .rushdb-docs-version-switch` absent |
| NV-3 | P2 | The 404 page is bare: no sidebar, no search, no link home or to the other docs version. | `/2.x/` (dev) and any unknown route |
| NV-4 | P2 | Sidebar hierarchy markers change by depth: level 1 sections use a lucide icon and bold label, level 2 categories bold label, level 3 a 1px guide line at 18px, and Connect items brand logos. The page label above the H1 ("Learn", "Engine Manual") repeats the sidebar section but in a different style (13px, 35% black). | `custom.css` sidebar blocks; `.doc-section-label` |
| NV-5 | P2 | Breadcrumbs are swizzled to a single section label; for 3-level paths (`Learn › Records & Queries › Store Records`) the middle level is lost. | `src/theme/DocBreadcrumbs/index.tsx` |
| NV-6 | P2 | Labels mix vocabularies: "SearchQuery" (an API type) next to "Relationships" and "Records & Queries" (concepts); "Hermes Native Memory Provider" vs "OpenClaw Native Memory"; "Deploy and distribution" in the sidebar vs "Deploy RushDB" as H1. | `sidebars.v3.ts`, H1 scan |
| NV-7 | P3 | Mobile drawer links are 26px tall (passes the 24px WCAG 2.2 minimum, below the 44px comfortable target the website uses for buttons). | Playwright |
| NV-8 | P3 | ~~The widescreen toggle lifts the measure cap.~~ Correction: `WidescreenButton` is exported but never rendered, so the toggle and its CSS were dead code (removed in the implementation). | `CopyPageButton.tsx:260-290`, `custom.css` widescreen block |

### 6.7 Content and editorial consistency

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| ED-1 | P1 | 148 of 205 pages have no `description` front matter (all of `learn/reference` 37, `learn/records-and-queries` 10, `engine/*` 74, five Connect pages). Search snippets, social cards and `llms.txt` entries fall back to the first paragraph. | content scan |
| ED-2 | P1 | H1 case: Title Case in 88 pages (Learn, Connect, Get Started), sentence case in 43 (the engine manual and some Connect pages). H2: 306 Title Case, 687 sentence case. Readers see "Quick Tutorial" and "Architecture overview" in the same sidebar. | content scan |
| ED-3 | P2 | End-of-page wayfinding uses "See also" (98), "Next steps" (42) and "Related" (5) for the same job. | content scan |
| ED-4 | P2 | 30 pages rely on the H1 for the title with no `title` front matter; the sidebar label, H1 and `<title>` can disagree (e.g. sidebar "Overview", H1 "RushDB 3", title "RushDB 3 documentation"). | content scan, `index.mdx` |
| ED-5 | P3 | Code fence languages mix aliases: `typescript` 554 / `ts` 5, `js` 21 / `javascript` 5, `json` 195 / `jsonc` 3. | content scan |

### 6.8 Implementation integrity and performance

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| IM-1 | P1 | 24 selectors bind to Docusaurus' generated class names (`.docRoot_DfVB`, `[class*='docItemCol']`, `[class*='sidebar_']`, `[class*='searchBar']`…). Any Docusaurus upgrade can silently break the sidebar collapse, TOC width and search modal. | `custom.css:798-812` and others |
| IM-2 | P1 | 115 `!important` in `custom.css`; Infima and Tailwind fight through specificity rather than layers. | `custom.css` |
| IM-3 | P2 | Dead or duplicate code: `.footer` styled three times and then hidden; full navbar styling for a navbar hidden on desktop; commented-out rules; `ResponsiveTabs`, `ui/tabs`; GitHub/SDK icon masks for navbar items that no longer render on desktop. | `custom.css:140,162,355,1236` |
| IM-4 | P2 | `import * as LucideIcons from 'lucide-react'` in the sidebar category swizzle pulls the whole icon set into the client bundle to resolve a name from `customProps.icon`. | `src/theme/DocSidebarItem/Category/index.tsx` |
| IM-5 | P2 | Fonts load through a render-blocking CSS `@import` from Google Fonts at the top of the stylesheet. | `custom.css:1-2` |
| IM-6 | P3 | `--doc-sidebar-width: 300px !important` and TOC widths 320/380px are set in three places with media queries that do not match Infima's breakpoints. | `custom.css:77`, TOC block |

---

## 7. The doctrine

What follows is the content for two new files at the docs repository root:

- `DESIGN.md`: sections 7.2–7.5, with front matter as in Appendix C.
- `AGENTS.md` (and a one-line `CLAUDE.md` that points to it): sections 7.1 and 7.6–7.10.

Both follow the platform's convention: rules are short, each rule names what to use and what not to use, and a rule that blocks a real need is changed in the doctrine (and its lint) in the same change, never worked around.

### 7.1 Principles

1. **Read mode.** The visitor came to understand something. Comprehension and wayfinding come first; brand shows in the frame and in precise details, never in the reading column.
2. **The website owns the identity.** Faces, colours, type scale, square shape and signature moves come from rushdb.com. Docs mirror the website's token *values*; they do not invent new hues. Deviations are listed in one place (7.2, "Docs deviations") with the reason.
3. **The frame carries the brand; the column stays calm.** Sidebar, page header, section labels, code toolbars, table heads and callout labels speak in the website's mono-uppercase voice. Paragraphs, lists and headings in the column are set in Geist for reading.
4. **One way to do each thing.** Use the decision table (7.6). A second implementation of an existing pattern is a bug, even if it looks nicer.
5. **Tokens only.** Every colour, size, radius, layer and duration comes from `src/css/tokens.css`. No hex, `rgb()`, arbitrary Tailwind values or Infima emphasis variables in components or MDX.
6. **AA is a floor, not a goal.** Text ≥ 4.5:1, large text and non-text UI ≥ 3:1, links distinguishable without colour.
7. **Every page answers three questions above the fold:** where am I (breadcrumb, active nav item), what is this (H1 + one-sentence description), where next (TOC on the right, "Next steps" at the bottom).

### 7.2 Tokens

**File:** `src/css/tokens.css`, imported first by `custom.css`. It holds:

1. The website's `--lp-*` colours (hex + `-rgb` channels) for light (`:root`) and dark (`html[data-theme='dark']`), copied verbatim from `rush-db/website/src/styles/globals.css`, with a header comment naming the website commit they were taken from.
2. The website's `--code-*` syntax colours, with the AA adjustments below.
3. The website's `--fs-*` type scale.
4. Docs-only derived tokens (prefix `--rd-`), each with a comment saying why it exists.
5. One block that maps Infima variables onto these tokens (`--ifm-background-color: var(--lp-bg)`, `--ifm-font-color-base: var(--lp-body)`, `--ifm-color-primary: var(--rd-link-hover)`, `--ifm-menu-color: var(--lp-muted)`, …). Infima variables are written only in this block.

Tailwind (`@theme` in `custom.css`) exposes the same names, so components use `text-lp-muted`, `bg-lp-surface`, `border-lp-border` exactly like the website. Remove the blue `--color-accent*` set.

**Roles:**

| Role | Token | Use |
|---|---|---|
| Page | `lp-bg` | page ground, sidebar ground |
| Inset | `lp-surface` | code blocks, inline code, table heads, cards, inputs |
| Raised | `lp-raised` | search modal, menus, tooltips |
| Line | `lp-border` | every rule and border |
| Strong line | `lp-border-strong` | inputs, focusable outlines at rest |
| Heading text | `lp-text` | H1–H4, active nav item, strong |
| Body text | `lp-body` | paragraphs, lists, table cells |
| Secondary text | `lp-muted` | inactive nav items, TOC items, descriptions |
| Meta text | `lp-subtle` | labels, breadcrumbs, captions, kbd, counts |
| Accent | `rd-accent` (see below) | current-location marker, primary button fill, link hover |
| Status | `lp-danger`, `lp-warning`, `rd-success`, `rd-info` | callouts only |

**Docs deviations** (derived for AA; the website keeps its values):

| Token | Light | Dark | Why |
|---|---|---|---|
| `--rd-accent-ink` | `#B04808` (= website `lp-accent-hover`) | `#00FF85` | `#C8540A` as text on `#EDE9E0` is 3.67:1; `#B04808` is 4.59:1 on `lp-bg` and 4.97:1 on `lp-surface` |
| `--rd-accent-fill` | `#B04808` | `#00FF85` | primary button fill; text on it is `lp-surface` (4.97:1) in light, `lp-bg` in dark |
| `--rd-accent-fill-hover` | `#9A4107` | `#00E876` | one step darker, 5.53:1 |
| `--rd-accent-mark` | `#C8540A` (= `lp-accent`) | `#00FF85` | non-text markers only (active rule, `└` glyph, focus ring), which need 3:1 and pass |
| `--rd-link` | `inherit` | `inherit` | links take the surrounding text colour and are underlined (website article rule) |
| `--rd-link-underline` | `lp-subtle` | `lp-subtle` | underline at rest |
| `--rd-link-hover` | `--rd-accent-ink` | `--rd-accent-ink` | link text and underline on hover/focus |
| `--rd-success` | `#2F7D4F` | `#4ADE80` | `tip` callout rule and label; nothing on the website to inherit |
| `--rd-info` | `lp-muted` | `lp-muted` | `note`/`info` callouts stay neutral |
| `--code-comment` | `#6D675F` (= `lp-subtle`) | `#7F8883` (= `lp-subtle`) | website values `#9a8f85` (2.82:1) and `#5d636c` fail |
| `--code-string` | `#B04808` | website value | `#C8540A` on `lp-surface` is 3.97:1 |
| `--code-number` | `#9A4A07` | website value | `#b45309` is 4.49:1 |
| `--rd-focus` | `--rd-accent-mark` | `--rd-accent-mark` | 2px focus ring, offset 2px |

**Banned** (lint-enforced, section 8 Phase 0): hex/`rgb()`/`hsl()` literals outside `tokens.css` and the prism theme module; `rgba(0,0,0,x)`/`rgba(255,255,255,x)` overlays; Tailwind palette colours (`text-gray-500`); `text-[...]`, `bg-[...]`, `rounded-[...]`, `leading-[...]` arbitrary values; `var(--ifm-*)` outside `tokens.css`; `text-shadow`; gradients on chrome.

**Syntax highlighting:** generate the Prism `lightCodeTheme`/`darkCodeTheme` from one module (`src/theme/prism-themes.ts`) that reads the `--code-*` names, so the docs and website palettes can be diffed in one place. Prism themes need literal values; keep them there and nowhere else.

### 7.3 Typography

**Faces:** Geist and Geist Mono, self-hosted (the `geist` npm package or `@fontsource-variable/geist` + `@fontsource-variable/geist-mono`), `font-display: swap`, preloaded. Remove the Google Fonts `@import`. Weights 400, 500, 700. No Manrope, no JetBrains Mono.

**Scale:** the website's nine `--fs-*` steps only. No other size anywhere.

**Roles for docs** (CSS classes in `custom.css` `@layer components`, named like the website's `t-*` roles so a reader of both codebases sees the same vocabulary):

| Role | Spec | Use |
|---|---|---|
| `t-doc-title` | Geist 500, `clamp(var(--fs-xl), 1.4rem + 1.1vw, var(--fs-2xl))` (28→36px), lh 1.2, −0.02em, `lp-text`, balance | the page H1 (= website `.article-title`) |
| `t-doc-dek` | Geist 400, `--fs-md` 18px, lh 1.6, `lp-body` | the one-sentence description under the H1 (front matter `description`) |
| `t-doc-h2` | Geist 500, `--fs-lg` 22px, lh 1.35, −0.01em, `lp-text`, 1px `lp-border` rule 16px above, `margin: 56px 0 16px` | section heading |
| `t-doc-h3` | Geist 500, `--fs-md` 18px, lh 1.4, `lp-text`, `margin: 36px 0 12px` | subsection heading |
| `t-doc-h4` | `t-label` (mono 500, 12px, uppercase, 0.08em, `lp-subtle` → `lp-text`) | minor heading, parameter group |
| body | Geist 400, `--fs-base` 16px, lh 1.7, `lp-body` | paragraphs, lists |
| `t-small` | Geist 400, 14px, `lp-muted` | captions, table cells, card text |
| `t-label` | Geist Mono 500, 12px, uppercase, 0.08em, `lp-subtle` | sidebar section titles, breadcrumbs, table heads, tab labels, code toolbar, callout labels, "On this page" |
| `t-ui` | Geist Mono 400, 14px | buttons' secondary text, version switch, kbd |
| `t-button` | Geist Mono 700, 14px, uppercase, 0.04em | buttons |
| `t-code` | Geist Mono 400, 14px, lh 1.7 | code blocks |
| inline code | Geist Mono 400, 0.875em, `lp-surface`, 1px `lp-border`, padding `0.0625em 0.3em`, square, `overflow-wrap: anywhere` | identifiers in prose |

**Why the docs H2 differs from the blog H2.** The blog sets H2 as 14px mono uppercase, which works for an essay with a handful of sections. Reference pages here run to 10–30 H2/H3 headings with code between them; a 14px heading is too weak to scan and indistinguishable from table heads and tab labels. Docs keep the mono-uppercase voice for *labels* (H4, table heads, tabs, sidebar sections) and set H2/H3 in Geist at 22/18px. If the owner prefers the blog's mono H2, see decision D2.

**Measure:** the prose column is `max-width: 42rem` (672px), ≈ 68–72 characters of Geist at 16px. Code blocks, tables and diagrams may break out to `52rem` (832px, the website's 820px breakout rounded to the 4px grid) when the layout has room. The widescreen toggle widens breakouts, never the prose measure.

### 7.4 Layout and spacing

**Grid (desktop ≥ 1200px):** sidebar 280px | gap 48px | content column (prose 672px, breakouts up to 832px) | gap 48px | TOC 240px. Total ≈ 1290px; centred within the viewport above that, with the sidebar pinned left. The sidebar width matches the website's article rail (280px).

**997–1199px:** TOC hides; "On this page" appears as a collapsible block under the H1. **< 997px:** top bar + drawer (existing), content padding 16px.

**Spacing:** 4px base scale. Inside controls and rows 8/12px; between blocks 16/24px; between sections 56px (H2) and 36px (H3); figures (code, tables, callouts, diagrams) 28–32px above and below (website `--article-object-gap: 32px`). Margins live on the prose rules in `custom.css`, not on individual MDX elements.

**Page header** (top of every doc page, in order): breadcrumb (`t-label`, full path, `└`-free, separators `/`), H1 (`t-doc-title`), dek (`t-doc-dek`, from front matter `description`), page actions on the right of the breadcrumb row ("Copy page" split button). A 1px `lp-border` rule closes the header (website `.article-hero`).

**Page footer** (every page): "Next steps" list (`└` markers), previous/next pagination as two bordered square cells with `t-label` "PREVIOUS"/"NEXT" and the page title in Geist 16px, "Edit this page" and "Last updated" in `t-meta`.

### 7.5 Shape, elevation, layers, motion

- **Radius:** 0 everywhere. The only exceptions are dots and avatars (`border-radius: 9999px`). The theme switch becomes square (website `LPSwitch` is square).
- **Elevation:** in-flow content has no shadow. Separation comes from `lp-surface` vs `lp-bg` and 1px `lp-border` rules. Two shadows exist, by role: `--rd-shadow-floating` for menus and popovers, `--rd-shadow-overlay` for the search modal. In dark mode the border carries the separation.
- **Layers** (named, no raw numbers): `--z-sticky: 20` (sidebar header/footer, sticky table heads), `--z-chrome: 40` (mobile top bar, drawer), `--z-overlay: 50` (search modal, menus), `--z-tooltip: 60`. Replace `z-index: 9999` and `200`.
- **Motion:** `--rd-duration-fast: 150ms` (hover, colour), `--rd-duration-base: 200ms` (sidebar collapse, drawer, menu), easing `cubic-bezier(0.2, 0, 0, 1)` for entrances and `cubic-bezier(0.4, 0, 1, 1)` for exits. Animate `opacity`/`transform` and colours only. Add a `prefers-reduced-motion: reduce` block that removes transforms but keeps colour changes (impeccable: preserve state change, drop movement).

### 7.6 Components and the decision table

Primitives live in `src/components/doc/` (MDX-facing) and `src/theme/` (swizzles). Each is listed here; a new one is added to this table and to the `/design` catalogue page in the same change.

| Need | Use | Not |
|---|---|---|
| Code in several languages | `<LanguageTabs>` + `<TabItem value="python\|typescript\|javascript\|shell\|…">`; `groupId` is fixed inside the component; labels come from a single map (`Python`, `TypeScript`, `JavaScript`, `Shell`, `HTTP`, `SQL`, `Cypher`) | `@theme/Tabs` with a hand-typed `groupId`, hand-typed labels, `ResponsiveTabs`, `ui/tabs` |
| Non-language alternatives (Cloud vs self-hosted, client A vs B) | `<Tabs>` from `@theme/Tabs` with an explicit, documented `groupId` from `src/components/doc/tab-groups.ts` | aliasing `TabItem` as `Tabs`, `Tabs2`, `TabsHost` |
| A side note | `:::note` | `> **Note:**` blockquote |
| A recommendation or shortcut | `:::tip` | `:::info` (alias of note; drop) |
| Something that can lose data, money or security | `:::danger` | `:::caution` (alias of warning; drop) |
| Something that commonly goes wrong | `:::warning` | bold text in a paragraph |
| A single shell command to copy | fenced ` ```bash ` block (toolbar label `SHELL`, copy button) | inline code for a full command |
| An identifier in prose | inline code | bold, quotes |
| A reference of fields/options | Markdown table (th = `t-label`, td = `t-small`, square, no zebra, focusable scroll wrapper) | lists of `**name** — desc` |
| A diagram | ` ```mermaid ` with the docs Mermaid theme variables | screenshots of diagrams |
| A choice of next pages | `## Next steps` + a list | "See also", "Related" |
| A set of cards linking to pages (landing pages only) | `<DocCardGrid>` (square, 1px border, `t-label` eyebrow, Geist 16px title, `t-small` text, `└` "Read" link) | bespoke grids in `TutorialsIndex`/`DeployMethodCard` |
| Tags on a tutorial | `<Tag>` (`t-micro`, 1px border, square) | `.tabs__item` with `pointer-events-none` |
| HTTP method badge (2.x) | `<Method>` rebuilt on tokens: `t-micro`, 1px border in a status colour, transparent fill | white text on an arbitrary inline colour |
| The primary action in chrome ("Get API key") | `.rd-button--primary` (square, `t-button`, `rd-accent-fill`), one per viewport | a second filled button anywhere on the same screen |
| Secondary actions (Copy page, widescreen, collapse) | `.rd-button--ghost` (square, 1px `lp-border-strong`, `t-ui`, 36px tall) and `.rd-icon-button` (36×36, `aria-label`) | pills, round icon buttons, 30px split buttons |
| A keyboard shortcut | `<kbd>` styled `t-micro`, 1px border, square | ad-hoc `.…__kbd` classes per component |
| Search entry | one `<SearchTrigger>` used in the sidebar and the mobile bar | three trigger implementations |

**Shared component specs** (all square, all on tokens):

- **Code block.** `lp-surface` fill, 1px `lp-border`. A 36px toolbar on top: language label left (`t-label`; a title from ` ```ts title="file.ts" ` replaces it), copy button right (`t-label`, icon 13px). Body `t-code`, padding 16px, line highlight `rgb(var(--lp-accent-rgb) / 0.08)` with a 2px `rd-accent-mark` left rule. No radius, no shadow.
- **Tabs (language and generic).** A row of `t-label` tab buttons on a 1px `lp-border` baseline. Inactive `lp-muted`; hover `lp-text`; active `lp-text` with a 2px `rd-accent-mark` underline. Language icons are 14px monochrome (`currentColor`), one source (inline SVG components), no brand-coloured logos inside tabs. The tab row attaches directly to the code block below (shared border, no gap).
- **Callout.** No fill. 2px left rule in the type colour (`note`/`info` `lp-border-strong`, `tip` `rd-success`, `warning` `lp-warning`, `danger` `lp-danger`), padding-left 20px, label row in `t-label` coloured like the rule ("NOTE", "TIP", "WARNING", "DANGER"), body in `lp-body`. No icons.
- **Table.** Wrapper: 1px `lp-border`, square, `overflow-x: auto`, `tabindex="0"`, `role="region"` and an `aria-label` from the preceding heading (fixes A11Y-4). `th`: `t-label`, `lp-surface` fill, 12px 16px padding, `nowrap`. `td`: `t-small` in `lp-body`, 12px 16px padding, `vertical-align: top`, 1px row rules, no zebra. Inline code in cells does not wrap mid-token.
- **Links in prose.** Colour inherits; underline 1px, offset 0.2em, `lp-subtle`; hover/focus: text and underline `rd-link-hover`. External links get a 12px `↗` after the text. This one rule fixes A11Y-2 and A11Y-5 in both themes.

### 7.7 Navigation and information architecture

**Sidebar** (the frame's main brand surface):

- Header: logo + wordmark "rushdb" in Geist Mono (as on the website) followed by `t-label` "DOCS"; the primary button "GET API KEY" stays.
- Version switch: a `t-label` row, "DOCS 3.x · 2.x LEGACY", current version in `lp-text` with a 2px `rd-accent-mark` underline. Present in the mobile drawer too (fixes NV-2).
- Search trigger: square input look, `t-ui` placeholder "Search docs", `<kbd>⌘K</kbd>`.
- Tree:
  - Level-1 sections ("GET STARTED", "CONNECT", "LEARN", "ENGINE", …): `t-label`, `lp-subtle`, not links, not focusable (render as `<p>`, not a dead `<a>`), 28px above each. Drop the lucide icons on section titles; the label voice carries the structure.
  - Level-2 items and categories: Geist 14px, `lp-muted`; hover `lp-text`; 32px row height (36px on touch devices).
  - Level-3 items: indented 16px behind a 1px `lp-border` guide line.
  - Active item: `lp-text`, weight 500, a 2px `rd-accent-mark` bar on the left edge of the row, `aria-current="page"`. No fill, no glow. The same treatment is used by the TOC and the version switch (fixes NV-1).
  - Connect integrations keep their monochrome logo glyphs (14px, `currentColor`); full-colour brand marks are not used in navigation.
- Footer: theme switch (square), collapse toggle (square icon button), community links in `t-meta`.

**TOC** (right rail): `t-label` "ON THIS PAGE"; items Geist 14px `lp-muted` with the website's `└` marker in `color-mix(lp-subtle 55%, lp-bg)`; active item `lp-text` with the `└` in `rd-accent-mark` (website `.article-toc-list`). H3 entries indented 16px. This is the docs' signature move: the same tree glyph that marks lists and the blog rail.

**Breadcrumbs:** full path in `t-label` (`LEARN / RECORDS & QUERIES / STORE RECORDS`), each level a link except the current page. Replaces the single section label (NV-5).

**404:** keep the doc shell (sidebar, search) and offer: search, the docs home, and the same path on the other version when it exists (NV-3).

**IA rules:**

- Sidebar labels name concepts or tasks, not API types: "Search queries" (page title may still say `SearchQuery`).
- Sidebar label = H1 = front matter `title` unless a shorter sidebar label is set with `sidebar_label` on purpose; the scan in Phase 5 flags differences.
- Section landing pages (`index.mdx`) open with what the section covers and a `DocCardGrid` or list of its pages; no centred hero layouts (RD-6).
- Depth: three levels maximum in the sidebar; deeper reference goes into the page with H2/H3 and the TOC.

### 7.8 Content and editorial rules

Mechanical rules (enforced by `scripts/check-v3-content.mjs`, extended in Phase 5):

- Front matter on every page: `title`, `description` (one sentence, 70–160 characters, no Markdown), optional `sidebar_label`. The engine-manual sync writes them from the engine repository's front matter or first paragraph.
- **Sentence case** for every heading, sidebar label and page title ("Quick tutorial", "Store records"). Product and type names keep their case (`SearchQuery`, `RushDB Cloud`, `LangChain`). The engine manual already follows this; Learn and Connect move to it.
- One H1 per page, from front matter (do not repeat it as `# Heading` in the body).
- End pages that have a next step with `## Next steps`. "See also" and "Related" are replaced.
- Callouts only through admonitions (7.6). The engine-manual sync converts `> **Note:**`-style blockquotes to `:::note` etc.
- Code fences use canonical language ids: `typescript`, `javascript`, `python`, `bash` (shell sessions), `json`, `yaml`, `sql`, `cypher`, `http`, `text`. Aliases (`ts`, `js`, `jsonc`, `sh`) are rewritten.
- Language tab sets always use `LanguageTabs`, order `Python`, `TypeScript`, `Shell` (the order already used by 294 sets).

Writing rules (use the vendored `ux-writing` skill and the website's `plain-writing`/`stop-slop` skills for review): second person, present tense, one idea per paragraph, the task before the explanation, numbers and limits stated exactly, no marketing adjectives in reference pages.

### 7.9 Accessibility floor

- Contrast: text ≥ 4.5:1 against its actual background; large text (≥ 24px, or ≥ 18.66px bold) and non-text UI (input borders, focus ring, active markers) ≥ 3:1. `lp-subtle` is the lowest colour allowed for readable text.
- Links are underlined in prose; colour alone never marks a link or an active state (active nav uses the bar + weight).
- Focus: one global `:focus-visible` style, a 2px `--rd-focus` outline with 2px offset, on every interactive element. Never `outline: none` without a replacement.
- Scrollable regions (tables, code blocks wider than the column) are focusable and labelled.
- Search modal: focus moves to the input on open, is trapped while open, and returns to the trigger on close; Escape closes. Menus support arrow keys (or are buttons in a list, not `role="menu"`).
- Non-interactive things are not links (sidebar section titles, tutorial tags).
- Reduced motion respected (7.5).
- Touch targets ≥ 24×24px everywhere, ≥ 36px for nav rows and buttons on touch devices.

### 7.10 Definition of done

A change to the docs UI (CSS, theme swizzle, component, Docusaurus config) is done when:

1. `pnpm build`, `pnpm types:check`, `pnpm check:v3-content` and `pnpm lint:design` pass with no new suppressions.
2. Checked in light and dark at 1440 and 390 on at least: home, a Learn page with language tabs, an engine reference page with wide tables, the tutorials index, a 2.x page (`pnpm test:visual` renders them; review the screenshot diff).
3. `pnpm test:a11y` (axe over the same pages) reports no new violations.
4. Keyboard pass: tab through the change; focus is visible, order makes sense, Escape closes overlays.
5. No new token, component or pattern unless it was added to `DESIGN.md`/`AGENTS.md` and to the `/design` catalogue page in the same change.
6. A change to `tokens.css` that copies new website values names the website commit in its header comment.

A change to content is done when `pnpm check:v3-content` passes (front matter, heading case, callout syntax, tab usage, fence languages, links).

---

## 8. Remediation plan

Each phase is one or a few PRs that can ship on its own. Breaking visual changes still ship as a minor version of `rushdb-docs`, per the repository's versioning rules.

### Phase 0. Governance (no visual change)

Goal: make the system exist before changing pixels, so later phases are checked as they land.

| # | Task | Fixes |
|---|---|---|
| 0.1 | Vendor the design skills from `rush-db/platform/.claude/skills/` into `rush-db/docs/.claude/skills/`: `impeccable`, `emil-design-eng`, `review-animations`, `webapp-testing`, `accessibility-audit`, `navigation-patterns`, `information-architecture`, `ux-writing`, `design-token-audit`; copy `SOURCES.md` with the same pinned commits. Add the website's `plain-writing` and `stop-slop` skills (pinned from `rush-db/website/skills-lock.json`). Do not copy `rushdb-dashboard-feature`; write a `rushdb-docs-page` skill instead (0.4). | governance |
| 0.2 | Add `DESIGN.md` (sections 7.2–7.5 + Appendix C front matter) and `AGENTS.md` (7.1, 7.6–7.10), plus a `CLAUDE.md` that points to `AGENTS.md` and repeats the repository's hard rules. Mark surface mode **Read**. | governance |
| 0.3 | Run `/impeccable init` with the owner to write `PRODUCT.md` (audience, tasks, tone) and confirm the qualitative parts of `DESIGN.md` (north star candidate: "The field manual": square, labelled, quiet, built to be read at a terminal). | governance |
| 0.4 | Write `.claude/skills/rushdb-docs-page/SKILL.md`: the step-by-step for adding a page (file location, front matter, sidebar entry, LanguageTabs, callouts, next steps, `check:v3-content`). | ED-* |
| 0.5 | Add Stylelint with rules: no hex/rgb/hsl outside `tokens.css`; `declaration-no-important` (baselined); `selector-disallowed-list` for `[class*=…]` and hashed class names (baselined); `font-size` must be `var(--fs-*)` or `em`; `border-radius` must be `0` or `9999px`; no `text-shadow`; `z-index` must be a `var(--z-*)`. Add `scripts/check-design.mjs` for TSX: bans arbitrary Tailwind values, palette colours, `var(--ifm-` in components, `rounded-*` other than `rounded-none`/`rounded-full`. Script: `pnpm lint:design`. Baseline existing violations so only new ones fail, the same way the dashboard does. | TK-*, IM-1, IM-2 |
| 0.6 | Add `pnpm test:visual` and `pnpm test:a11y` (Playwright + `@axe-core/playwright`) over the page list in 7.10, both themes, 1440 and 390. Commit baselines. Wire both and `lint:design` into CI. | DoD |

### Phase 1. Tokens and identity (bulk fix)

Goal: one PR that swaps the foundation. Most P0/P1 findings close here because they are one wrong value repeated.

| # | Task | Fixes |
|---|---|---|
| 1.1 | Create `src/css/tokens.css` (7.2): website `--lp-*`, `--code-*`, `--fs-*`, docs `--rd-*` deviations, named z-layers, durations, easings, shadows. Map all Infima variables in one block. Delete the blue `--color-accent*` set; expose `lp-*` names to Tailwind via `@theme`. | TK-1, TK-2, TK-7, ID-6 |
| 1.2 | Self-host Geist + Geist Mono; delete the Google Fonts `@import`; set `--ifm-font-family-base`/`-monospace`; remove `-webkit-font-smoothing: initial`. | ID-1, IM-5, RD-7 |
| 1.3 | Body text to `lp-body`, headings `lp-text`; implement the `t-*` roles (7.3) and the prose rules (measure 42rem, spacing, inline code, lists, `hr`). | TK-3, RD-1, RD-2, RD-3, RD-4, ID-4 |
| 1.4 | Global square: set every radius to 0 (keep 9999px for dots); remove all `text-shadow`. | ID-2, ID-3 |
| 1.5 | Links in prose: inherit + underline + accent hover (7.6). | A11Y-2, A11Y-5 |
| 1.6 | Rebuild the Prism themes from `--code-*` in `src/theme/prism-themes.ts`, with the AA comment/string/number values. | ID-8, A11Y-1 (code) |
| 1.7 | Global `:focus-visible` ring, `prefers-reduced-motion` block. | A11Y-6, A11Y-7 |

Exit check: axe colour-contrast failures on the 7.10 page list go from 67–374 per light page to 0; computed probe shows Geist/Geist Mono only, radii only `0px`/`9999px`, font sizes only on the scale.

### Phase 2. Reading components

| # | Task | Fixes |
|---|---|---|
| 2.1 | Code block: swizzle `CodeBlock` (wrap, not eject) to add the 36px toolbar with language label and copy button; square; line highlight rule. | ID-2, website parity |
| 2.2 | Tables: update `MDXComponents` `Table` wrapper with `tabIndex={0}`, `role="region"`, `aria-label`; restyle th/td per 7.6; drop zebra; nowrap inline code in cells. | A11Y-4, RD-5 |
| 2.3 | Admonitions: restyle per 7.6 (type-coloured 2px rule, `t-label` label, no fill, no icon). Remove `info`/`caution` aliases from new content (keep rendering them for 2.x). | CP-4 |
| 2.4 | Tabs: make `LanguageTabs` the only language-tab component (fixed `groupId`, label map, monochrome icons); restyle Infima tabs to the 7.6 spec; delete the CSS-mask icon set, `ResponsiveTabs` and `ui/tabs`. | CP-1, CP-8, TK-5, IM-3 |
| 2.5 | `Tag`, `Method`, `DocCardGrid`, `kbd`, `rd-button--primary/ghost`, `rd-icon-button`: implement on tokens; replace usages in `TutorialsIndex`, `DeployMethodCard`, `CopyPageButton`, sidebar controls, search triggers. | CP-5, CP-6, CP-7, TK-4, TK-6, A11Y-9 |
| 2.6 | Mermaid theme variables from tokens (`themeCSS`/`themeVariables`: Geist, `lp-*` colours, square nodes). | ID-* |
| 2.7 | Add a `/design` catalogue page (unlisted, `noindex`) that renders every token, role and component in both themes; it is what `test:visual` diffs first. | DoD |

### Phase 3. Navigation shell

| # | Task | Fixes |
|---|---|---|
| 3.1 | Sidebar per 7.7: `t-label` section titles as non-links, row heights, guide lines, active bar, no icons on section titles, monochrome Connect glyphs. Replace hashed-class selectors with Docusaurus `ThemeClassNames` (`theme-doc-sidebar-container`, etc.) or swizzle the wrapper to own the markup. | NV-1, NV-4, A11Y-10, IM-1, CP-8 |
| 3.2 | TOC per 7.7 with `└` markers; "ON THIS PAGE" label; collapsible variant under 1200px. | NV-1, ID-5 |
| 3.3 | Breadcrumbs with the full path in `t-label`; page header order (breadcrumb, H1, dek, actions, rule). | NV-5, ED-4 |
| 3.4 | Version switch restyle and add it to the mobile drawer. | NV-2 |
| 3.5 | Search: one `SearchTrigger`; modal on `lp-raised`, square, `--rd-shadow-overlay`, focus trap + return; scope plugin overrides to documented class names. | CP-6, A11Y-8 |
| 3.6 | Copy-page split button and widescreen toggle as `rd-button--ghost`/`rd-icon-button`; widescreen widens breakouts only. Menu keyboard behaviour. | CP-5, NV-8, A11Y-8 |
| 3.7 | Logo lockup "rushdb" + `t-label` "DOCS"; square theme switch. | ID-7 |
| 3.8 | Branded 404 in the doc shell with search and version-aware links. | NV-3 |
| 3.9 | Page footer: `Next steps` styling, square pagination cells with `t-label` "PREVIOUS"/"NEXT". | ED-3 |

### Phase 4. Landing pages

| # | Task | Fixes |
|---|---|---|
| 4.1 | Tutorials index: left-aligned header like every other page; search input on tokens; filters reduced to the 8–10 most used tags plus "More" (or a `<select>` on mobile); cards via `DocCardGrid`. | RD-6, A11Y-1, A11Y-9 |
| 4.2 | Home (`/`), `connect/`, `get-started/`, `rushdb-cloud/` landing pages: same header, `DocCardGrid` for section entry points; the "Start here" table stays (it works). | IA |
| 4.3 | 2.x: shares the 3.x chrome and tokens; `DeployMethodCard` moves to the 2.x-only component folder and is restyled once on the new primitives, or replaced by a table. | CP-7 |

### Phase 5. Content consistency (scripted, reviewable diffs)

| # | Task | Fixes |
|---|---|---|
| 5.1 | Extend `scripts/check-v3-content.mjs` with the 7.8 mechanical rules (front matter fields, sentence case with an allow-list of proper nouns, admonitions only, `LanguageTabs` only, canonical fence ids, `Next steps`). Run in report mode first, then fail CI once the codemods land. | ED-1…ED-5, CP-2, CP-3 |
| 5.2 | Codemods (one PR each, mechanical, easy to review): `label="shell"` → `Shell`; `groupId="language"` → `LanguageTabs`; `REST [Cloud]` → `Shell` (with the Cloud context in prose); `TabItem` import aliases fixed; `js`/`ts`/`jsonc` fence ids; "See also"/"Related" → "Next steps"; blockquote notes → admonitions. | CP-2, CP-3, CP-4, ED-3, ED-5 |
| 5.3 | Sentence-case pass on Learn, Connect, Get Started titles and sidebar labels (manual review: 88 H1s, ~300 H2s). | ED-2, NV-6 |
| 5.4 | Write `description` front matter for the 74 non-engine pages without one; for the engine manual, generate it in `scripts/sync-engine-manual.mjs` from the engine repository's front matter (or ask the engine repository to add it at source). | ED-1 |
| 5.5 | Engine-manual sync: convert blockquote callouts to admonitions and normalise fence ids during sync, so the engine repository can keep plain Markdown. | CP-4, ED-5 |

### Phase 6. Cleanup and hardening

| # | Task | Fixes |
|---|---|---|
| 6.1 | Delete dead CSS: hidden navbar desktop styling, triple `.footer`, commented blocks, SDK/tutorial navbar icon masks, `responsive-tabs__*`. Target: `custom.css` under 800 lines, `!important` under 20 (only where Infima leaves no layer option, each with a comment). | IM-2, IM-3 |
| 6.2 | Replace `import * as LucideIcons` with an explicit icon map. | IM-4 |
| 6.3 | Unify TOC/sidebar widths into the grid tokens (7.4); remove `!important` width overrides. | IM-6 |
| 6.4 | Remove `--docusaurus-highlighted-code-line-bg` literals and any remaining baselined lint violations; prune the baseline file. | TK-* |

### Sequencing and effort

| Phase | Depends on | Size | Visual risk |
|---|---|---|---|
| 0 Governance | none | S–M | none |
| 1 Tokens & identity | 0.5, 0.6 | M | high (every page changes; reviewed through `test:visual`) |
| 2 Reading components | 1 | M | medium |
| 3 Navigation shell | 1 | M–L | medium |
| 4 Landing pages | 2 | S | low |
| 5 Content | 0 (can run in parallel with 1–4) | M (mostly scripted) | low |
| 6 Cleanup | 1–3 | S | low |

Phases 1–3 should land in that order and close together in one minor release of the docs, so readers never see a half-migrated shell (for example, Geist headings next to rounded Manrope controls). Phase 5 can start immediately.

---

## 9. Decisions for the owner

| # | Decision | Recommendation | Alternative |
|---|---|---|---|
| D1 | Adopt the website's faces (Geist / Geist Mono) and drop Manrope / JetBrains Mono. | Yes. It is the single biggest identity gap. | Keep Manrope for body only: lower effort, but the docs stay visibly a different product. |
| D2 | H2/H3 set in Geist sans at 22/18px (docs) vs the blog's 14px mono uppercase. | Geist sans for H2/H3, mono labels for H4/table heads/tabs (7.3): reference pages need strong, scannable headings. | Blog style everywhere: maximal parity, weaker scanning on long reference pages. |
| D3 | Light-mode accent for text and fills becomes `#B04808` (the website's hover colour) in docs only. | ~~Yes, required for AA.~~ **Decided: no.** The docs use the website's colours verbatim; contrast is fixed in both places together later. | Also adopt it on the website (fixes the same 121 failures on its home page); the website owner's call. |
| D4 | Sentence case for all docs headings and labels. | Yes: matches the engine manual, the platform doctrine and the website's article headings. | Title Case everywhere: fewer edits in Learn, but the engine manual would have to change at source. |
| D5 | Square theme switch, square buttons, square search modal. | Yes (brand is square). | Keep the pill theme switch as the one exception. |
| D6 | Drop lucide icons from sidebar section titles. | Yes: the `t-label` voice carries structure; fewer icon sources. | Keep them at 14px monochrome. |
| D7 | Narrow the reading measure to 42rem and limit widescreen mode to breakouts. | Yes. | Keep widescreen as a full-width reading mode for API references only. |

---

## Appendix A. Measurements

Computed styles at 1440×900, light theme, `/learn/records-and-queries/store-records/` (docs) and a blog article (website).

| Element | Docs | Website article |
|---|---|---|
| body / p | Manrope 16px / 26.4px / 400, `#1C1A16` | Geist 18px / 30.6px / 400, `#3E3A34` (light) |
| H1 | Manrope 48px / 60px / 700, glow `rgba(200,84,10,.18) 0 0 20px` | Geist 36px / 43.2px / 500, −0.02em |
| H2 | Manrope 32px / 40px / 700, margin 48/16 | Geist Mono 14px / 21px / 500, uppercase, 0.08em, margin 56/20 |
| H3 | Manrope 24px / 30px / 700, margin 40/16 | Geist Mono 14px / 21px / 500, margin 36/16 |
| Inline code | JetBrains Mono 16px, 6px radius, 1px `#DAD6CE`, `#F5F2EB` | Geist Mono 15.3px (0.85em), square, 1px border, `lp-surface` |
| Code block | 8px radius, `pre` 14px / 20.3px | square, 14px / 1.75, toolbar |
| th | Manrope 13.6px / 600, uppercase, 0.06em, opacity 0.65 | Geist Mono 12px / 400, uppercase, 0.08em, `lp-subtle` |
| td | Manrope 16px / 24.8px | Geist 14px / 21px, `lp-body` |
| Admonition | 2px left, fill `rgba(200,84,10,.06)`, radius `0 8px 8px 0`, padding 20/24/20/20 | 1px left rule, no fill, padding-left 20px |
| Language tab | JetBrains Mono 14px, 4px radius, active fill `rgba(0,0,0,.05)` | (website LPTabBtn) `t-label`, square, accent fill when active |
| Sidebar leaf | Manrope 14px / 17.5px, `rgba(0,0,0,.5)`, 26px tall, 6px radius | (article rail) Geist Mono 14px, `lp-muted` |
| TOC active | Manrope 14px / 500, accent, grey fill, 6px radius, glow | Geist 14px, `lp-text`, accent `└` |
| CTA | JetBrains Mono 12.8px / 700, uppercase, 0.05em, square | Geist Mono 14px / 700, uppercase, 0.04em, square |
| Distinct font sizes on the page | 12 | 9-step scale |
| Distinct radii on the page | 9 | 0 |
| Measure | 680px ≈ 82 ch | 659–680px ≈ 69 ch |

axe-core (WCAG 2.0/2.1/2.2 A+AA), serious violations, 1440px:

| Page | Light | Dark (where run) |
|---|---|---|
| `/` | contrast 67 | contrast 3, link-in-text-block 2 |
| `/get-started/quick-tutorial/` | contrast 175 | |
| `/connect/` | contrast 148 | |
| `/connect/sdks/` | contrast 155 | |
| `/learn/records-and-queries/store-records/` | contrast 271, scrollable-region 1 | contrast 20, link-in-text-block 4, scrollable-region 1 |
| `/learn/search-query/where-operators/` | contrast 314, link-in-text-block 1 | |
| `/engine/` | contrast 92 | |
| `/engine/languages/cypher/` | contrast 198, link-in-text-block 1, scrollable-region 1 | contrast 3, link-in-text-block 11, scrollable-region 1 |
| `/engine/reference/configuration-reference/` | contrast 179, scrollable-region 6 | |
| `/learn/reference/typescript/` | contrast 83 | |
| `/learn/tutorials/` | contrast 374 | |
| rushdb.com `/` (reference) | contrast 121, nested-interactive 1 | |
| rushdb.com `/blog` (reference) | contrast 2 | |

Responsive (390×844): no horizontal page scroll on any audited page in either theme; reading column 358px ≈ 43 ch; mobile drawer rows 26px; no version switch in the drawer. At 1440px, `/engine/reference/configuration-reference/` scrolls horizontally by 16px (document width 1456px).

Contrast of candidate tokens (computed):

| Pair | Ratio |
|---|---|
| `#C8540A` on `#EDE9E0` / on `#F5F2EB` | 3.67 / 3.97 |
| `#B04808` on `#EDE9E0` / on `#F5F2EB` | 4.59 / 4.97 |
| `#F5F2EB` on `#B04808` | 4.97 |
| `#9A4107` on `#EDE9E0` | 5.53 |
| `#6D675F` (`lp-subtle`) on `#EDE9E0` / `#F5F2EB` | 4.62 / 5.00 |
| `#7A7268` (current `emphasis-500`) on `#EDE9E0` / `#F5F2EB` | 3.91 / 4.24 |
| `#7F8883` (`lp-subtle` dark) on `#0A0A0B` / `#111113` | 5.42 / 5.17 |
| `#7B7B84` (current dark muted) on `#111113` | 4.50 |
| `#00FF85` link vs `#D0D4D1` body text | 1.12 |

## Appendix B. Token mapping, old to new

| Current (docs) | New |
|---|---|
| `--ifm-background-color` `#ede9e0` / `#0a0a0b` | `var(--lp-bg)` |
| `--ifm-background-surface-color`, `--ifm-card-background-color`, `--ifm-code-background` `#f5f2eb` / `#111113` | `var(--lp-surface)` |
| `--ifm-toc-border-color`, `--ifm-color-emphasis-200` `#dad6ce` / `#1e1e22` | `var(--lp-border)` |
| `--ifm-color-emphasis-300` `#c8c3b9` / `#28282d` | `var(--lp-border-strong)` |
| `--ifm-font-color-base` `#1c1a16` / `#f0f0ee` | `var(--lp-body)` (headings `var(--lp-text)`) |
| `--ifm-menu-color` `#7a7268` / `#7b7b84`; sidebar `rgba(0,0,0,.5)` / `rgba(255,255,255,.5)` | `var(--lp-muted)` |
| `--ifm-color-emphasis-500` `#7a7268` / `#7b7b84` | `var(--lp-subtle)` |
| `--ifm-color-emphasis-600/700` | `var(--lp-muted)` / `var(--lp-body)` |
| `--ifm-color-primary` `#c8540a` / `#00ff85` (and 6 shades each) | `var(--rd-accent-ink)`; shades removed |
| `--rushdb-on-primary` | `var(--lp-surface)` (light) / `var(--lp-bg)` (dark) via `--rd-on-accent` |
| `.cta-button` literals | `.rd-button--primary` on `--rd-accent-fill*` |
| `--color-accent` `#3f81ff` (+ hover/focus/ring) | removed |
| Admonition fill `rgba(200,84,10,.06)` / `rgba(0,255,133,.06)` | none (rule + label only) |
| Active fill `rgba(0,0,0,.05)` | none (2px `--rd-accent-mark` bar) |
| `z-index: 9999` (search), `200` (copy menu) | `var(--z-overlay)` |
| Prism literals in `docusaurus.config.ts` | `src/theme/prism-themes.ts` from `--code-*` |

## Appendix C. Draft DESIGN.md front matter

```yaml
---
name: RushDB Docs
description: Documentation portal for RushDB (docs.rushdb.com).
surface-mode: read
identity-source: rush-db/website src/styles/globals.css (values mirrored, not linked)
colors:
  # Normative source: src/css/tokens.css. Light is :root; dark is html[data-theme='dark'].
  bg-light: '#EDE9E0'
  surface-light: '#F5F2EB'
  raised-light: '#FFFFFF'
  border-light: '#DAD6CE'
  border-strong-light: '#C9C2B6'
  text-light: '#1C1A16'
  body-light: '#3E3A34'
  muted-light: '#574F47'
  subtle-light: '#6D675F'
  accent-mark-light: '#C8540A'
  accent-ink-light: '#B04808'
  accent-fill-light: '#B04808'
  danger-light: '#B83E3E'
  warning-light: '#B7791F'
  success-light: '#2F7D4F'
  bg-dark: '#0A0A0B'
  surface-dark: '#111113'
  raised-dark: '#1D1F22'
  border-dark: '#232327'
  border-strong-dark: '#3A3F45'
  text-dark: '#F0F0EE'
  body-dark: '#D0D4D1'
  muted-dark: '#A8A8B0'
  subtle-dark: '#7F8883'
  accent-dark: '#00FF85'
  danger-dark: '#FF6B6B'
  warning-dark: '#F5B941'
  success-dark: '#4ADE80'
typography:
  sans: 'Geist'
  mono: 'Geist Mono'
  weights: [400, 500, 700]
  scale-px: [11, 12, 14, 16, 18, 22, 28, 36, 48]
  doc-title: { family: sans, size: 'clamp(28px, 1.4rem + 1.1vw, 36px)', weight: 500, tracking: '-0.02em' }
  doc-dek: { family: sans, size: 18px, weight: 400 }
  h2: { family: sans, size: 22px, weight: 500, tracking: '-0.01em' }
  h3: { family: sans, size: 18px, weight: 500 }
  body: { family: sans, size: 16px, lineHeight: 1.7 }
  label: { family: mono, size: 12px, weight: 500, uppercase: true, tracking: '0.08em' }
  button: { family: mono, size: 14px, weight: 700, uppercase: true, tracking: '0.04em' }
  code: { family: mono, size: 14px, lineHeight: 1.7 }
rounded:
  none: 0
  full: 9999px
layout:
  sidebar: 280px
  prose-max: 42rem
  breakout-max: 52rem
  toc: 240px
  gutter-mobile: 16px
spacing-base: 4px
elevation:
  floating: menus, popovers
  overlay: search modal
z:
  sticky: 20
  chrome: 40
  overlay: 50
  tooltip: 60
motion:
  fast: 150ms
  base: 200ms
---
```

---

## 10. Implementation (branch `design/website-identity`)

Worktree: `../worktrees/docs-website-identity`, based on `origin/main` @ `fd51361`. Nothing is committed.

### Decisions taken

| # | Decision |
|---|---|
| D1 | Geist + Geist Mono replace Manrope + JetBrains Mono (Google Fonts, as the website loads them). |
| D2 | H1–H3 in Geist 500 (28–36 / 22 / 18px); H4–H6, table heads, tabs, breadcrumbs, sidebar sections in the mono label voice. |
| D3 | Website colours verbatim, including the syntax palette. No docs-only AA overrides. |
| D4 | Sentence case for 3.x titles, headings and sidebar labels (engine manual already was; 2.x left as is). |
| D5 | Everything square, including the theme toggle (now the website's sun/moon icon button). |
| D6 | No icons on sidebar categories; Connect integrations keep monochrome 14px glyphs. |
| D7 | Moot: the widescreen toggle was never rendered; its code was removed. |

### What changed

**Foundation**
- `src/css/tokens.css`: the website's `--lp-*` colours (light and dark), `--code-*` syntax colours, the nine-step `--fs-*` scale, layout sizes, named z-layers, durations, shadows.
- `src/css/custom.css`: rewritten (about 2,000 lines, similar size, now mostly documented rules) and all on tokens. Tailwind exposes only token classes (palette, radii and sizes removed). Infima variables are set in one mapping block. No hex or rgba literals, no radii, no glows, no generated Docusaurus class names; `[class*=…]` only for the search plugin.
- `src/prism-theme.ts`: one syntax theme for both modes reading `--code-*`, mirroring the website's `codeTheme.ts`.
- `docusaurus.config.ts`: Geist fonts; the code theme; fixed the nested `themeConfig.themeConfig` bug, so `colorMode` (dark default, as on the website) and Mermaid settings now apply.

**Chrome**
- Sidebar: logo lockup "rushdb" (+ DOCS label in the mobile bar), "Get API key" primary button, version switch "Docs 3.x · 2.x legacy" with an accent underline, square search trigger, mono section labels, 2px accent bar on the current page only, guide lines for nested items, collapse via `--doc-sidebar-width` on `<html>` (no hashed selectors).
- Mobile drawer: version switch added; 36px rows.
- Page header: full breadcrumb path in mono labels plus the "Copy page" control (now a disclosure with links, not a fake `role="menu"`).
- TOC: "On this page" label, `└` markers with a hanging indent, accent marker on the current entry.
- Search modal: square, `lp-raised`, focus trap and focus return.
- 404: branded page with search, 3.x home and 2.x home.

**Reading components**
- Code blocks: square, `lp-surface`, a toolbar naming the language on standalone blocks (`src/theme/CodeBlock`), hidden inside language tabs.
- Language tabs: one `LanguageTabs` (labels and order from one map, JavaScript added); mono tabs with an accent underline; no brand-coloured icons. Removed `src/theme/Tabs`, `ResponsiveTabs`, `ui/tabs`, the CSS-mask icon set and `ColorModeToggle/styles.module.css`.
- Admonitions: a type-coloured rule and mono heading, no fill or icon; untitled ones (the 2.x banner) render plain. Blockquotes look like notes.
- Tables: focusable labelled scroll region, mono heads, 14px cells, no zebra.
- Links: underlined, text colour, accent on hover.
- Mermaid: token colours, square nodes, Geist.
- `TutorialsIndex`: left-aligned header like other pages, 10 most-used tag filters plus "More", `aria-pressed` filters, `rd-card` cards, empty state with "Clear filters".
- `DeployMethodCard` (2.x) and `Method`: moved to tokens; badges are outlined mono labels.

**Content (3.x, outside the synced engine manual)**
- Sentence case: 609 lines of titles and headings, plus `sidebars.v3.ts` labels (`scripts/sentence-case.mjs`).
- Tabs: aliased imports fixed (`agent-memory/quickstart`, the OpenClaw skills tutorial), `connect/langchain` moved to `LanguageTabs`, `REST [Cloud]` and lowercase `shell` labels fixed, `value="js"` → `javascript`.
- Fences: `ts` → `typescript`, `js` → `javascript`.
- `## Related …` → `## See also`; two blockquote notes → `:::note`.
- Sidebar `customProps.icon` entries removed from `sidebars.ts` and `sidebars.v3.ts`.

**Governance**
- `DESIGN.md`, `AGENTS.md`, `CLAUDE.md` (pointer), README section "Design and conventions".
- `.claude/skills/`: `impeccable`, `emil-design-eng`, `review-animations`, `webapp-testing`, `accessibility-audit`, `navigation-patterns`, `information-architecture`, `ux-writing`, `design-token-audit` (from the platform), `plain-writing`, `stop-slop` (from the website), and a new `rushdb-docs-page` skill; pins in `SOURCES.md`.
- `pnpm lint:design`: `scripts/check-design.mjs` (styles, components, MDX conventions) and `scripts/sentence-case.mjs --check`.
- `pnpm audit:ui`: `scripts/audit-ui.mjs` (Playwright + axe; devDependencies `playwright`, `@axe-core/playwright`) renders 8 pages × 2 themes × 2 widths, fails on non-Geist text, rounded corners, glows, horizontal scroll and serious non-contrast axe violations, and reports contrast.

### Verification

- `pnpm types:check`, `pnpm check:v3-content`, `pnpm lint:design`, `pnpm build`: pass.
- `pnpm audit:ui` against the production build: 32/32 pass.
- Contrast after the change: every remaining failure is a website colour used unchanged:

| Pair | Ratio | Where |
|---|---|---|
| `#C8540A` on `#F5F2EB` | 3.97 | light syntax strings |
| `#9A8F85` on `#F5F2EB` | 2.82 | light syntax comments |
| `#B45309` on `#F5F2EB` | 4.49 | light syntax numbers |
| `#EDE9E0` on `#C8540A` | 3.66 | primary button, pressed filter (light) |
| `#5D636C` on `#111113` | 3.11 | dark syntax comments |

  Per page, light mode: store records 271 → 130 failing nodes, where operators 314 → 192, tutorials 374 → 2, engine config reference 179 → 1, home 67 → 1; dark: store records 20 → 17 and no more link-in-text-block failures. The other audit findings (scrollable regions, links by colour alone) are fixed.

### Not done, or left for later

- **Contrast** of the five website colours above: fix on the website and in `tokens.css` together.
- **Descriptions:** 148 pages still have no `description` front matter (ED-1); this needs writing, not a script. The engine manual's would come from the engine repository.
- **2.x content** keeps Title Case and its old conventions (security fixes only).
- **CI:** the repository has no workflows; `lint:design` and `audit:ui` run locally. Add them when CI exists.
- **Visual baselines:** `audit:ui` checks properties and saves screenshots but does not diff them against committed images.
- **North star and PRODUCT.md:** confirm "The field manual" with `/impeccable init`.
- **Search plugin:** still styled through its hashed class names; replace the plugin or ask upstream for stable classes.

