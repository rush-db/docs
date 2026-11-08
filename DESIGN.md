---
name: RushDB Docs
description: Documentation portal for RushDB (docs.rushdb.com).
surface-mode: read
identity-source: rush-db/website src/styles/globals.css @ bef6c6d (values mirrored, not linked)
colors:
  # Normative source: src/css/tokens.css. Light is :root; dark is html[data-theme='dark'].
  bg-light: '#EDE9E0'
  surface-light: '#F5F2EB'
  panel-light: '#F7F4ED'
  raised-light: '#FFFFFF'
  border-light: '#DAD6CE'
  border-strong-light: '#C9C2B6'
  text-light: '#1C1A16'
  body-light: '#3E3A34'
  muted-light: '#574F47'
  subtle-light: '#6D675F'
  accent-light: '#C8540A'
  accent-hover-light: '#B04808'
  danger-light: '#B83E3E'
  warning-light: '#B7791F'
  bg-dark: '#0A0A0B'
  surface-dark: '#111113'
  panel-dark: '#131313'
  raised-dark: '#1D1F22'
  border-dark: '#232327'
  border-strong-dark: '#3A3F45'
  text-dark: '#F0F0EE'
  body-dark: '#D0D4D1'
  muted-dark: '#A8A8B0'
  subtle-dark: '#7F8883'
  accent-dark: '#00FF85'
  accent-hover-dark: '#00E876'
  danger-dark: '#FF6B6B'
  warning-dark: '#F5B941'
typography:
  sans: 'Geist'
  mono: 'Geist Mono'
  weights: [400, 500, 700]
  scale-px: [11, 12, 14, 16, 18, 22, 28, 36, 48]
  doc-title: { family: sans, size: 'clamp(28px, 1.4rem + 1.1vw, 36px)', weight: 500, tracking: '-0.02em' }
  h2: { family: sans, size: 22px, weight: 500, tracking: '-0.01em' }
  h3: { family: sans, size: 18px, weight: 500 }
  h4: { family: mono, size: 12px, weight: 500, uppercase: true, tracking: '0.08em' }
  body: { family: sans, size: 16px, lineHeight: 1.7, color: body }
  label: { family: mono, size: 12px, weight: 500, uppercase: true, tracking: '0.08em', color: subtle }
  button: { family: mono, size: 12px, weight: 700, uppercase: true, tracking: '0.04em' }
  code: { family: mono, size: 14px, lineHeight: 1.7 }
rounded:
  none: 0
  full: 9999px
layout:
  sidebar: 280px
  sidebar-rail: 56px
  toc: 260px
  prose-max: 42rem
  content-max: 52rem
  row: 32px
  control: 36px
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

# Design system: RushDB Docs

> Recorded from the code (`src/css/tokens.css`, `src/css/custom.css`, `src/theme/*`, `src/components/*`).
> The identity (faces, colours, scale, square shape, signature moves) is the RushDB website's:
> `rush-db/website/src/styles/DESIGN_SYSTEM.md`. The rules for building with this system are in
> `AGENTS.md` next to this file. `pnpm lint:design` enforces the mechanical parts.

## Overview

The docs are a **Read** surface: the reader came to understand something. The frame (sidebar, page header, section labels, how code, tables and callouts are set) speaks the website's language in full: Geist Mono uppercase labels, square edges, hairline rules, the orange or green accent marking where you are. The reading column stays calm: Geist at 16px in the body colour, a 42rem measure, real headings.

Dark is the default theme, as on the website; light is a full peer. A saved choice wins.

North star (to confirm with the owner): **"The field manual"**: square, labelled, quiet, built to be read next to a terminal.

## Colours

The values are the website's, copied verbatim into `src/css/tokens.css`. Change them on the website first, then copy them, and name the website commit in the file's header comment.

