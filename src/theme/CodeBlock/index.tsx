import React from 'react'
import CodeBlock from '@theme-original/CodeBlock'
import type CodeBlockType from '@theme/CodeBlock'
import type { WrapperProps } from '@docusaurus/types'

type Props = WrapperProps<typeof CodeBlockType>

/**
 * Wraps every code block in `.rd-code`, which sets its width in the reading
 * column and lets a block first in a tab panel share the tab row's border.
 * The toolbar (language or title, Copy) is CodeBlock/Layout.
 */
export default function CodeBlockWrapper(props: Props): React.ReactElement {
  return (
    <div className="rd-code">
      <CodeBlock {...props} />
    </div>
  )
}
