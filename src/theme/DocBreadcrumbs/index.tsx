import React from 'react'
import Link from '@docusaurus/Link'
import { useSidebarBreadcrumbs } from '@docusaurus/plugin-content-docs/client'
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData'
import PageActions from '@site/src/components/PageActions'

/**
 * The page header row: the full sidebar path (`LEARN / RECORDS & QUERIES /
 * STORE RECORDS`) and the page actions. Keeps the stock BreadcrumbList
 * structured data for search engines.
 */
export default function DocBreadcrumbsWrapper() {
  const breadcrumbs = useSidebarBreadcrumbs() ?? []

  return (
    <div className="doc-actions">
      {breadcrumbs.length > 0 && <DocBreadcrumbsStructuredData breadcrumbs={breadcrumbs} />}
      {breadcrumbs.length > 0 ?
        <nav className="rd-breadcrumbs" aria-label="Breadcrumbs">
          <ol>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const href = 'href' in item ? item.href : undefined
              return (
                <li key={`${item.label}-${index}`}>
                  {isLast ?
                    <span aria-current="page">{item.label}</span>
                  : href ?
                    <Link to={href}>{item.label}</Link>
                  : <span>{item.label}</span>}
                </li>
              )
            })}
          </ol>
        </nav>
      : <span />}
      <div className="rd-page-actions">
        <PageActions />
      </div>
    </div>
  )
}
