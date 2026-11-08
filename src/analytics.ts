/*
 * Analytics behind cookie consent (Google Consent Mode, basic): the website's
 * src/utils/analytics.ts, adapted to Docusaurus.
 *
 * docusaurus.config.ts sets the consent default (everything denied) in <head>
 * and passes GTM_ID as customFields.gtmId. Without GTM_ID nothing here runs.
 * GTM loads only after the reader accepts (CookieConsent); the choice is kept
 * in localStorage under `cookieConsent` ('true' | 'false'), as on the website.
 *
 * This file is also a client module: onRouteDidUpdate sends a page_view on
 * client-side navigation. GTM's own page view covers the first page.
 */
import siteConfig from '@generated/docusaurus.config'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export const CONSENT_KEY = 'cookieConsent'
const GTM_SCRIPT_ID = 'rushdb-gtm'

export const gtmId = (siteConfig.customFields?.gtmId as string | undefined) || undefined

export function readConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function storeConsent(granted: boolean) {
  try {
    window.localStorage.setItem(CONSENT_KEY, String(granted))
  } catch {
    // Storage blocked: the choice holds for this page only.
  }
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    function gtag() {
      // gtag() queues its arguments object, not an array.
      window.dataLayer?.push(arguments)
    }
}

export function setAnalyticsConsent(granted: boolean) {
  if (!gtmId) return
  ensureDataLayer()
  const value = granted ? 'granted' : 'denied'
  window.gtag?.('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value
  })
}

/**
 * Loads GTM once, after consent. The consent update is queued before gtm.js
 * so consent-gated tags can fire on the container's first page-view event.
 */
export function initializeAnalytics() {
  if (!gtmId) return
  setAnalyticsConsent(true)
  if (document.getElementById(GTM_SCRIPT_ID)) return

  window.dataLayer?.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.id = GTM_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  document.head.appendChild(script)
}

type RouteLocation = { pathname: string; search: string }
type RouteChange = { location: RouteLocation; previousLocation: RouteLocation | null }

// The previous page's title, and the pending wait for the next one.
let titleBefore = ''
let stopWaiting: (() => void) | undefined

// Client module lifecycles: a page_view per client-side navigation, after the
// first page (GTM counts that one). Hash-only changes are not page views.
export function onRouteUpdate() {
  titleBefore = document.title
}

export function onRouteDidUpdate({ location, previousLocation }: RouteChange) {
  if (!gtmId || !previousLocation || readConsent() !== 'true') return
  if (location.pathname === previousLocation.pathname && location.search === previousLocation.search) return

  // The new title is set some frames after the route renders. Send once it
  // changes, or after a second if the new page has the same title.
  stopWaiting?.()
  const send = () => {
    stopWaiting?.()
    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: `${window.location.origin}${location.pathname}${location.search}`,
      page_path: `${location.pathname}${location.search}`
    })
  }
  if (document.title !== titleBefore) return send()
  const observer = new MutationObserver(() => {
    if (document.title !== titleBefore) send()
  })
  const timeout = setTimeout(send, 1000)
  stopWaiting = () => {
    observer.disconnect()
    clearTimeout(timeout)
    stopWaiting = undefined
  }
  observer.observe(document.head, { subtree: true, childList: true, characterData: true })
}
