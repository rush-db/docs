import React from 'react'
import { Moon, Sun } from 'lucide-react'

type Props = {
  className?: string
  disabled?: boolean
  isDark: boolean
  onToggle: () => void
}

/** The website's theme toggle: a square icon button showing the mode it switches to. */
export default function ThemeSwitch({ className, disabled, isDark, onToggle }: Props) {
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={['rushdb-theme-switch', className].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      {isDark ?
        <Sun size={18} aria-hidden="true" />
      : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
