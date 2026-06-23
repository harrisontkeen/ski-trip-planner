// Returns the URL only if it is a safe http(s) link, otherwise null.
// Trip data (resort/booking/search URLs) comes from the Claude API, so it must
// be treated as untrusted — this blocks javascript:, data:, vbscript:, etc.
export function safeUrl(url) {
  if (typeof url !== 'string') return null
  try {
    const u = new URL(url, window.location.origin)
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null
  } catch {
    return null
  }
}
