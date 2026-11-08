// Enforces the mechanical rules of DESIGN.md and AGENTS.md:
//
//   styles (src/**/*.css, except tokens.css):
//     colour literals, off-scale font sizes, radii other than 0 and 9999px,
//     text-shadow, raw z-index, and Docusaurus' generated class names.
//   components (src/**/*.tsx, src/**/*.ts):
//     arbitrary Tailwind values, Tailwind palette and radius classes, colour
//     literals in inline styles, Infima variables.
//   content (docs, the 3.x tree, except the synced engine manual):
//     tab import aliases, language-tab groups and labels, code fence aliases,
//     "Related" headings, blockquote callouts.
//
//   node scripts/check-design.mjs
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const repo = new URL('../', import.meta.url).pathname

async function files(dir, pattern) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return files(path, pattern)
      return pattern.test(entry.name) ? [path] : []
    })
  )
  return nested.flat()
}

/** Strips comments so documentation of a rule does not trip the rule. */
const stripCssComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
const stripJsComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, (m, p) => p)

const violations = []
const report = (path, text, index, message) => {
  const line = text.slice(0, index).split('\n').length
  violations.push(`${relative(repo, path)}:${line}  ${message}`)
}

function check(path, text, rules) {
  for (const [pattern, message] of rules) {
    for (const match of text.matchAll(pattern)) report(path, text, match.index, `${message}: ${match[0].trim()}`)
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────
const cssRules = [
  [/#[0-9a-fA-F]{3,8}\b(?![\w-])/g, 'colour literal (use a token from tokens.css)'],
  [/\b(?:rgba?|hsla?|oklch)\((?!var\()/g, 'colour literal (use rgb(var(--lp-*-rgb) / a) or a token)'],
  [/font-size:\s*(?=\S)(?!var\(--fs-|inherit|[\d.]+em\b|clamp\(var\(--fs-)[^;]+/g, 'off-scale font size (use var(--fs-*) or em)'],
  [/border-radius:\s*(?=\S)(?!0\b|0px|9999px|50%|inherit)[^;]+/g, 'rounded corner (the system is square)'],
  [/text-shadow:\s*(?=\S)(?!none)[^;]+/g, 'text-shadow (no glows)'],
  [/z-index:\s*(?=\S)(?!var\(--z-)[^;]+/g, 'raw z-index (use var(--z-*))'],
  [/\.[a-zA-Z]+_[a-zA-Z0-9]{4,5}\b/g, "Docusaurus generated class name (use theme-doc-* or Infima classes)"]
]

for (const path of await files(join(repo, 'src'), /\.css$/)) {
  if (path.endsWith('tokens.css')) continue
  const text = stripCssComments(await readFile(path, 'utf8'))
  check(path, text, cssRules)
  // [class*=…] selectors are allowed only for the search plugin, which has no stable class names.
  for (const match of text.matchAll(/^[^{}]*\[class\*=[^{]*\{/gm)) {
    if (!match[0].includes('.rushdb-search-modal')) report(path, text, match.index, 'substring class selector outside the search plugin block')
  }
}

// ── Components ───────────────────────────────────────────────────────────────
const tsxRules = [
  [/\b(?:[a-z]+:)*(?:text|bg|border|ring|fill|stroke|from|to|via|shadow|rounded|leading|tracking|p[xytrbl]?|m[xytrbl]?|w|h|max-w|min-w|gap|top|left|right|bottom)-\[[^\]]+\]/g, 'arbitrary Tailwind value (use a token class)'],
  [/\b(?:text|bg|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/g, 'Tailwind palette colour (use text-lp-*, bg-lp-*)'],
  [/\brounded-(?!none\b|full\b)[a-z0-9]+/g, 'rounded corner class (the system is square)'],
  [/\bfont-(?:semibold|extrabold|black|light|thin)\b/g, 'weight outside 400/500/700'],
  [/['"`]#[0-9a-fA-F]{3,8}['"`]/g, 'colour literal'],
  [/var\(--ifm-/g, 'Infima variable in a component (use an lp-* token)']
]

for (const path of await files(join(repo, 'src'), /\.tsx?$/)) {
  // Brand marks keep their own artwork.
  if (/Logo|prism-theme/.test(path)) continue
  check(path, stripJsComments(await readFile(path, 'utf8')), tsxRules)
}

// ── Content ──────────────────────────────────────────────────────────────────
const mdxRules = [
  [/^import (?!TabItem\b)\w+ from '@theme\/TabItem'/gm, "TabItem imported under another name (import TabItem from '@theme/TabItem')"],
  [/^import (?!Tabs\b|ThemeTabs\b)\w+ from '@theme\/Tabs'/gm, "Tabs imported under another name (Tabs, or ThemeTabs next to LanguageTabs)"],
  [/<Tabs groupId="language"/g, 'language tabs use LanguageTabs (groupId "programming-language")'],
  [/<TabItem value="(?:js|ts|sh|bash|rest)"/g, 'language tab value (use python, typescript, javascript, shell)'],
  [/label="(?:shell|REST \[Cloud\])"/g, 'language tab label (LanguageTabs sets labels)'],
  [/^```(?:ts|js|sh)\b/gm, 'code fence alias (use typescript, javascript, bash)'],
  [/^## Related\b.*$/gm, 'related-links heading (use "## See also")'],
  [/^> \*\*(?:Note|Warning|Tip|Important|Caution)\b/gm, 'blockquote callout (use :::note, :::tip, :::warning or :::danger)']
]

const content = join(repo, 'docs')
for (const path of await files(content, /\.mdx?$/)) {
  if (relative(content, path).startsWith('engine/')) continue
  const text = (await readFile(path, 'utf8')).replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.split('\n')[0] + m.replace(/[^\n]/g, '').slice(1))
  check(path, text, mdxRules)
}

if (violations.length) {
  console.error(`${violations.length} design rule violation(s):`)
  for (const violation of violations) console.error(`- ${violation}`)
  console.error('See DESIGN.md and AGENTS.md.')
  process.exit(1)
}
console.log('Design rules pass.')
