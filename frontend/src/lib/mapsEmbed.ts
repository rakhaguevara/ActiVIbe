// Parsing "link Google Maps atau alamat/koordinat teks" jadi embed peta TANPA
// API key/billing (project belum ada integrasi cloud berbayar apa pun) —
// dipakai bareng oleh preview CreateEventPage & halaman detail volunteer asli
// (lihat EventLocationMap.tsx, satu-satunya tempat logic ini dipakai).

export interface MapsEmbedResult {
  kind: 'coords' | 'query' | 'unparseable'
  embedSrc?: string
  externalUrl?: string
}

const COORD_PATTERNS = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/]

function buildEmbedSrc(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

export function resolveMapsEmbed(raw: string | undefined | null): MapsEmbedResult {
  const value = raw?.trim()
  if (!value) return { kind: 'unparseable' }

  for (const pattern of COORD_PATTERNS) {
    const match = value.match(pattern)
    if (match) {
      const [, lat, lng] = match
      return { kind: 'coords', embedSrc: buildEmbedSrc(`${lat},${lng}`) }
    }
  }

  const isUrl = /^https?:\/\//i.test(value)
  if (isUrl) {
    // Link share (mis. maps.app.goo.gl) tanpa koordinat kelihatan tidak bisa
    // diparsing di sisi klien (butuh follow redirect, kena CORS) — dan Google
    // memblokir embed langsung link non-"output=embed" lewat X-Frame-Options.
    // Fallback: tombol buka eksternal saja, bukan iframe.
    return { kind: 'unparseable', externalUrl: value }
  }

  // Teks alamat biasa — dipakai langsung sebagai query pencarian Google Maps.
  return { kind: 'query', embedSrc: buildEmbedSrc(value) }
}
