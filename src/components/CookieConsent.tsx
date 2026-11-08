import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { gtmId, initializeAnalytics, readConsent, setAnalyticsConsent, storeConsent } from '@site/src/analytics'

/**
 * The website's cookie notice (CookiesConsent.tsx): same behaviour and copy,
 * docs styling. Renders only when GTM_ID was set at build time and the reader
 * has not chosen yet. Accept loads GTM; Decline or Dismiss stores 'false'.
 */
export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!gtmId) return
    const consent = readConsent()
    if (consent === null) setIsVisible(true)
    else if (consent === 'true') initializeAnalytics()
  }, [])

  const handleAccept = () => {
    storeConsent(true)
    initializeAnalytics()
    setIsVisible(false)
  }

  const handleReject = () => {
    storeConsent(false)
    setAnalyticsConsent(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <section className="rd-cookie-consent" aria-labelledby="rd-cookie-consent-label">
      <div className="rd-cookie-consent__header">
        <span id="rd-cookie-consent-label" className="t-label">
          Cookies
        </span>
        <button type="button" className="rd-icon-button" aria-label="Dismiss" onClick={handleReject}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="rd-cookie-consent__text t-small">
        We use cookies to enhance your experience. By clicking "Accept," you agree to{' '}
        <a href="https://rushdb.com/cookie-policy" target="_blank" rel="noopener">
          our use of cookies
        </a>
        .
      </p>
      <div className="rd-cookie-consent__actions">
        <button type="button" className="rd-button--primary" onClick={handleAccept}>
          Accept
        </button>
        <button type="button" className="rd-button--ghost" onClick={handleReject}>
          Decline
        </button>
      </div>
    </section>
  )
}
