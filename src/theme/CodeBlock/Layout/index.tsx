import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { useCodeBlockContext } from '@docusaurus/theme-common/internal'
import Container from '@theme/CodeBlock/Container'
import Title from '@theme/CodeBlock/Title'
import Content from '@theme/CodeBlock/Content'
import type { Props } from '@theme/CodeBlock/Layout'
import { Check, Copy } from 'lucide-react'

/*
 * Ejected from @docusaurus/theme-classic CodeBlock/Layout. Every code block
 * gets the website article toolbar (rush-db/website, ArticleCodeBlock): the
 * fence `title` or the language on the left, a labelled Copy button on the
 * right. It replaces the floating copy and word-wrap buttons; long lines
 * scroll sideways, as on the website.
 */

const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  console: 'Shell',
  python: 'Python',
  py: 'Python',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  json: 'JSON',
  jsonc: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  ini: 'INI',
  env: 'ENV',
  sql: 'SQL',
  cypher: 'Cypher',
  gql: 'GQL',
  groovy: 'Gremlin',
  http: 'HTTP',
  rust: 'Rust',
  protobuf: 'Protobuf',
  dockerfile: 'Dockerfile',
  text: 'Text'
}

async function copyText(text: string) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text)
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  el.remove()
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<number | undefined>(undefined)

  const copy = useCallback(() => {
    void copyText(code).then(() => {
      setCopied(true)
      window.clearTimeout(timeout.current)
      timeout.current = window.setTimeout(() => setCopied(false), 1200)
    })
  }, [code])

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  return (
    <button type="button" className="clean-btn rd-code__copy" onClick={copy} aria-label={copied ? 'Code copied' : 'Copy code'}>
      {copied ?
        <Check aria-hidden="true" />
      : <Copy aria-hidden="true" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}

export default function CodeBlockLayout({ className }: Props): ReactNode {
  const { metadata } = useCodeBlockContext()
  const language = metadata.language?.toLowerCase()
  const label = metadata.title ?? (language ? (LANGUAGE_LABELS[language] ?? language) : undefined)

  return (
    <Container as="div" className={clsx(className, metadata.className)}>
      <div className="rd-code__toolbar">
        {/* Inside language tabs the tab names the language, so only a fence title shows. */}
        <span className={clsx('rd-code__label', !metadata.title && 'rd-code__label--language')}>
          {metadata.title ? <Title>{metadata.title}</Title> : label}
        </span>
        <CopyCodeButton code={metadata.code} />
      </div>
      <div className="rd-code__scroll">
        <Content />
      </div>
    </Container>
  )
}
