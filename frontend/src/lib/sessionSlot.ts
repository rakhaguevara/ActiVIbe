// Per-tab session slot id. sessionStorage is isolated per tab (unlike
// cookies/localStorage), so each tab gets its own id, sent as a header and
// used by the backend to name that tab's auth cookies separately — this is
// what lets a different role be logged in per tab without clobbering the
// same browser's shared cookie jar.
const STORAGE_KEY = 'activibe.sessionSlot'

export function getSessionSlot(): string {
  let slot = sessionStorage.getItem(STORAGE_KEY)
  if (!slot) {
    slot = crypto.randomUUID().replace(/-/g, '')
    sessionStorage.setItem(STORAGE_KEY, slot)
  }
  return slot
}
