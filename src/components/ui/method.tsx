import React from 'react'

/** HTTP method badge (2.x API pages): mono, outlined, on tokens. `color` is accepted and ignored. */
export const Method = ({ method }: { method: string; color?: string }) => (
  <span className="rd-tag">{method}</span>
)
