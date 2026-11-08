import React from 'react'
import Link from '@docusaurus/Link'
import { useLocation } from '@docusaurus/router'
import { DEFAULT_DOCS_VERSION, DOCS_VERSIONS, docsVersionHref } from '@site/docs-versioning'

/** The 404 page: what happened, and three ways forward (search, docs home, the other version). */
export default function NotFoundContent(): React.ReactElement {
  const { pathname } = useLocation()
  const legacy = DOCS_VERSIONS.find((version) => version !== DEFAULT_DOCS_VERSION)

  return (
    <main className="rd-not-found">
      <p className="t-label">404 · Page not found</p>
      <h1>This page does not exist</h1>
      <p>
        Nothing is published at <code>{pathname}</code>. It may have moved when the docs were reorganised for
        RushDB {DEFAULT_DOCS_VERSION}.
      </p>
      <ul>
        <li>
          <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('rushdb:open-search'))}>
            Search the docs
          </button>
        </li>
        <li>
          <Link to={docsVersionHref(DEFAULT_DOCS_VERSION)}>RushDB {DEFAULT_DOCS_VERSION} documentation</Link>
        </li>
        {legacy && (
          <li>
            <Link to={docsVersionHref(legacy)}>RushDB {legacy} (legacy) documentation</Link>
          </li>
        )}
      </ul>
    </main>
  )
}
