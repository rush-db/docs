import React, { useCallback, useEffect, useRef, useState } from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import { Check, ChevronDown, Copy, Sparkles } from 'lucide-react'
import { ClaudeIcon, GoogleIcon, GrokIcon, OpenAIIcon, PerplexityIcon } from '@site/src/components/BrandIcons'

const DOCS_BASE = 'https://docs.rushdb.com'

/** The page's Markdown copy (plugins/agent-readable.cjs): `/a/b/` → `/a/b.md`, `/` → `/index.md`. */
export function markdownUrl(permalink: string): string {
  return `/${permalink.replace(/^\/+|\/+$/g, '') || 'index'}.md`
}

const prompt = (pageUrl: string) =>
  `Read ${pageUrl} from the RushDB documentation and help me understand and apply it. Use docs.rushdb.com as the source.`

/** The website hero's "Ask AI" assistants (rush-db/website, lp/AskAI), in its order. */
const ASSISTANTS = [
  { name: 'ChatGPT', Icon: OpenAIIcon, brand: undefined, href: (q: string) => `https://chatgpt.com/?q=${q}` },
  { name: 'Claude', Icon: ClaudeIcon, brand: 'claude', href: (q: string) => `https://claude.ai/new?q=${q}` },
  { name: 'Perplexity', Icon: PerplexityIcon, brand: 'perplexity', href: (q: string) => `https://www.perplexity.ai/search?q=${q}` },
  { name: 'Grok', Icon: GrokIcon, brand: undefined, href: (q: string) => `https://grok.com/?q=${q}` },
  { name: 'Google AI', Icon: GoogleIcon, brand: 'google', href: (q: string) => `https://www.google.com/search?udm=50&q=${q}` }
]

async function fetchMarkdown(url: string): Promise<string | null> {
  const response = await fetch(url)
  if (!response.ok) return null
  const text = await response.text()
  const type = response.headers.get('content-type')?.toLowerCase() ?? ''
  return type.includes('text/html') || /^\s*<(!doctype html|html[\s>])/i.test(text) ? null : text
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    el.remove()
  }
}

function CopyMarkdownButton({ pageUrl }: { pageUrl: string }) {
  const { metadata } = useDoc()
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    let markdown: string | null = null
    try {
      markdown = await fetchMarkdown(markdownUrl(metadata.permalink))
    } catch {
      // Fall back to the title and URL below.
    }
    await writeClipboard(markdown ?? `# ${metadata.title}\n\n${pageUrl}\n`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }, [metadata.permalink, metadata.title, pageUrl])

  return (
    <button type="button" className="rd-button--ghost rd-page-action" onClick={copy} aria-label={copied ? 'Markdown copied' : 'Copy page as Markdown'}>
      {copied ?
        <Check size={14} aria-hidden="true" />
      : <Copy size={14} aria-hidden="true" />}
      <span className="rd-page-action__label">{copied ? 'Copied' : 'Copy markdown'}</span>
    </button>
  )
}

function AskAiMenu({ pageUrl }: { pageUrl: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const q = encodeURIComponent(prompt(pageUrl))

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="rd-ask-ai">
      {/* A disclosure, not a menu: the options are ordinary links. */}
      <button
        type="button"
        className="rd-button--ghost rd-page-action"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="ask-ai-options"
        aria-label="Ask AI about this page"
      >
        <Sparkles size={14} aria-hidden="true" />
        <span className="rd-page-action__label">Ask AI</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <ul id="ask-ai-options" className="rd-ask-ai__list">
          <li className="rd-ask-ai__heading" aria-hidden="true">
            Ask about this page
          </li>
          {ASSISTANTS.map(({ name, Icon, brand, href }) => (
            <li key={name}>
              <a
                href={href(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="rd-ask-ai__item"
                onClick={() => setOpen(false)}
              >
                <Icon size={14} className={brand ? `rd-brand rd-brand--${brand}` : 'rd-brand'} />
                {name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PageActionsInner() {
  const { metadata } = useDoc()
  const pageUrl = `${DOCS_BASE}${metadata.permalink}`
  return (
    <>
      <CopyMarkdownButton pageUrl={pageUrl} />
      <AskAiMenu pageUrl={pageUrl} />
    </>
  )
}

/** "Copy markdown" and "Ask AI" in the page header row. */
export default function PageActions() {
  return <BrowserOnly fallback={<span className="rd-page-actions__placeholder" />}>{() => <PageActionsInner />}</BrowserOnly>
}
