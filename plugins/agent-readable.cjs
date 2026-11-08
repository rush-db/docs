// @ts-check
'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Agent-readable copies of the docs, as on the website (rush-db/website,
 * app/[slug] and app/blog/[slug] `.md` alternates):
 *
 * - /<page>.md next to every page of every docs instance (3.x and 2.x):
 *   `/connect/openclaw-memory/` → `/connect/openclaw-memory.md`. Each page
 *   links to it with <link rel="alternate" type="text/markdown"> and the
 *   "Copy markdown" button copies it. The build writes them into the output;
 *   `pnpm start` serves these and the llms files below from the generated
 *   directory.
 * - /llms.txt (https://llmstxt.org): a summary, then one section per
 *   top-level sidebar category with a link and one-line description per page;
 * - /llms-full.txt: every page as Markdown, each headed by title and URL;
 * - /llms-<section>.txt and /llms-<section>-full.txt: the same per section.
 *
 * llms files cover the default docs instance only; 2.x is legacy and noindex.
 */

const LANGUAGE_LABELS = { python: 'Python', typescript: 'TypeScript', javascript: 'JavaScript', shell: 'Shell' }

const slugify = (label) =>
  label
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** One line, at most 200 characters. */
function oneLine(text) {
  const line = String(text ?? '').replace(/\s+/g, ' ').trim()
  return line.length > 200 ? `${line.slice(0, 197).replace(/\s+\S*$/, '')}…` : line
}

/** The canonical page URL path: permalinks may lack the trailing slash the site uses. */
const pagePath = (permalink) => (permalink.endsWith('/') ? permalink : `${permalink}/`)

/** `/connect/openclaw-memory/` → `connect/openclaw-memory.md`; `/` → `index.md`. */
const markdownPath = (permalink) => `${permalink.replace(/^\/+|\/+$/g, '') || 'index'}.md`

/** Doc ids in sidebar order, grouped by top-level category label. */
function sectionsFromSidebar(sidebar) {
  const sections = []
  let loose = null
  const collect = (items, ids) => {
    for (const item of items ?? []) {
      if (item.type === 'doc' || item.type === 'ref') ids.push(item.id)
      if (item.type === 'category') {
        if (item.link?.type === 'doc') ids.push(item.link.id)
        collect(item.items, ids)
      }
    }
  }
  for (const item of sidebar ?? []) {
    if (item.type === 'category') {
      const ids = []
      if (item.link?.type === 'doc') ids.push(item.link.id)
      collect(item.items, ids)
      sections.push({ label: item.label, ids })
    } else {
      if (!loose) {
        loose = { label: 'Overview', ids: [] }
        sections.push(loose)
      }
      collect([item], loose.ids)
    }
  }
  return sections
}

/**
 * The page as Markdown: its H1 (or the title), the canonical URL, then the
 * source without front matter or MDX imports. Tab wrappers become a bold label per tab, so
 * every language's sample stays and stays named.
 */
function toMarkdown(doc, siteUrl, siteDir) {
  const file = path.join(siteDir, doc.source.replace(/^@site\//, ''))
  const body = fs
    .readFileSync(file, 'utf8')
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^import\s.+$\n?/gm, '')
    .replace(/^[ \t]*<\/?(Tabs|ThemeTabs)\b[^>]*>[ \t]*$\n?/gm, '')
    .replace(/^[ \t]*<\/TabItem>[ \t]*$\n?/gm, '')
    .replace(/^[ \t]*<TabItem\b([^>]*)>[ \t]*$/gm, (_, attributes) => {
      const label = /\blabel=["']([^"']+)["']/.exec(attributes)?.[1]
      const value = /\bvalue=["']([^"']+)["']/.exec(attributes)?.[1]
      return `**${label ?? LANGUAGE_LABELS[value] ?? value ?? 'Option'}**`
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const [, heading, rest] = /^(# .+)\n+([\s\S]*)$/.exec(body) ?? [null, `# ${doc.title}`, body]
  return `${heading}\n\nSource: ${siteUrl}${pagePath(doc.permalink)}\n\n${rest}\n`
}

module.exports = function agentReadablePlugin(context, options) {
  const { siteUrl, title, summary, details = '', pluginId = 'default' } = options
  const mirrorDir = path.join(context.generatedFilesDir, 'agent-readable')
  /** @type {any[]} every published doc of every docs instance */
  let allDocs = []
  /** @type {Array<{ label: string, docs: any[] }>} */
  let sections = []

  const writeMirrors = (outDir) => {
    for (const doc of allDocs) {
      const file = path.join(outDir, markdownPath(doc.permalink))
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, toMarkdown(doc, siteUrl, context.siteDir))
    }
  }

  const writeLlms = (outDir) => {
    const link = (doc) => `- [${doc.title}](${siteUrl}${pagePath(doc.permalink)})${doc.description ? `: ${oneLine(doc.description)}` : ''}`
    const write = (name, text) => fs.writeFileSync(path.join(outDir, name), text)
    const sectionFiles = sections.map((section) => ({ ...section, slug: slugify(section.label) }))

    write(
      'llms.txt',
      [
        `# ${title}`,
        '',
        `> ${summary}`,
        '',
        ...(details ? [details, ''] : []),
        'Every page is also available as Markdown at its URL with `.md` instead of the trailing slash.',
        '',
        ...sectionFiles.flatMap((section) => [`## ${section.label}`, '', ...section.docs.map(link), '']),
        '## Optional',
        '',
        `- [Full documentation](${siteUrl}/llms-full.txt): every page above as Markdown, in one file`,
        ...sectionFiles.map(
          (section) => `- [${section.label}, full text](${siteUrl}/llms-${section.slug}-full.txt): the ${section.label} pages as Markdown`
        ),
        ''
      ].join('\n')
    )

    const full = []
    for (const section of sectionFiles) {
      const pages = section.docs.map((doc) => toMarkdown(doc, siteUrl, context.siteDir))
      full.push(...pages)
      write(`llms-${section.slug}.txt`, [`# ${title}: ${section.label}`, '', ...section.docs.map(link), ''].join('\n'))
      write(`llms-${section.slug}-full.txt`, pages.join('\n---\n\n'))
    }
    write('llms-full.txt', full.join('\n---\n\n'))
  }

  return {
    name: 'agent-readable',

    async allContentLoaded({ allContent }) {
      const instances = /** @type {Record<string, any>} */ (allContent['docusaurus-plugin-content-docs'] ?? {})
      const published = (version) => version.docs.filter((doc) => !doc.unlisted && !doc.draft)
      allDocs = Object.values(instances).flatMap((content) => content.loadedVersions.flatMap(published))

      const version = instances[pluginId]?.loadedVersions?.[0]
      if (!version) return
      const docs = new Map(published(version).map((doc) => [doc.id, doc]))
      const seen = new Set()
      sections = []
      for (const { label, ids } of sectionsFromSidebar(version.sidebars?.docs ?? Object.values(version.sidebars ?? {})[0])) {
        const sectionDocs = ids.filter((id) => docs.has(id) && !seen.has(id)).map((id) => docs.get(id))
        sectionDocs.forEach((doc) => seen.add(doc.id))
        if (sectionDocs.length) sections.push({ label, docs: sectionDocs })
      }
      const rest = [...docs.values()].filter((doc) => !seen.has(doc.id))
      if (rest.length) sections.push({ label: 'Other pages', docs: rest })

      // The dev server serves this directory (configureWebpack below).
      if (process.env.NODE_ENV !== 'production') {
        fs.rmSync(mirrorDir, { recursive: true, force: true })
        writeMirrors(mirrorDir)
        writeLlms(mirrorDir)
      }
    },

    configureWebpack(_config, isServer) {
      if (isServer || process.env.NODE_ENV === 'production') return {}
      fs.mkdirSync(mirrorDir, { recursive: true })
      return { devServer: { static: [{ directory: mirrorDir, publicPath: '/', watch: false }] } }
    },

    async postBuild({ outDir }) {
      if (!sections.length) throw new Error('agent-readable: the docs content was not loaded')
      writeMirrors(outDir)
      writeLlms(outDir)
    }
  }
}
