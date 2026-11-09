/*
 * Cookie consent shared by rushdb.com, app.rushdb.com and docs.rushdb.com.
 * The same contract is implemented in rush-db/website `src/utils/consent.ts`
 * and rush-db/platform `platform/dashboard/src/lib/consent.ts`; change all
 * three together.
 *
 * - Consent is the cookie `rushdb_consent=granted`, on `Domain=.rushdb.com`
 *   when the host is rushdb.com or a subdomain (host-only elsewhere), with
 *   `Path=/; Max-Age=31536000; SameSite=Lax` and `Secure` on https. Only
 *   `granted` is ever stored.
 * - Without it the notice shows on every visit. Decline or Dismiss hides it
 *   for the rest of the browser session on this site
 *   (sessionStorage `rushdb_consent_dismissed` = '1'); nothing persistent is
 *   stored on decline.
 * - Withdraw deletes `rushdb_consent`, `_ga` and every `_ga_*` cookie (on
 *   `.rushdb.com` and host-only), sends a Consent Mode update with all four
 *   signals denied and reloads the page.
 * - On load, the legacy localStorage `cookieConsent` = 'true' becomes the
 *   cookie; the legacy key is then removed whatever its value.
 * - Server renewal: Safari caps cookies written by `document.cookie` at 7
 *   days. `POST /api/consent` (rush-db/website) re-issues an existing
 *   `rushdb_consent=granted` cookie from the server with the same attributes
 *   and never creates one. It is called right after granting and once per
 *   browser session while consent is granted. The website calls its own
 *   `/api/consent`, the dashboard calls https://rushdb.com/api/consent, and
 *   the docs call `/api/consent` on docs.rushdb.com, which Amplify proxies to
 *   rushdb.com so the response comes from the docs origin.
 *
 * Every function is safe during server rendering and when storage is blocked.
 */

export const CONSENT_COOKIE = 'rushdb_consent'
export const CONSENT_MAX_AGE = 31536000
export const DISMISSED_KEY = 'rushdb_consent_dismissed'
export const LEGACY_CONSENT_KEY = 'cookieConsent'
export const RENEWED_KEY = 'rushdb_consent_renewed'
export const RENEW_HOSTNAME = 'docs.rushdb.com'
export const CONSENT_SIGNALS = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'] as const

const SHARED_DOMAIN = 'rushdb.com'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

/** `.rushdb.com` on rushdb.com and its subdomains; undefined (host-only) elsewhere. */
export function consentCookieDomain(hostname: string): string | undefined {
  const host = hostname.toLowerCase()
  return host === SHARED_DOMAIN || host.endsWith(`.${SHARED_DOMAIN}`) ? `.${SHARED_DOMAIN}` : undefined
}

/** The Set-Cookie string for `document.cookie`. Pure, so it can be checked without a browser. */
export function buildCookieString({
  name,
  value,
  maxAge,
  domain,
  secure
}: {
  name: string
  value: string
  maxAge: number
  domain?: string
  secure: boolean
}): string {
  return [
    `${name}=${value}`,
    ...(domain ? [`Domain=${domain}`] : []),
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    ...(secure ? ['Secure'] : [])
  ].join('; ')
}

function writeCookie(name: string, value: string, maxAge: number, domain = consentCookieDomain(window.location.hostname)) {
  try {
    document.cookie = buildCookieString({ name, value, maxAge, domain, secure: window.location.protocol === 'https:' })
  } catch {
    // Cookies blocked: the choice holds for this page only.
  }
}

function cookieNames(): string[] {
  try {
    return document.cookie
      .split(';')
      .map((pair) => pair.split('=')[0].trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

export function hasConsent(): boolean {
  if (!isBrowser()) return false
  try {
    return document.cookie.split(';').some((pair) => pair.trim() === `${CONSENT_COOKIE}=granted`)
  } catch {
    return false
  }
}

export function grantConsent() {
  if (!isBrowser()) return
  writeCookie(CONSENT_COOKIE, 'granted', CONSENT_MAX_AGE)
}

/**
 * Whether to ask the server to re-issue the cookie. Pure, so the guard can be
 * checked without a browser: only on docs.rushdb.com (where /api/consent is
 * proxied), only with consent, and once per session when asked to.
 */
export function shouldRenewConsent({
  hostname,
  granted,
  oncePerSession,
  renewedThisSession
}: {
  hostname: string
  granted: boolean
  oncePerSession: boolean
  renewedThisSession: boolean
}): boolean {
  return granted && hostname === RENEW_HOSTNAME && !(oncePerSession && renewedThisSession)
}

/**
 * Re-issues the consent cookie from the server so Safari does not cap it at 7
 * days. Pass `oncePerSession` on page load; after granting, call it plainly.
 */
export function renewConsent({ oncePerSession = false }: { oncePerSession?: boolean } = {}) {
  if (!isBrowser()) return
  let renewedThisSession = false
  try {
    renewedThisSession = window.sessionStorage.getItem(RENEWED_KEY) === '1'
  } catch {
    // Storage blocked: renew on every load.
  }
  const renew = shouldRenewConsent({
    hostname: window.location.hostname,
    granted: hasConsent(),
    oncePerSession,
    renewedThisSession
  })
  if (!renew) return
  try {
    window.sessionStorage.setItem(RENEWED_KEY, '1')
  } catch {
    // Storage blocked: see above.
  }
  try {
    fetch('/api/consent', { method: 'POST', credentials: 'include', keepalive: true }).catch(() => {})
  } catch {
    // fetch unavailable: the client-written cookie still holds.
  }
}

export function isDismissed(): boolean {
  if (!isBrowser()) return false
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissForSession() {
  if (!isBrowser()) return
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // Storage blocked: the notice comes back on the next page load.
  }
}

export function withdrawConsent() {
  if (!isBrowser()) return
  const shared = `.${SHARED_DOMAIN}`
  writeCookie(CONSENT_COOKIE, '', 0)
  for (const name of cookieNames().filter((n) => n === '_ga' || n.startsWith('_ga_'))) {
    writeCookie(name, '', 0, shared)
    writeCookie(name, '', 0, undefined)
  }
  const denied = Object.fromEntries(CONSENT_SIGNALS.map((signal) => [signal, 'denied']))
  window.gtag?.('consent', 'update', denied)
  window.location.reload()
}

export function migrateLegacyConsent() {
  if (!isBrowser()) return
  try {
    const legacy = window.localStorage.getItem(LEGACY_CONSENT_KEY)
    if (legacy === 'true') grantConsent()
    if (legacy !== null) window.localStorage.removeItem(LEGACY_CONSENT_KEY)
  } catch {
    // Storage blocked: nothing to migrate.
  }
}
