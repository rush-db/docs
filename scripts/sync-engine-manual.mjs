// Copies the engine manual (`docs/manual` in the RushDB engine repository) into
// `docs/engine`. The engine repository is the only source of these pages:
// edit them there and run this script again; never edit `docs/engine` here.
//
//   node scripts/sync-engine-manual.mjs [path-to-engine-repo]   # default ../rushdb
//   node scripts/sync-engine-manual.mjs --check [path]          # fail if the copy is stale
//
// Each page gets front matter: `format: md` (the manual is plain Markdown, not MDX),
// its `# Heading` as `title`,
// a sidebar position taken from the order its section README links it, and an edit
// link to the engine repository. Links that leave the manual become GitHub links.

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, posix, relative, resolve } from 'node:path'

const args = process.argv.slice(2)
const check = args.includes('--check')
const engineRepo = resolve(args.find((arg) => !arg.startsWith('--')) ?? new URL('../../rushdb', import.meta.url).pathname)
const manual = join(engineRepo, 'docs', 'manual')
const target = new URL('../docs/engine/', import.meta.url).pathname
const githubBlob = 'https://github.com/rush-db/rushdb/blob/main'
const githubEdit = 'https://github.com/rush-db/rushdb/edit/main/docs/manual'

const sectionLabels = {
  'getting-started': 'Getting started',
  'data-model': 'Data model',
  query: 'Querying and writing data',
  languages: 'Query languages',
  connectivity: 'Connectivity',
  'indexes-and-search': 'Indexes and search',
  operations: 'Operations',
  architecture: 'Architecture',
  reference: 'Reference'
}

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return markdownFiles(path)
      return entry.name.endsWith('.md') ? [path] : []
    })
  )
  return nested.flat().sort()
}

/** Relative `.md` link targets in the order a page mentions them. */
function linkedPages(text) {
  return [...text.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)].map((match) => match[1])
}

/** Links that resolve outside the manual point at the engine repository on GitHub. */
function rewriteOutsideLinks(text, file) {
  return text.replace(/\]\(((?:\.\.\/)+[^)#\s]+)(#[^)]*)?\)/g, (whole, link, anchor = '') => {
    const absolute = resolve(dirname(file), link)
    if (!relative(manual, absolute).startsWith('..')) return whole
    const repoPath = relative(engineRepo, absolute).split('\\').join('/')
    return `](${githubBlob}/${repoPath}${anchor})`
  })
}

function frontMatter(fields) {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  return `---\n${lines.join('\n')}\n---\n\n`
}

async function render() {
  const files = await markdownFiles(manual)
  const sources = new Map(await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')])))

  // A page's position is where its section README (or the manual README, for a
  // section index) first links it; unlinked pages sort after linked ones.
  const position = new Map()
  for (const [file, text] of sources) {
    if (!file.endsWith('README.md')) continue
    linkedPages(text).forEach((link, index) => {
      const linked = resolve(dirname(file), link)
      if (!position.has(linked)) position.set(linked, index + 1)
    })
  }

  const output = new Map()
  for (const [file, text] of sources) {
    const rel = relative(manual, file).split('\\').join('/')
    const fields = { format: 'md' }
    // The page's `# Heading`, so the sidebar and browser title use it rather
    // than the file name.
    const title = text.match(/^# (.+)$/m)?.[1].trim()
    if (!title) throw new Error(`${rel} has no level-1 heading`)
    fields.title = title
    if (rel === 'README.md') {
      fields.slug = '/engine'
      fields.sidebar_label = 'Engine manual'
    }
    if (position.has(file)) fields.sidebar_position = position.get(file)
    fields.custom_edit_url = `${githubEdit}/${rel}`
    const notice = `<!-- Generated from docs/manual/${rel} in the RushDB engine repository by scripts/sync-engine-manual.mjs. Edit it there. -->\n\n`
    output.set(rel, frontMatter(fields) + notice + rewriteOutsideLinks(text, file))
  }

  for (const [section, label] of Object.entries(sectionLabels)) {
    const index = join(manual, section, 'README.md')
    output.set(
      posix.join(section, '_category_.json'),
      `${JSON.stringify({ label, position: position.get(index) ?? 99, collapsed: true }, null, 2)}\n`
    )
  }
  return output
}

async function existing() {
  const files = new Map()
  let paths = []
  try {
    paths = await readdir(target, { recursive: true, withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of paths) {
    if (!entry.isFile()) continue
    const path = join(entry.parentPath ?? entry.path, entry.name)
    files.set(relative(target, path).split('\\').join('/'), await readFile(path, 'utf8'))
  }
  return files
}

const rendered = await render()

if (check) {
  const current = await existing()
  const stale = [...new Set([...rendered.keys(), ...current.keys()])].filter((key) => rendered.get(key) !== current.get(key))
  if (stale.length) {
    console.error(`docs/engine is out of date with ${manual}:`)
    for (const key of stale.sort()) console.error(`- ${key}`)
    console.error('Run: node scripts/sync-engine-manual.mjs')
    process.exit(1)
  }
  console.log(`docs/engine matches ${manual} (${rendered.size} files).`)
} else {
  await rm(target, { recursive: true, force: true })
  for (const [rel, text] of rendered) {
    const path = join(target, rel)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, text)
  }
  console.log(`Synced ${rendered.size} files from ${manual} into docs/engine.`)
}
