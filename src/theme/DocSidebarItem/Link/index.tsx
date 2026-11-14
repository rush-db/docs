/**
 * Swizzled DocSidebarItem/Link component.
 * - Connect items: rendered with connect-sidebar-link classes and hardcoded icons.
 * - Any other item: rendered as a plain menu__link (no icon).
 */
import React, { type ReactNode } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import { ThemeClassNames } from '@docusaurus/theme-common'
import { isActiveSidebarItem } from '@docusaurus/plugin-content-docs/client'
import { ArrowRightLeft, Bot, Code2, Cpu, Database, Sparkles, Workflow } from 'lucide-react'

function ConnectIcon({ href, label }: { href: string; label: string }): ReactNode {
  // Match the page whichever docs version owns `/` (`/connect/...`, `/2.x/connect/...`, `/3.x/connect/...`).
  const path = href.toLowerCase().replace(/^\/\d+\.x(?=\/)/, '')

  if (path.startsWith('/connect/openclaw-memory')) {
    return (
      <img
        src="/img/integrations/openclaw.svg"
        width="14"
        height="14"
        className="sidebar-link-icon sidebar-link-icon--brand"
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (path.startsWith('/connect/hermes-memory')) {
    return (
      <img
        src="/img/integrations/hermes.png"
        width="14"
        height="14"
        className="sidebar-link-icon sidebar-link-icon--brand sidebar-link-icon--monochrome"
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (path.includes('rushdb.com/agent-setup') || path.startsWith('/connect/agents')) {
    return <Bot size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/mcp')) {
    return <Cpu size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/debezium')) {
    return <ArrowRightLeft size={15} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/obsidian')) {
    // Obsidian's brand rules allow the mark in one solid colour, never recoloured otherwise.
    return (
      <img
        src="/img/integrations/obsidian.svg"
        width="14"
        height="14"
        className="sidebar-link-icon sidebar-link-icon--brand sidebar-link-icon--single-colour"
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (path.startsWith('/connect/langchain')) {
    return <Workflow size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/llamaindex')) {
    // LlamaIndex's square mark (LlamaSquareBlack.svg from run-llama/llama_index), unmodified.
    return (
      <img
        src="/img/integrations/llamaindex.svg"
        width="14"
        height="14"
        className="sidebar-link-icon sidebar-link-icon--brand"
        alt=""
        aria-hidden="true"
      />
    )
  }
  if (path.startsWith('/connect/sdks')) {
    return <Code2 size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/sql-and-cypher')) {
    return <Database size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path.startsWith('/connect/skills')) {
    return <Sparkles size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }
  if (path === '/connect/' || path === '/connect') {
    return <Sparkles size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
  }

  switch (label) {
    case 'Skills':
      return <Sparkles size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
    case 'MCP':
      return <Cpu size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
    case 'Agents':
      return <Bot size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
    case 'SDKs':
      return <Code2 size={14} strokeWidth={1.75} className="sidebar-link-icon" aria-hidden="true" />
    default:
      return null
  }
}

interface SidebarItemLink {
  type: 'link'
  href: string
  label: string
  className?: string
  customProps?: Record<string, unknown>
  autoAddBaseUrl?: boolean
}

interface Props {
  item: SidebarItemLink
  onItemClick?: (item: SidebarItemLink) => void
  activePath: string
  level: number
  index: number
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props): ReactNode {
  const { href, label, className } = item
  const isActive = isActiveSidebarItem(item, activePath)
  const isExternal = /^https?:\/\//.test(href)
  const isConnectItem = className?.includes('connect-sidebar-link')

  if (isConnectItem) {
    return (
      <li
        className={clsx(
          ThemeClassNames.docs.docSidebarItemLink,
          ThemeClassNames.docs.docSidebarItemLinkLevel(level),
          'menu__list-item',
          className
        )}
      >
        <Link
          className={clsx('menu__link', 'connect-sidebar-link__link', {
            'menu__link--active': isActive,
            'connect-sidebar-link__link--external': isExternal
          })}
          aria-current={isActive ? 'page' : undefined}
          to={href}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
          {...props}
        >
          <ConnectIcon href={href} label={label} />
          <span className="connect-sidebar-link__label">{label}</span>
        </Link>
      </li>
    )
  }

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item'
      )}
    >
      <Link
        className={clsx('menu__link', { 'menu__link--active': isActive })}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        onClick={onItemClick ? () => onItemClick(item) : undefined}
        {...props}
      >
        {label}
      </Link>
    </li>
  )
}
