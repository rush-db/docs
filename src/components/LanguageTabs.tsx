import React from 'react'
import Tabs from '@theme/Tabs'
import { BashIcon, JavaScriptIcon, PythonIcon, TypeScriptIcon } from '@site/src/components/BrandIcons'

/** Render order: lower number = shown first. Unknown values get 99. */
const LANG_ORDER: Record<string, number> = {
  python: 0,
  typescript: 1,
  javascript: 2,
  shell: 3
}

/** The one label per language value (AGENTS.md, "Code in several languages"). */
const LANG_LABELS: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  shell: 'Shell'
}

/** The website blog's tab icons (rush-db/website, lp/LangIcon). */
const LANG_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  python: PythonIcon,
  typescript: TypeScriptIcon,
  javascript: JavaScriptIcon,
  shell: BashIcon
}

function tabLabel(value: string, fallback?: string): React.ReactNode {
  const text = LANG_LABELS[value] ?? fallback ?? value
  const Icon = LANG_ICONS[value]
  return Icon ?
      <>
        <Icon size={14} />
        {text}
      </>
    : text
}

interface LanguageTabsProps {
  children: React.ReactNode
  /** Accepted for drop-in compatibility with <Tabs groupId="..."> usage; always
   *  overridden internally to "programming-language" for cross-page tab syncing. */
  groupId?: string
  [key: string]: unknown
}

/**
 * The language tab set for code samples. It:
 *  - enforces `groupId="programming-language"`, so the reader's choice carries across pages;
 *  - renders Python, TypeScript, JavaScript, Shell in that order, anything else after;
 *  - sets each tab's label (icon and name) from LANG_ICONS and LANG_LABELS, so labels never drift between pages;
 *  - makes the first tab the default.
 *
 * Usage in MDX (import as `Tabs` so the body tags stay standard):
 * ```mdx
 * import Tabs from '@site/src/components/LanguageTabs';
 * import TabItem from '@theme/TabItem';
 * ```
 */
export default function LanguageTabs({ children }: LanguageTabsProps): React.ReactElement {
  const items = React.Children.toArray(children).filter((child): child is React.ReactElement<{ value: string; label?: string }> =>
    React.isValidElement(child)
  )

  const sorted = [...items].sort((a, b) => (LANG_ORDER[a.props.value] ?? 99) - (LANG_ORDER[b.props.value] ?? 99))

  const enhanced = sorted.map((child, index) =>
    React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      key: child.props.value,
      label: tabLabel(child.props.value, child.props.label),
      default: index === 0
    })
  )

  return (
    <div className="language-tabs">
      <Tabs groupId="programming-language">{enhanced as React.ReactElement[]}</Tabs>
    </div>
  )
}
