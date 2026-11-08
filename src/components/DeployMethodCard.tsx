import React from 'react'
import Link from '@docusaurus/Link'
import {
  ArrowRight,
  Box,
  Check,
  ClipboardList,
  Clock,
  Cloud,
  Code2,
  ExternalLink,
  Globe,
  Layers,
  Server,
  Terminal,
  type LucideIcon
} from 'lucide-react'
import { cn } from './ui/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  Box,
  ClipboardList,
  Cloud,
  Code2,
  Globe,
  Layers,
  Server
}

const BORDER_CLASS = 'border-lp-border'

// ── Badge config ───────────────────────────────────────────────────────────────

type BadgeVariant = 'beginner' | 'intermediate' | 'advanced' | 'cloud' | 'self-hosted' | 'byoc' | 'required'

/** Badges are outlined mono labels; colour is reserved for status (DESIGN.md). */
const BADGE_STYLES: Record<BadgeVariant, { label: string; className: string }> = {
  beginner: { label: 'Beginner', className: 'text-lp-muted' },
  intermediate: { label: 'Intermediate', className: 'text-lp-muted' },
  advanced: { label: 'Advanced', className: 'text-lp-muted' },
  cloud: { label: 'Cloud', className: 'text-lp-text' },
  'self-hosted': { label: 'Self-hosted', className: 'text-lp-text' },
  byoc: { label: 'BYOC', className: 'text-lp-text' },
  required: { label: 'Required', className: 'text-lp-warning' }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type DeployMethodCardProps = {
  title: string
  description: string
  badge: BadgeVariant
  time?: string
  prerequisites?: string[]
  commands?: string[]
  tags?: string[]
  href: string
  recommended?: boolean
  icon?: string
}

// ── Card ───────────────────────────────────────────────────────────────────────

export function DeployMethodCard({
  title,
  description,
  badge,
  time,
  prerequisites = [],
  commands = [],
  tags = [],
  href
}: DeployMethodCardProps) {
  const b = BADGE_STYLES[badge]

  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col border',
        BORDER_CLASS,
        'bg-lp-surface p-6 text-inherit no-underline',
        'transition-colors',
        'hover:border-lp-text hover:no-underline focus:no-underline'
      )}
    >
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="m-0 text-base font-medium text-lp-text">{title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {time && (
            <span className="flex items-center gap-1 text-2xs text-lp-subtle">
              <Clock size={11} strokeWidth={2} />
              {time}
            </span>
          )}
          <span className={cn('t-micro border border-current px-2 py-0.5 uppercase', b.className)}>
            {b.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-lp-body">{description}</p>

      {/* Prerequisites + Commands */}
      {(prerequisites.length > 0 || commands.length > 0) && (
        <div
          className={cn(
            'mb-4 grid gap-4 border-t pt-4',
            BORDER_CLASS,
            commands.length > 0 && prerequisites.length > 0 ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {prerequisites.length > 0 && (
            <div>
              <p className="mb-2 t-label">
                Prerequisites
              </p>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {prerequisites.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-1.5 text-sm text-lp-body"
                  >
                    <Check size={12} strokeWidth={2.5} className="shrink-0 text-lp-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {commands.length > 0 && (
            <div>
              <p className="mb-2 t-label">
                Key Commands
              </p>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {commands.map((cmd) => (
                  <li
                    key={cmd}
                    className="flex items-start gap-1.5 font-mono text-xs text-lp-body"
                  >
                    <Terminal
                      size={12}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-lp-subtle"
                    />
                    <code className="m-0 truncate bg-transparent p-0 text-xs">{cmd}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rd-tag"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-lp-muted transition-colors group-hover:text-lp-text">
        View full guide <ArrowRight size={14} />
      </span>
    </Link>
  )
}

// ── Grid wrapper ───────────────────────────────────────────────────────────────

export function DeployMethodCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="not-prose grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
}

// ── Cross-link section ─────────────────────────────────────────────────────────

type CrossLink = { label: string; href: string }
type DeployButtonVariant = 'primary' | 'secondary'
type DeployButton = {
  label: string
  href: string
  variant?: DeployButtonVariant
}

export function DeployCrossLinks({ prefix, links }: { prefix?: string; links: CrossLink[] }) {
  return (
    <div className={cn('not-prose mt-8 border-t pt-6', BORDER_CLASS)}>
      {prefix && <p className="mb-3 text-sm text-lp-muted">{prefix}</p>}
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            to={l.href}
            className={cn(
              'flex items-center gap-1.5 border',
              BORDER_CLASS,
              'bg-lp-surface px-4 py-2 text-sm font-medium text-inherit no-underline',
              'transition-[background-color] hover:border-lp-text hover:no-underline'
            )}
          >
            {l.label} <ArrowRight size={13} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export function DeployButtonGroup({ buttons }: { buttons: DeployButton[] }) {
  return (
    <div className="not-prose my-6 flex flex-wrap gap-3">
      {buttons.map((button) => {
        const variant = button.variant ?? 'secondary'

        return (
          <Link
            key={button.href}
            to={button.href}
            className={cn(
              't-button inline-flex items-center gap-2 border px-4 py-2 no-underline',
              'transition-colors hover:no-underline',
              variant === 'primary' ?
                'rd-button--primary'
              : cn(
                  BORDER_CLASS,
                  'bg-lp-surface text-inherit hover:border-lp-text'
                )
            )}
          >
            {button.label}
            <ExternalLink size={14} strokeWidth={2} />
          </Link>
        )
      })}
    </div>
  )
}

// ── Row (full-width) ───────────────────────────────────────────────────────────

export type DeployMethodRowProps = DeployMethodCardProps

export function DeployMethodRow({
  title,
  description,
  badge,
  time,
  prerequisites = [],
  commands = [],
  tags = [],
  href,
  recommended,
  icon
}: DeployMethodRowProps) {
  const b = BADGE_STYLES[badge]
  const Icon = icon ? ICON_MAP[icon] : null

  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col border',
        BORDER_CLASS,
        'bg-lp-surface p-6 text-inherit no-underline',
        'transition-colors',
        'hover:border-lp-text hover:no-underline focus:no-underline'
      )}
    >
      {/* Header: icon + title/badges/description + time */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-lp-border text-lp-text">
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
            </div>
          )}
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-base font-medium text-lp-text">
                {title}
              </h3>
              {recommended && (
                <span className="t-micro border border-lp-accent bg-lp-accent px-2 py-0.5 uppercase text-lp-bg">
                  Recommended
                </span>
              )}
              <span className={cn('t-micro border border-current px-2 py-0.5 uppercase', b.className)}>
                {b.label}
              </span>
            </div>
            <p className="m-0 text-sm text-lp-body">{description}</p>
          </div>
        </div>
        {time && (
          <span className="flex shrink-0 items-center gap-1 text-2xs text-lp-subtle">
            <Clock size={11} strokeWidth={2} />
            {time}
          </span>
        )}
      </div>

      {/* Prerequisites + Commands */}
      {(prerequisites.length > 0 || commands.length > 0) && (
        <div
          className={cn(
            'mb-4 grid gap-6 border-t pt-4',
            BORDER_CLASS,
            commands.length > 0 && prerequisites.length > 0 ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {prerequisites.length > 0 && (
            <div>
              <p className="mb-2 t-label">
                Prerequisites
              </p>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {prerequisites.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-1.5 text-sm text-lp-body"
                  >
                    <Check size={12} strokeWidth={2.5} className="shrink-0 text-lp-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {commands.length > 0 && (
            <div>
              <p className="mb-2 t-label">
                Key Commands
              </p>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {commands.map((cmd) => (
                  <li
                    key={cmd}
                    className="flex items-start gap-1.5 font-mono text-xs text-lp-body"
                  >
                    <Terminal
                      size={12}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-lp-subtle"
                    />
                    <code className="m-0 bg-transparent p-0 text-xs">{cmd}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer: tags + CTA */}
      <div className={cn('flex items-center justify-between gap-4 border-t pt-4', BORDER_CLASS)}>
        {tags.length > 0 ?
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rd-tag"
              >
                {t}
              </span>
            ))}
          </div>
        : <div />}
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-lp-muted transition-colors group-hover:text-lp-text">
          View full guide <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

// ── Row list wrapper ───────────────────────────────────────────────────────────

export function DeployMethodRowList({ children }: { children: React.ReactNode }) {
  return <div className="not-prose flex flex-col gap-4">{children}</div>
}
