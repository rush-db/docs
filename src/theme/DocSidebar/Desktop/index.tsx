import React, { useEffect, useState } from 'react'
import Link from '@docusaurus/Link'
import { useColorMode, useThemeConfig } from '@docusaurus/theme-common'
import type { WrapperProps } from '@docusaurus/types'
import DocSidebarDesktop from '@theme-original/DocSidebar/Desktop'
import Logo from '@theme/Logo'
import SidebarCommunity from '@site/src/components/SidebarCommunity'
import ThemeSwitch from '@site/src/components/ThemeSwitch'
import { PanelLeftClose, PanelLeft, Search } from 'lucide-react'
import type DocSidebarDesktopType from '@theme/DocSidebar/Desktop'

type Props = WrapperProps<typeof DocSidebarDesktopType>

const COLLAPSED_KEY = 'rushdb-docs-sidebar-collapsed'

function SidebarThemeToggle() {
  const { colorMode, setColorMode } = useColorMode()
  const {
    colorMode: { disableSwitch }
  } = useThemeConfig() as { colorMode: { disableSwitch?: boolean } }
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (disableSwitch) {
    return null
  }

  const isDark = colorMode === 'dark'

  return (
    <ThemeSwitch disabled={!mounted} isDark={isDark} onToggle={() => setColorMode(isDark ? 'light' : 'dark')} />
  )
}

function SidebarCollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="clean-btn rushdb-sidebar-control"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={onToggle}
    >
      {collapsed ?
        <PanelLeft aria-hidden="true" size={18} />
      : <PanelLeftClose aria-hidden="true" size={18} />}
    </button>
  )
}

export default function DocSidebarDesktopWrapper(props: Props) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === 'true')
  }, [])

  // The collapsed width is `--doc-sidebar-width`, switched on <html> so the
  // sidebar column and the main column resize together (custom.css).
  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    if (collapsed) {
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true')
    } else {
      document.documentElement.removeAttribute('data-sidebar-collapsed')
    }
  }, [collapsed])

  return (
    <div
      className={
        collapsed ?
          'rushdb-docs-sidebar-shell rushdb-docs-sidebar-shell--collapsed'
        : 'rushdb-docs-sidebar-shell'
      }
    >
      <div className="rushdb-docs-sidebar-header">
        <Logo />
        <Link href="https://app.rushdb.com" className="cta-button rushdb-sidebar-cta">
          Get API key
        </Link>
      </div>

      <button
        type="button"
        className="clean-btn rushdb-docs-sidebar-search-trigger"
        onClick={() => document.dispatchEvent(new CustomEvent('rushdb:open-search'))}
        aria-label="Search docs"
      >
        <Search aria-hidden="true" size={14} />
        <span className="rushdb-docs-sidebar-search-trigger__label">Search docs</span>
        <kbd>⌘K</kbd>
      </button>

      <DocSidebarDesktop {...props} />

      <div className="rushdb-docs-sidebar-footer">
        <SidebarCommunity />
        <div className="rushdb-sidebar-controls">
          <SidebarThemeToggle />
          <SidebarCollapseToggle collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
        </div>
      </div>

      <button
        type="button"
        className="clean-btn rushdb-sidebar-control rushdb-sidebar-expand-rail"
        aria-label="Expand sidebar"
        title="Expand sidebar"
        onClick={() => setCollapsed(false)}
      >
        <PanelLeft aria-hidden="true" size={18} />
      </button>
    </div>
  )
}
