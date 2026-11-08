// Runs the JavaScript examples of docs/connect/sql-and-cypher.mdx against a
// real engine: node-postgres over the PostgreSQL wire and neo4j-driver over
// Bolt, on the Quick Tutorial's data.
//
//   RUSHDB_BIN=/path/to/rushdb pnpm verify:v3-clients   # default ../rust-rushdb/target/debug/rushdb
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import RushDB from '@rushdb/javascript-sdk'
import pg from 'pg'

const engine = process.env.RUSHDB_BIN ?? resolve('../rust-rushdb/target/debug/rushdb')
await access(engine).catch(() => {
  throw new Error(`RushDB binary is unavailable: ${engine}. Build rust-rushdb first or set RUSHDB_BIN.`)
})

const token = 'docs-clients-token'
const ports = { http: 39108, pgwire: 39432, bolt: 39687 }
const dataDir = await mkdtemp(join(tmpdir(), 'rushdb-docs-'))
// Inside the repository, so the examples resolve `pg` and `neo4j-driver` from node_modules.
const scratch = resolve('node_modules/.cache/verify-v3-clients')
const child = spawn(
  engine,
  [
    'serve',
    '--port', String(ports.http),
    '--pgwire-port', String(ports.pgwire),
    '--bolt-port', String(ports.bolt),
    '--languages', 'sql,cypher',
    '--data-dir', dataDir,
    '--token', token
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] }
)

const stop = async () => {
  if (!child.killed) child.kill('SIGTERM')
  await rm(dataDir, { recursive: true, force: true })
  await rm(scratch, { recursive: true, force: true })
}

const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}

try {
  const engineUrl = `http://127.0.0.1:${ports.http}`
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${engineUrl}/ready`)
      if (response.ok) break
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))
    if (attempt === 99) throw new Error('RushDB did not become ready')
  }

  // The Quick Tutorial's data, written through the SDK.
  const db = new RushDB(token, { direct: true, engineUrl })
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

  // Every JavaScript example on the page, with the ports of this engine.
  const page = await readFile(new URL('../docs/connect/sql-and-cypher.mdx', import.meta.url), 'utf8')
  const examples = [...page.matchAll(/```javascript\n([\s\S]*?)```/g)].map((match) =>
    match[1].replace('port: 5432', `port: ${ports.pgwire}`).replace('bolt://127.0.0.1:7687', `bolt://127.0.0.1:${ports.bolt}`)
  )
  expect(examples.length === 2, `expected 2 JavaScript examples, found ${examples.length}`)
  await mkdir(scratch, { recursive: true })
  for (const [index, example] of examples.entries()) {
    const file = join(scratch, `example-${index}.mjs`)
    await writeFile(file, example)
    await promisify(execFile)(process.execPath, [file], { env: { ...process.env, RUSHDB_TOKEN: token } })
  }

  // Both examples wrote a task; SQL sees them next to the SDK's records.
  const client = new pg.Client({ host: '127.0.0.1', port: ports.pgwire, user: 'rushdb', database: 'rushdb', password: token })
  await client.connect()
  try {
    const { rows } = await client.query('SELECT title FROM task ORDER BY title')
    const titles = rows.map((row) => row.title)
    for (const title of ['Write docs', 'Add Bolt docs', 'Measure search latency']) {
      expect(titles.includes(title), `missing task "${title}": ${JSON.stringify(titles)}`)
    }
    const { rows: projects } = await client.query(
      `SELECT p.name, count(*) AS tasks
       FROM project p
       JOIN rushdb_edges."__rushdb__relation__default__" e ON e.__source_id = p.__id
       JOIN task t ON t.__id = e.__target_id
       GROUP BY p.name`
    )
    expect(projects[0]?.tasks === '3', `unexpected join result: ${JSON.stringify(projects)}`)
    const refused = await client.query('BEGIN').then(() => null, (error) => error)
    expect(refused?.code === '0A000', `expected BEGIN to fail with 0A000, got ${refused?.code}`)
  } finally {
    await client.end()
  }

  console.log('Verified: the SQL and Cypher client examples run against a self-hosted engine')
} finally {
  await stop()
}
