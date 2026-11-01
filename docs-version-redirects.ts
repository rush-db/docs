import type { LoadContext, Plugin } from '@docusaurus/types'
import { DEFAULT_DOCS_VERSION, alternateDocsVersion, docsPluginId, docsRouteBasePath } from './docs-versioning'

/**
 * Keeps the URLs of the previous version layout working after
 * `DEFAULT_DOCS_VERSION` changes. When 3.x is the default:
 *
 * - `/3.x/<path>` → `/<path>` for every 3.x page and tag page;
 * - an old unversioned 2.x URL `/<path>` → `/2.x/<path>`, unless a 3.x page now
 *   owns `/<path>`.
 *
 * The routes come from what the docs plugin loaded from `docs/` and `docs-v3/`,
 * so the lists follow the file trees (including `slug` front matter and tag
 * pages) without being maintained by hand.
 */

type LoadedDocsContent = {
  loadedVersions: Array<{
    path: string
    tagsPath: string
    docs: Array<{ permalink: string; tags: Array<{ permalink: string }> }>
  }>
}

const withoutTrailingSlash = (route: string) => (route.length > 1 ? route.replace(/\/+$/, '') : route)

const versionRoutes: Record<'default' | 'alternate', Set<string>> = {
  default: new Set(),
  alternate: new Set()
}

function routesOf(content: LoadedDocsContent | undefined): Set<string> {
  const routes = new Set<string>()
  for (const version of content?.loadedVersions ?? []) {
    for (const doc of version.docs) {
      routes.add(withoutTrailingSlash(doc.permalink))
      doc.tags.forEach((tag) => routes.add(withoutTrailingSlash(tag.permalink)))
    }
    if (version.docs.some((doc) => doc.tags.length > 0)) routes.add(withoutTrailingSlash(version.tagsPath))
  }
  return routes
}

/** Collects the routes of both docs instances once all content is loaded. */
export function docsVersionRoutesPlugin(_context: LoadContext): Plugin {
  return {
    name: 'docs-version-routes',
    async allContentLoaded({ allContent }) {
      const docsContent = allContent['docusaurus-plugin-content-docs'] as Record<string, LoadedDocsContent>
      versionRoutes.default = routesOf(docsContent.default)
      versionRoutes.alternate = routesOf(docsContent[docsPluginId[alternateDocsVersion(DEFAULT_DOCS_VERSION)]])
    }
  }
}

/** `createRedirects` for @docusaurus/plugin-client-redirects. */
export function docsVersionRedirects(existingPath: string): string[] | undefined {
  const route = withoutTrailingSlash(existingPath)
  const alternateBase = docsRouteBasePath(alternateDocsVersion(DEFAULT_DOCS_VERSION))

  if (versionRoutes.default.has(route)) {
    return [route === '/' ? `/${DEFAULT_DOCS_VERSION}` : `/${DEFAULT_DOCS_VERSION}${route}`]
  }

  if (versionRoutes.alternate.has(route) && route.startsWith(`${alternateBase}/`)) {
    const unversioned = route.slice(alternateBase.length)
    if (!versionRoutes.default.has(unversioned)) return [unversioned]
  }

  return undefined
}
