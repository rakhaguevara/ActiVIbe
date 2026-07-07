// Validates the per-tab session slot id sent by the frontend as the
// `X-Session-Slot` header, and derives per-slot cookie names from it.
// The slot is attacker-controlled input interpolated into a cookie name, so
// it's restricted to a safe charset/length; anything invalid or missing
// falls back to `null`, which maps to the legacy unscoped cookie names.
const SLOT_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/

export function sanitizeSlot(rawSlot) {
  return typeof rawSlot === 'string' && SLOT_PATTERN.test(rawSlot) ? rawSlot : null
}

export function accessCookieName(slot) {
  return slot ? `accessToken__${slot}` : 'accessToken'
}

export function refreshCookieName(slot) {
  return slot ? `refreshToken__${slot}` : 'refreshToken'
}
