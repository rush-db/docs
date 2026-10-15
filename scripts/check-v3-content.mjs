// Rejects RushDB 2.x claims in the published 3.x pages: the self-hosted platform,
// Neo4j-era features, KU billing, monorepo paths, routes RushDB Cloud does not
// serve, and links that point into the 2.x tree.
//
// Skipped: the engine manual (`engine/`, synced from the engine repository and
// checked there) and the migration guide (which names what 2.x had on purpose).
import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = new URL('../docs-v3/', import.meta.url).pathname

const skipped = ['engine/', 'migration/from-2x.mdx']

const forbidden = [
  [/knowledge units?|\bKUs?\b/i, 'KU billing is not part of 3.x'],
  [/\bBYOC\b|bring your own (cloud|neo4j)|custom neo4j/i, 'projects no longer connect to their own Neo4j'],
  [/rushdb\/platform\b/i, 'only the engine is self-hosted'],
  [/RUSHDB_SELF_HOSTED|RUSHDB_LLM_|NEO4J_/, 'platform environment variables are not a 3.x surface'],
  [/packages\/(skills|javascript-sdk|mcp-server|agent-memory-contract)|rush-db\/rushdb --path/, 'packages live in their own repositories'],
  [/\/records\/[^/\s"'`]+\/relations\b|\/records\/create-many|\/records\/upsert\b|\/records\/[^/\s"'`]+\/relationships\b/, 'not a RushDB Cloud route'],
  [/\bdb\.direct\./, 'direct mode uses the regular SDK API'],
  [/\]\(\/(learn|connect|deploy|get-started|rushdb-cloud)\//, 'absolute link into the 2.x tree; use a relative file link']
]

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? files(path) : [path]
    })
  )
  return nested.flat()
}

const violations = []
for (const path of await files(root)) {
  if (!/\.(md|mdx)$/.test(path)) continue
  const name = relative(root, path)
  if (skipped.some((skip) => name === skip || (skip.endsWith('/') && name.startsWith(skip)))) continue
  const lines = (await readFile(path, 'utf8')).split('\n')
  lines.forEach((line, index) => {
    for (const [pattern, reason] of forbidden) {
      if (pattern.test(line)) violations.push(`${name}:${index + 1}: ${reason}\n    ${line.trim().slice(0, 160)}`)
    }
  })
}

if (violations.length) {
  console.error('2.x claims in published 3.x pages:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}
console.log('docs-v3: no 2.x claims in published pages.')
