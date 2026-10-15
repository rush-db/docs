/**
 * When 3.x owns `/`, legacy 2.x Markdown links that began at `/` must remain
 * inside `/2.x/`, and links to `/3.x/...` move to the root that 3.x now owns.
 * This runs only while 3.x is the default generation.
 */
const rewrite = (url) => {
  if (url.startsWith('/3.x/')) return url.slice('/3.x'.length)
  if (url.startsWith('/2.x/')) return url
  return `/2.x${url}`
}

module.exports = function prefixLegacyDocLinks() {
  return (tree) => {
    const visit = (node) => {
      if (node && typeof node === 'object') {
        if (node.type === 'link' && typeof node.url === 'string' && node.url.startsWith('/')) {
          node.url = rewrite(node.url)
        }
        if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
          node.attributes?.forEach((attribute) => {
            if (attribute.type === 'mdxJsxAttribute' && attribute.name === 'href' && typeof attribute.value === 'string' && attribute.value.startsWith('/')) {
              attribute.value = rewrite(attribute.value)
            }
          })
        }
        if (Array.isArray(node.children)) node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}