| Token | Role |
|---|---|
| `lp-bg` | page and sidebar ground |
| `lp-surface` | code blocks, inline code, table heads, cards, inputs |
| `lp-panel` | reserved (website terminal windows) |
| `lp-raised` | search modal, menus |
| `lp-border` | every rule and border |
| `lp-border-strong` | inputs, ghost buttons, neutral callout rule |
| `lp-text` | headings, the active nav item, strong text |
| `lp-body` | paragraphs, lists, table cells |
| `lp-muted` | inactive nav items, TOC items |
| `lp-subtle` | labels, breadcrumbs, meta, link underlines |
| `lp-accent` | the current-location marker, the primary button, link hover, tip callouts |
| `lp-accent-hover` | primary button hover |
| `lp-danger`, `lp-warning` | danger and warning callouts only |
| `--code-*` | syntax colours, the only code palette (`src/prism-theme.ts` reads them) |

In Tailwind the same names are classes: `text-lp-muted`, `bg-lp-surface`, `border-lp-border`. Tailwind's default palette, radii and sizes are removed (`@theme inline` in `custom.css`), so an off-system class renders nothing.

### Named rules

- **The accent marks location.** The current sidebar item, TOC entry, tab and version carry a 2px accent bar or underline plus weight; colour alone never marks state. Elsewhere the accent appears on hover and on the one primary button.
- **Links are underlined.** In the reading column a link takes the text colour with a 1px `lp-subtle` underline and turns accent on hover (the website's article rule).
- **Contrast is shared with the website.** Some website colours fall under WCAG AA in places (the light accent as text, the light comment colour). They are fixed on the website and here together, never in the docs alone. `pnpm audit:ui` reports contrast without failing.

## Typography

Geist for reading, Geist Mono for structure: labels, navigation sections, breadcrumbs, tabs, table heads, buttons, code. Weights 400, 500 and 700 only. Sizes come from the nine-step scale (`--fs-2xs` 11 … `--fs-3xl` 48); `em` is allowed for inline code and code inside headings.

| Role | Spec | Use |
|---|---|---|
| Page title (H1) | Geist 500, 28→36px fluid, −0.02em | one per page |
| H2 | Geist 500, 22px, −0.01em, 56px above | sections |
| H3 | Geist 500, 18px, 36px above | subsections |
| H4–H6 | Geist Mono 500, 12px, uppercase, 0.08em | minor headings, parameter groups |
| Body | Geist 400, 16px / 1.7, `lp-body` | paragraphs and lists |
| `t-label` | Geist Mono 500, 12px, uppercase, 0.08em, `lp-subtle` | sidebar sections, breadcrumbs, tabs, table heads, code toolbars, callout labels |
| `t-small` | Geist 14px, `lp-muted` | card text, captions |
| `t-meta` | Geist Mono 12px, `lp-subtle` | times, counts |
| `t-micro` | Geist Mono 500, 11px | tags and badges, the only text under 12px |
| Button | Geist Mono 700, 12px, uppercase, 0.04em | buttons |
| Code | Geist Mono 14px / 1.7 | code blocks |
| Inline code | Geist Mono 0.875em, `lp-surface`, 1px `lp-border` | identifiers in prose |

H2 and H3 are set in Geist rather than the blog's 14px mono capitals: reference pages carry 10–30 headings between code samples and need headings that scan. The mono voice is kept for labels.

## Layout

- **Desktop:** sidebar 280px (56px rail when collapsed, remembered) | content column | TOC 260px. Inside the content column, prose is capped at 42rem (≈70 characters) and code, tables, tabs and diagrams at 52rem.
- **Narrow (< 997px):** a 56px top bar (menu, logo, Get API key, search) and a full-screen drawer with the tree and the footer panel. The TOC becomes a collapsible "On this page" block.
- **Page header:** breadcrumbs (full sidebar path, `t-label`) and the page actions ("Copy markdown", "Ask AI" ▾) on one row, closed by a 1px rule; then the H1.
- **Sidebar footer:** the version link ("2.x legacy docs →" on current pages, "3.x docs (current) →" on 2.x pages), rushdb.com, Blog and llms.txt with icons, then the website footer's social icons.
- **Page footer:** previous and next as two square bordered cells (`t-label` sublabel, Geist 16px title), then the edit link in `t-meta`.
- **Spacing:** the 4px scale. Figures (code, tables, callouts, diagrams) sit 28px apart; sections 56px; subsections 36px.

## Shapes, elevation, layers, motion

- **Square.** `border-radius` is 0 everywhere; `9999px` only for dots.
- **Flat.** In-flow content has no shadow; separation comes from `lp-surface` against `lp-bg` and 1px rules. `--rd-shadow-floating` is for the Ask AI menu, `--rd-shadow-overlay` for the search modal.
- **Layers:** `--z-sticky` 20, `--z-chrome` 40, `--z-overlay` 50, `--z-tooltip` 60.
- **Motion:** colour transitions of 150ms; sidebar width 200ms. `prefers-reduced-motion` keeps colour changes and drops movement.

## Signature moves

- **The `└` tree glyph** before every TOC entry and in the 404 links, in `color-mix(lp-subtle 55%, lp-bg)`, accent on the current entry (website blog rail).
- **Mono uppercase labels** for every piece of chrome that names something.
- **Hairline rules** instead of cards and shadows: table rows, the page header, sidebar sections.

## Components

| Component | Spec |
|---|---|
| Code block | The website article code block: `lp-surface`, 1px `lp-border`, square; a 36px toolbar with the language (`t-label`) or the fence `title` on the left and a labelled Copy button on the right (inside language tabs the language is left out, the tab names it); code at 14px / 1.75, 16px padding, slightly desaturated; long lines scroll sideways (no wrap toggle). Highlighted lines get a 2px accent rule. |
| Page actions | `PageActions`: "Copy markdown" (copies the page's `.md` version: title, URL, then the source without front matter, imports or tab wrappers) and an "Ask AI" disclosure with the website hero's assistants (ChatGPT, Claude, Perplexity, Grok, Google AI) and their brand marks; the prompt carries the page URL. Icon-only under 760px. |
| Language tabs | `LanguageTabs`: `t-label` tabs on a 1px baseline, active tab `lp-text` with a 2px accent underline; Python, TypeScript, JavaScript, Shell in that order; the code block below shares the baseline. |
| Callout | `:::note` (neutral), `:::tip`/`:::info` (accent), `:::warning`/`:::caution` (warning), `:::danger` (danger): a 2px rule in that colour, a `t-label` heading, no fill, no icon. Blockquotes look like `:::note`. |
| Table | 1px border, square, focusable scroll region; `t-label` heads on `lp-surface`; 14px cells in `lp-body`; 1px row rules; no zebra. |
| Primary button | `lp-accent` fill, `lp-bg` text, `t-button`, 36px. One per screen: "Get API key". |
| Ghost button | 1px `lp-border-strong`, `lp-muted` mono label, 32px; hover `lp-text`. |
| Icon button | 32×32, no border, `lp-muted`, hover `lp-text`, `aria-label`. |
| Card | `rd-card`: `lp-surface`, 1px border, hover border `lp-text` and accent title. |
| Tag / badge | `rd-tag`: `t-micro`, 1px border. |
| Filter chip | `rd-filter`: 28px, 1px border, mono 12px; pressed = accent fill. |
| Search | One trigger style; the modal is `lp-raised`, square, with a focus trap. |
| Diagrams | Mermaid with token colours, square nodes and Geist (overrides in `custom.css`). |

## Do's and don'ts

### Do

- Take every value from `tokens.css`; add a token there (from the website) before using a new value.
- Check light and dark at 1440 and 390 (`pnpm audit:ui`).
- Mark state with weight plus a bar or underline.

### Don't

- Don't round corners, add glows, gradients or shadows on in-flow content.
- Don't use Manrope, JetBrains Mono or any face other than Geist and Geist Mono.
- Don't write hex, `rgb()` or Infima variables outside `tokens.css` and the Infima mapping block.
- Don't select Docusaurus' generated class names (`foo_AbC1`).
- Don't build a second version of a component in the table above.
