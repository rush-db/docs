import React, { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useHistory } from '@docusaurus/router'
import SearchBar from '@theme-original/SearchBar'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const history = useHistory()

  // Close on any navigation (covers result clicks via history.push)
  useEffect(() => {
    return history.listen(() => onClose())
  }, [history, onClose])

  // Focus the search input when modal opens
  useEffect(() => {
    if (!isOpen) return
    let attempts = 0
    let timeout: ReturnType<typeof setTimeout> | undefined

    const focusInput = () => {
      const input = modalRef.current?.querySelector<HTMLInputElement>(
        '.navbar__search-input, input[type="search"], input.aa-Input, input[class*="Input"], input[class*="input"]'
      )
      if (input) {
        input.focus()
        return
      }

      attempts += 1
      if (attempts < 10) {
        timeout = setTimeout(focusInput, 50)
      }
    }

    timeout = setTimeout(focusInput, 0)
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isOpen])

  // Escape closes; Tab stays inside the dialog; focus returns to the trigger.
  useEffect(() => {
    if (!isOpen) return
    const trigger = document.activeElement as HTMLElement | null
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      trigger?.focus?.()
    }
  }, [isOpen, onClose])

  // Prevent layout shift caused by scrollbar disappearing
  useEffect(() => {
    if (!isOpen) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.paddingRight = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="rushdb-search-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="rushdb-search-modal" ref={modalRef}>
        <div className="rushdb-search-modal__header">
          <SearchBar />
        </div>
        <button
          type="button"
          className="rushdb-search-modal__close clean-btn"
          onClick={onClose}
          aria-label="Close search"
        >
          <kbd>Esc</kbd>
        </button>
      </div>
    </div>,
    document.body
  )
}
