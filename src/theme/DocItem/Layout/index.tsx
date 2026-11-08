import React from 'react'
import Head from '@docusaurus/Head'
import { useDoc } from '@docusaurus/plugin-content-docs/client'
import DocItemLayout from '@theme-original/DocItem/Layout'
import type DocItemLayoutType from '@theme/DocItem/Layout'
import type { WrapperProps } from '@docusaurus/types'
import Admonition from '@theme/Admonition'
import { DEFAULT_DOCS_VERSION, docsPathForVersion } from '@site/docs-versioning'
import { markdownUrl } from '@site/src/components/PageActions'

type Props = WrapperProps<typeof DocItemLayoutType>
type PageFrontMatter = {
  force_container?: boolean
  overview_page?: boolean
}

/** Shown above every 2.x page while 2.x is not the default generation. */
function LegacyBanner() {
  return (
    <Admonition type="warning" icon={null} title={null} className="rushdb-legacy-banner">
      <strong>RushDB 2.x (legacy, Neo4j-based).</strong> Security fixes only until 2027-10-28.
      <br />
      New projects: use <a href="https://github.com/rush-db/rushdb">RushDB 3</a>, a standalone Rust database for AI.
    </Admonition>
  )
}

/**
 * Search and AI answers should cite the current docs only: 2.x pages stay
 * reachable and followable but are not indexed. Current pages describe
 * themselves as a TechArticle of the docs site.
 */
function PageSeo({ isLegacy }: { isLegacy: boolean }) {
  const { metadata } = useDoc()
  // Every page has a Markdown copy (plugins/agent-readable.cjs), as on the website.
  const markdown = <link rel="alternate" type="text/markdown" href={markdownUrl(metadata.permalink)} />
  if (isLegacy) {
    return (
      <Head>
        <meta name="robots" content="noindex, follow" />
        {markdown}
      </Head>
    )
  }
  const url = `https://docs.rushdb.com${metadata.permalink}`
  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: metadata.title,
    description: metadata.description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    ...(metadata.lastUpdatedAt ? { dateModified: new Date(metadata.lastUpdatedAt).toISOString() } : {}),
    isPartOf: { '@id': 'https://docs.rushdb.com/#website' },
    publisher: { '@id': 'https://rushdb.com/#organization' }
  }
  return (
    <Head>
      {markdown}
      <script type="application/ld+json">{JSON.stringify(article)}</script>
    </Head>
  )
}

export default function DocItemLayoutWrapper(props: Props) {
  const { frontMatter, metadata } = useDoc()
  const pageFrontMatter = frontMatter as typeof frontMatter & PageFrontMatter
  const isLegacy = DEFAULT_DOCS_VERSION !== '2.x' && metadata.permalink.startsWith(docsPathForVersion('2.x', '/'))
  const children = (
    <>
      <PageSeo isLegacy={isLegacy} />
      {isLegacy && <LegacyBanner />}
      {props.children}
    </>
  )

  if (pageFrontMatter.overview_page) {
    return <main className="doc-layout--overview margin-vert--lg container">{children}</main>
  }

  if (pageFrontMatter.force_container) {
    return (
      <div className="doc-layout--force-container">
        <DocItemLayout {...props}>{children}</DocItemLayout>
      </div>
    )
  }

  return <DocItemLayout {...props}>{children}</DocItemLayout>
}
