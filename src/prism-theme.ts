import type { PrismTheme } from 'prism-react-renderer'

/**
 * The syntax theme for code blocks. Token colours are the --code-* variables
 * from src/css/tokens.css (copied from the website), so one theme serves light
 * and dark. Mirrors the website's src/components/lp/code/codeTheme.ts.
 */
const c = (name: string) => ({ color: `var(--code-${name})` })

export const codeTheme: PrismTheme = {
  plain: { color: 'var(--code-text)', backgroundColor: 'var(--lp-surface)' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { ...c('comment'), fontStyle: 'italic' } },
    { types: ['keyword', 'atrule', 'important', 'selector'], style: c('keyword') },
    { types: ['boolean', 'number', 'constant', 'symbol'], style: c('number') },
    { types: ['string', 'char', 'attr-value', 'regex', 'inserted', 'url'], style: c('string') },
    { types: ['function', 'class-name', 'builtin', 'relationship'], style: c('function') },
    { types: ['property', 'variable', 'attr-name', 'tag', 'property-access', 'deleted'], style: c('property') },
    { types: ['operator', 'punctuation', 'entity'], style: c('punctuation') }
  ]
}
