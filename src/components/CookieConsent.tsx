import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { gtmId, initializeAnalytics, setAnalyticsConsent } from '@site/src/analytics'
import {
  dismissForSession,
  grantConsent,
  hasConsent,
  isDismissed,
  migrateLegacyConsent,
  renewConsent,
  withdrawConsent
} from '@site/src/consent'

const OPEN_EVENT = 'rushdb:cookie-settings'

/** Shows the cookie notice again (the sidebar's "Cookie settings"). */
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

type View = 'hidden' | 'notice' | 'granted'

/**
 * The website's cookie notice (CookiesConsent.tsx): same behaviour and copy,
 * docs styling. Renders only when GTM_ID was set at build time. Without the
 * shared consent cookie (src/consent.ts) it shows on every visit until the
 * reader accepts; Decline or Dismiss hide it for this browser session.
 * openCookieSettings() reopens it: as the notice, or, once consent is
 * granted, with a single action to withdraw it.
 */
export default function CookieConsent() {
  const [view, setView] = useState<View>('hidden')
  const [reopened, setReopened] = useState(false)
  const firstAction = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!gtmId) return
    migrateLegacyConsent()
    if (hasConsent()) {
      renewConsent({ oncePerSession: true })
      initializeAnalytics()
    } else if (!isDismissed()) setView('notice')

    const handleOpen = () => {
      setView(hasConsent() ? 'granted' : 'notice')
      setReopened(true)
    }
    window.addEventListener(OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_EVENT, handleOpen)
  }, [])

  // Opened from "Cookie settings": move focus into the notice.
  useEffect(() => {
    if (reopened && view !== 'hidden') firstAction.current?.focus()
  }, [reopened, view])

  const close = () => {
    setView('hidden')
    setReopened(false)
  }

  const handleAccept = () => {
    grantConsent()
    renewConsent()
    initializeAnalytics()
    close()
  }

  const handleReject = () => {
    dismissForSession()
    setAnalyticsConsent(false)
    close()
  }

  if (!gtmId || view === 'hidden') return null

  return (
    <section className="rd-cookie-consent" aria-labelledby="rd-cookie-consent-label">
      <div className="rd-cookie-consent__header">
        <span id="rd-cookie-consent-label" className="t-label">
          Cookies
        </span>
        <button
          type="button"
          className="rd-icon-button"
          aria-label="Dismiss"
          onClick={view === 'granted' ? close : handleReject}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      {view === 'granted' ? (
        <>
          <p className="rd-cookie-consent__text t-small">
            Analytics cookies are on for rushdb.com, the app and the docs. Read about{' '}
            <a href="https://rushdb.com/cookie-policy" target="_blank" rel="noopener">
              our use of cookies
            </a>
            .
          </p>
          <div className="rd-cookie-consent__actions">
            <button ref={firstAction} type="button" className="rd-button--ghost" onClick={withdrawConsent}>
              Withdraw consent
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="rd-cookie-consent__text t-small">
            We use cookies to enhance your experience. By clicking "Accept," you agree to{' '}
            <a href="https://rushdb.com/cookie-policy" target="_blank" rel="noopener">
              our use of cookies
            </a>
            .
          </p>
          <div className="rd-cookie-consent__actions">
            <button ref={firstAction} type="button" className="rd-button--primary" onClick={handleAccept}>
              Accept
            </button>
            <button type="button" className="rd-button--ghost" onClick={handleReject}>
              Decline
            </button>
          </div>
        </>
      )}
    </section>
  )
}
