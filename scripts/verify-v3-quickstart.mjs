// Runs the 3.x Quick Tutorial (docs/get-started/quick-tutorial.mdx) against a
// real engine: the TypeScript steps, in direct mode, with the published SDK.
//
//   RUSHDB_BIN=/path/to/rushdb pnpm verify:v3-quickstart   # default ../rust-rushdb/target/debug/rushdb
import { access, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import RushDB, { CloudOnlyError } from '@rushdb/javascript-sdk'

const engine = process.env.RUSHDB_BIN ?? resolve('../rust-rushdb/target/debug/rushdb')
await access(engine).catch(() => {
  throw new Error(`RushDB binary is unavailable: ${engine}. Build rust-rushdb first or set RUSHDB_BIN.`)
})

const token = 'docs-quickstart-token'
const port = 39107
const dataDir = await mkdtemp(join(tmpdir(), 'rushdb-docs-'))
const child = spawn(engine, ['serve', '--port', String(port), '--pgwire-port', '0', '--data-dir', dataDir, '--token', token], {
  stdio: ['ignore', 'pipe', 'pipe']
})

const stop = async () => {
  if (!child.killed) child.kill('SIGTERM')
  await rm(dataDir, { recursive: true, force: true })
}

const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}

try {
  const engineUrl = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${engineUrl}/ready`)
      if (response.ok) break
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
    if (attempt === 99) throw new Error('RushDB did not become ready')
  }

  // 1. Connect
  const db = new RushDB(token, { direct: true, engineUrl })

  // 2. Push nested JSON
  await db.records.importJson({
    label: 'PROJECT',
    data: {
      name: 'Search revamp',
      status: 'active',
      TASK: [
        { title: 'Add keyword search to the docs site', status: 'done', estimate: 3 },
        { title: 'Rank results by meaning and keywords', status: 'pending', estimate: 5 },
        { title: 'Measure search latency', status: 'pending', estimate: 2 }
      ]
    }
  })

  // 3. Query across relationships
  const pending = await db.records.find({
    labels: ['TASK'],
    where: { status: 'pending', PROJECT: { status: 'active' } },
    orderBy: { estimate: 'desc' }
  })
  expect(pending.total === 2, `expected 2 pending tasks, got ${pending.total}`)
  expect(pending.data[0].data.title === 'Rank results by meaning and keywords', 'pending tasks are not ordered by estimate')

  const remaining = await db.records.find({
    labels: ['TASK'],
    where: { status: 'pending' },
    select: { estimate: { $sum: '$record.estimate' } }
  })
  expect(remaining.data[0].data.estimate === 7, `expected a remaining estimate of 7: ${JSON.stringify(remaining.data)}`)

  // 4. Search by keywords
  await db.textIndexes.create({ label: 'TASK', property: 'title', consistency: 'immediate' })
  for (let attempt = 0; ; attempt++) {
    const { data: indexes } = await db.textIndexes.find()
    if (indexes.every((index) => index.status === 'ready')) break
    if (attempt === 100) throw new Error('text index did not become ready')
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  const hits = await db.records.textSearch({ labels: ['TASK'], query: 'search latency' })
  expect(hits.data[0]?.data.title === 'Measure search latency', `unexpected keyword hits: ${JSON.stringify(hits.data)}`)

  // 5. Search by meaning: a text query needs RushDB Cloud
  const refused = await db.records
    .vectorSearch({ labels: ['TASK'], propertyName: 'title', query: 'make search faster' })
    .then(() => null, (error) => error)
  expect(refused instanceof CloudOnlyError, `expected CloudOnlyError, got ${refused}`)

  console.log('Verified: the 3.x Quick Tutorial runs against a self-hosted engine')
} finally {
  await stop()
}
