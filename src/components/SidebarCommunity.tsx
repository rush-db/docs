import React, { useEffect, useState } from 'react'
import Link from '@docusaurus/Link'
import { ArrowRight, FileText, Globe, Linkedin, Rss, Youtube } from 'lucide-react'
import { DEFAULT_DOCS_VERSION, DOCS_VERSIONS, type DocsVersion, docsVersionHref } from '@site/docs-versioning'
import { DiscordIcon, GitHubIcon, XIcon } from '@site/src/components/BrandIcons'

const RESOURCES = [
  { label: 'rushdb.com', href: 'https://rushdb.com', Icon: Globe },
  { label: 'Blog', href: 'https://rushdb.com/blog', Icon: Rss },
  { label: 'llms.txt', href: '/llms.txt', Icon: FileText }
]

/** The website footer's social row (rush-db/website, Layout/Footer). */
const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/rush-db/rushdb', Icon: GitHubIcon },
  { label: 'X (formerly Twitter)', href: 'https://x.com/RushDatabase', Icon: XIcon },
  { label: 'Discord', href: 'https://discord.gg/7F4cXx8DuU', Icon: DiscordIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@rush-db', Icon: Youtube },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/rushdb/', Icon: Linkedin }
]

function versionForPath(pathname: string): DocsVersion {
  return (
    DOCS_VERSIONS.find((version) => pathname === `/${version}` || pathname.startsWith(`/${version}/`)) ??
    DEFAULT_DOCS_VERSION
  )
}

/**
 * On current docs: a link to the 2.x legacy docs. On 2.x pages: back to the
 * current docs. Resolved after hydration so server and client markup match.
 */
function VersionLink() {
  const [version, setVersion] = useState<DocsVersion>(DEFAULT_DOCS_VERSION)
  useEffect(() => setVersion(versionForPath(window.location.pathname)), [])

  const target = version === DEFAULT_DOCS_VERSION ? DOCS_VERSIONS.find((v) => v !== DEFAULT_DOCS_VERSION) : DEFAULT_DOCS_VERSION
  if (!target) return null
  const label = target === DEFAULT_DOCS_VERSION ? `${target} docs (current)` : `${target} legacy docs`

  return (
    <Link to={docsVersionHref(target)} className="rushdb-sidebar-community__version">
      <span>{label}</span>
      <ArrowRight aria-hidden="true" size={14} />
    </Link>
  )
}

export default function SidebarCommunity({ className }: { className?: string }) {
  return (
    <div className={['rushdb-sidebar-community', className].filter(Boolean).join(' ')}>
      <VersionLink />
      <ul className="rushdb-sidebar-community__resources">
        {RESOURCES.map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              className="rushdb-sidebar-community__link"
              {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Icon aria-hidden="true" size={14} />
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="rushdb-sidebar-community__socials">
        {SOCIALS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="rushdb-sidebar-community__social"
          >
            <Icon aria-hidden="true" size={16} strokeWidth={1.5} />
          </a>
        ))}
      </div>
    </div>
  )
}
