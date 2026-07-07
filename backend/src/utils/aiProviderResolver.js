// Pemilihan provider AI generik — dipakai oleh recommendations/ai.service.js
// dan admin/adminAi.service.js supaya logikanya (dan pesan warning-nya) satu
// sumber, bukan diduplikasi tiap modul yang butuh multi-provider AI.
export function resolveAiProvider(providers, requestedName, moduleLabel) {
  const requested = (requestedName || 'auto').toLowerCase()
  if (requested !== 'auto') {
    const provider = providers.find((p) => p.name === requested)
    if (provider?.isConfigured()) return provider
    if (provider) {
      console.warn(`[${moduleLabel}] AI_PROVIDER=${requested} tapi API key-nya kosong — pakai fallback`)
    } else {
      console.warn(`[${moduleLabel}] AI_PROVIDER=${requested} tidak dikenal (pilihan: claude|openai|gemini|auto)`)
    }
    return null
  }
  return providers.find((p) => p.isConfigured()) ?? null
}
