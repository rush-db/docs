/**
 * The only switch required to change which documentation generation owns `/`.
 *
 * 3.x has been the default since RushDB 3.0.0 reached general availability.
 * The other generation remains available at `/${version}/`.
 */
export const DOCS_VERSIONS = ['2.x', '3.x'] as const

export type DocsVersion = (typeof DOCS_VERSIONS)[number]

export const DEFAULT_DOCS_VERSION: DocsVersion = '3.x'

export const docsSourcePath: Record<DocsVersion, string> = {
  '2.x': 'v2',
  '3.x': 'docs'
}

export const docsSidebarPath: Record<DocsVersion, string> = {
  '2.x': './sidebars.ts',
  '3.x': './sidebars.v3.ts'
}

/** Plugin IDs cannot contain dots; URLs retain the human-readable version. */
export const docsPluginId: Record<DocsVersion, string> = {
  '2.x': 'v2',
  '3.x': 'v3'
}

const docsHomePath: Record<DocsVersion, string> = {
  '2.x': 'get-started/quick-tutorial',
  '3.x': ''
}

export function docsRouteBasePath(version: DocsVersion): string {
  return version === DEFAULT_DOCS_VERSION ? '/' : `/${version}`
}

export function docsVersionHref(version: DocsVersion): string {
  const basePath = docsRouteBasePath(version)
  const homePath = docsHomePath[version]
  if (basePath === '/') return homePath ? `/${homePath}` : '/'
  return homePath ? `${basePath}/${homePath}` : `${basePath}/`
}

export function docsPathForVersion(version: DocsVersion, path: string): string {
  const basePath = docsRouteBasePath(version)
  return basePath === '/' ? path : `${basePath}${path}`
}

export function alternateDocsVersion(version: DocsVersion): DocsVersion {
  return version === '2.x' ? '3.x' : '2.x'
}
