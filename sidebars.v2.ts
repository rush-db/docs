import legacySidebars from './sidebars'

/**
 * The 2.x sidebar contains a few explicit root-relative hrefs. Prefix them
 * when 2.x is shown below a 3.x default so navigation stays in its version.
 */
function prefixLegacyHrefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(prefixLegacyHrefs)
  if (!value || typeof value !== 'object') return value

  const item = value as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(item).map(([key, child]) => {
      if (key === 'href' && typeof child === 'string' && child.startsWith('/') && !child.startsWith('/2.x/')) {
        return [key, `/2.x${child}`]
      }
      return [key, prefixLegacyHrefs(child)]
    })
  )
}

export default prefixLegacyHrefs(legacySidebars) as typeof legacySidebars
