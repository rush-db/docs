import React from 'react'
import MDXComponents from '@theme-original/MDXComponents'
import type { MDXComponentsObject } from '@theme/MDXComponents'

/** Wide tables scroll inside a bordered region that keyboard users can focus. */
function Table({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="markdown-table-wrapper" role="region" aria-label="Table" tabIndex={0}>
      <table {...props}>{children}</table>
    </div>
  )
}

export default {
  ...MDXComponents,
  table: Table
} satisfies MDXComponentsObject
