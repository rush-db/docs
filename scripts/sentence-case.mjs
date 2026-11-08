// Rewrites headings, `title` and `sidebar_label` in docs (3.x, outside the
// engine manual, which is synced and already sentence case) to sentence case.
//
//   node scripts/sentence-case.mjs           # report what would change
//   node scripts/sentence-case.mjs --check   # fail if anything would change (CI)
//   node scripts/sentence-case.mjs --write   # apply
//
// A word keeps its case when it is a proper noun or product name (KEEP), an
// acronym, a camelCase or PascalCase identifier, inside backticks, or the first
// word of the heading or of a clause after ": ".
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const write = process.argv.includes('--write')
const root = new URL('../docs/', import.meta.url).pathname

export const KEEP = new Set(
  `RushDB Python TypeScript JavaScript LangChain LangGraph OpenClaw Hermes NousResearch Claude Codex Copilot VS Docker
  Kubernetes Helm Homebrew Cargo Neo4j Aura MongoDB PostgreSQL Postgres SQLite Cypher Gremlin GraphQL Bolt AWS GCP Azure
  Google OpenAI Anthropic Ollama Stripe Slack GitHub Jira Notion Zapier Kafka Debezium Next.js Node.js Bun Deno FastAPI
  Flask Django Prisma Supabase Vercel Cloudflare Markdown REST HTTP Rust Linux macOS Windows Grafana Prometheus
  OpenTelemetry Redis Elasticsearch Pinecone Weaviate Qdrant Chroma LlamaIndex CrewAI AutoGen Mastra Vectra Hono Express
  Cursor Windsurf Zed Gemini Mistral Cohere HuggingFace Jupyter Pandas Arrow Parquet Excel Sheets Airtable HubSpot
  Salesforce Shopify Segment Mixpanel Amplitude PostHog Sentry Datadog Linear Figma Discord Telegram WhatsApp Twilio
  SendGrid Mailgun Firestore Firebase Clay Superglue Auth0 Clerk Okta Firebase Lambda S3 BigQuery Snowflake Databricks Spark Flink Airflow Dagster dbt`
    .split(/\s+/)
    .filter(Boolean)
)

/** Multi-word names that keep their case as a unit. */
export const KEEP_PHRASES = ['[Cloud]', 'RushDB Cloud', 'Labeled Meta Property Graph', 'Model Context Protocol', 'VS Code', 'Claude Desktop', 'Codex CLI', 'Google Sheets', 'GitHub Actions']

const keepWord = (word) => {
  const bare = word.replace(/^[^\w$`]+|[^\w.`]+$/g, '').replace(/['’]s$/, '')
  if (!bare) return true
  if (KEEP.has(bare) || KEEP.has(bare.replace(/[.'’s]+$/, ''))) return true
  if (/`/.test(word) || /^\$/.test(bare)) return true
  if (/\d/.test(bare)) return true
  if (/^[A-Z0-9]{2,}s?$/.test(bare)) return true // acronyms: API, SDKs, MCP
  if (/[a-z][A-Z]/.test(bare) || /^[A-Z][a-z]+[A-Z]/.test(bare)) return true // SearchQuery, DBRecord, OpenClaw
  if (/^[A-Z]$/.test(bare)) return true
  return false
}

export function sentenceCase(text) {
  // Protect inline code and phrases.
  const slots = []
  let out = text.replace(/`[^`]*`/g, (m) => `\u0000${slots.push(m) - 1}\u0000`)
  for (const phrase of KEEP_PHRASES) {
    out = out.split(phrase).join(`\u0000${slots.push(phrase) - 1}\u0000`)
  }
  let first = true
  out = out
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token) || token === '') return token
      // A numbered prefix ("1.", "2)") does not count as the first word.
      if (first && /^\d+[.)]$/.test(token)) return token
      const isFirst = first
      // A clause after ": " starts with a capital, as a new sentence would.
      first = /:$/.test(token)
      if (token.includes('\u0000')) return token
      // Hyphenated words: each part is judged on its own ("Self-Hosted" → "Self-hosted").
      return token
        .split('-')
        .map((part, i) => {
          if ((isFirst && i === 0) || keepWord(part)) return part
          return part.replace(/^([^A-Za-z]*)([A-Z])([a-z'’]*)([^A-Za-z]*)$/, (m, pre, c, rest, post) => pre + c.toLowerCase() + rest + post)
        })
        .join('-')
    })
    .join('')
  return out.replace(/\u0000(\d+)\u0000/g, (m, i) => slots[Number(i)])
}

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)])))
  return nested.flat()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let changes = 0
  for (const path of await files(root)) {
    const name = relative(root, path)
    if (!/\.mdx?$/.test(name) || name.startsWith('engine/')) continue
    const text = await readFile(path, 'utf8')
    let inFence = false
    let inFrontMatter = false
    const lines = text.split('\n').map((line, index) => {
      if (index === 0 && line === '---') {
        inFrontMatter = true
        return line
      }
      if (inFrontMatter) {
        if (line === '---') inFrontMatter = false
        const fm = line.match(/^(title|sidebar_label):\s*(['"]?)(.*)\2\s*$/)
        if (fm) return `${fm[1]}: ${fm[2]}${sentenceCase(fm[3])}${fm[2]}`
        return line
      }
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
      if (inFence) return line
      const h = line.match(/^(#{1,3}) (.+)$/)
      if (h) return `${h[1]} ${sentenceCase(h[2])}`
      return line
    })
    const next = lines.join('\n')
    if (next !== text) {
      const before = text.split('\n')
      lines.forEach((line, i) => {
        if (line !== before[i]) {
          changes++
          if (!write) console.log(`${name}:${i + 1}\n  - ${before[i]}\n  + ${line}`)
        }
      })
      if (write) await writeFile(path, next)
    }
  }
  console.log(`${changes} line(s) ${write ? 'changed' : 'would change'}.`)
  if (changes && process.argv.includes('--check')) {
    console.error('Run: node scripts/sentence-case.mjs --write (or add the name to KEEP / KEEP_PHRASES).')
    process.exit(1)
  }
}
