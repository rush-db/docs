// Renders the definition-of-done pages (AGENTS.md) in light and dark at 1440
// and 390 px, saves screenshots to .ui-audit/, and checks what the system
// promises: Geist/Geist Mono only, square corners, no glows, no horizontal
// scroll, and no serious axe violations.
//
//   pnpm start                      # or `pnpm serve` after a build
//   pnpm audit:ui [base-url]        # default http://localhost:3000
//
// Colour contrast is reported but does not fail the run: the colours are the
// website's, and contrast is fixed in both places together (DESIGN.md).
// Set CHROMIUM_PATH to use a system browser instead of Playwright's.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const out = new URL('../.ui-audit/', import.meta.url).pathname
await mkdir(out, { recursive: true })

const PAGES = [
  ['home', '/'],
  ['quick-tutorial', '/get-started/quick-tutorial/'],
  ['store-records', '/learn/records-and-queries/store-records/'],
  ['where-operators', '/learn/search-query/where-operators/'],
  ['engine-config-reference', '/engine/reference/configuration-reference/'],
  ['tutorials', '/learn/tutorials/'],
  ['legacy-2x', '/2.x/get-started/quick-tutorial/'],
  ['not-found', '/this-page-does-not-exist/']
]
const THEMES = ['light', 'dark']
const WIDTHS = [1440, 390]
const FONTS = new Set(['Geist', 'Geist Mono'])

const probe = (fonts) => {
  const problems = []
  const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    if (!el.getClientRects().length) continue
    const style = getComputedStyle(el)
    const hasText = [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim())
    const family = style.fontFamily.split(',')[0].replace(/["']/g, '').trim()
    if (hasText && !fonts.includes(family) && !el.closest('svg, .docusaurus-mermaid-container')) seen.add(`font ${family}`)
    const radius = style.borderTopLeftRadius
    if (radius !== '0px' && !radius.startsWith('9999') && radius !== '50%' && !el.closest('svg')) seen.add(`radius ${radius} on ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)
    if (style.textShadow !== 'none') seen.add(`text-shadow on ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`)
  }
  problems.push(...seen)
  if (document.documentElement.scrollWidth > window.innerWidth) problems.push(`horizontal scroll: ${document.documentElement.scrollWidth}px`)
  return problems
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
let failed = 0
for (const [name, path] of PAGES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme })
      const page = await context.newPage()
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme)
      await page.goto(base + path, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `${out}${name}-${theme}-${width}.png` })
      const problems = await page.evaluate(probe, [...FONTS])
      if (width === 1440) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
        for (const violation of axe.violations) {
          if (!['serious', 'critical'].includes(violation.impact)) continue
          const line = `axe ${violation.id} (${violation.nodes.length})`
          if (violation.id === 'color-contrast') console.log(`  note  ${name} ${theme}: ${line}`)
          else problems.push(line)
        }
      }
      if (problems.length) {
        failed++
        console.log(`FAIL  ${name} ${theme} ${width}`)
        for (const problem of problems) console.log(`      - ${problem}`)
      } else {
        console.log(`ok    ${name} ${theme} ${width}`)
      }
      await context.close()
    }
  }
}
await browser.close()
console.log(`Screenshots: ${out}`)
process.exit(failed ? 1 : 0)
