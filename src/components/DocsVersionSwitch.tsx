import Link from '@docusaurus/Link'
import { useEffect, useState } from 'react'
import {
  DEFAULT_DOCS_VERSION,
  DOCS_VERSIONS,
  type DocsVersion,
  docsVersionHref
} from '@site/docs-versioning'

function versionForPath(pathname: string): DocsVersion {
  return DOCS_VERSIONS.find((version) => pathname === `/${version}` || pathname.startsWith(`/${version}/`)) ?? DEFAULT_DOCS_VERSION
}

function label(version: DocsVersion): string {
  return version === DEFAULT_DOCS_VERSION ? `${version} (current)` : `${version} (legacy)`
}

export default function DocsVersionSwitch() {
  // The docs plugin may strip its route base path during server rendering while
  // the browser location retains it. Resolve after hydration so both renders
  // produce identical markup and a non-default version cannot lose its sidebar.
  const [activeVersion, setActiveVersion] = useState<DocsVersion>(DEFAULT_DOCS_VERSION)

  useEffect(() => {
    setActiveVersion(versionForPath(window.location.pathname))
  }, [])

  return (
    <nav className="rushdb-docs-version-switch" aria-label="Documentation version">
      <span className="rushdb-docs-version-switch__label">Docs</span>
      {DOCS_VERSIONS.map((version) => (
        <Link
          key={version}
          to={docsVersionHref(version)}
          className={version === activeVersion ? 'rushdb-docs-version-switch__link rushdb-docs-version-switch__link--active' : 'rushdb-docs-version-switch__link'}
          aria-current={version === activeVersion ? 'page' : undefined}
        >
          {label(version)}
        </Link>
      ))}
    </nav>
  )
}
