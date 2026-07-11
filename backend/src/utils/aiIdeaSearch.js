// Helper riset ide berbasis web search (dipakai adminAi.service.js &
// organizerOverviewAi.service.js utk "Cari Ide Campaign"/"Cari Ide Event
// Baru") — Claude-only, lihat komentar claudeWebSearch di claude.provider.js.
// 2 langkah SENGAJA terpisah (bukan 1 call gabungan tools+output_config):
// langkah 1 riset bebas (web_search tool), langkah 2 format hasil riset jadi
// JSON terstruktur lewat claudeProvider.generate() yang sudah teruji.
// Tidak pernah mengarang ide kalau API key kosong atau riset gagal — return
// { available: false, reason } apa adanya, konsisten dgn prinsip "no data
// dikarang" yang dipakai di seluruh layer AI lain di repo ini.

import { claudeProvider, claudeWebSearch } from '../modules/recommendations/providers/claude.provider.js'

const IDEAS_SCHEMA = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          actionLabel: { type: 'string' },
          sourceHint: { type: 'string' },
        },
        required: ['title', 'description', 'actionLabel', 'sourceHint'],
        additionalProperties: false,
      },
    },
  },
  required: ['ideas'],
  additionalProperties: false,
}

const FORMAT_SYSTEM_PROMPT_SUFFIX = `
Ubah temuan riset di atas jadi TEPAT 3 kartu ide, bahasa Indonesia, actionable:
- title: singkat (maks 8 kata).
- description: 1-2 kalimat, spesifik (sebut nama momentum/tren/isu nyata dari temuan riset, bukan generik).
- actionLabel: label tombol singkat (maks 4 kata), mis. "Lihat Detail Ide".
- sourceHint: 1 frasa pendek yang menyebut sumber/konteks temuan (mis. "berdasarkan tren volunteering nasional Juli 2026").
Kalau temuan riset kosong/tidak relevan, jangan mengarang — buat ide yang tetap masuk akal secara umum tapi netral, dan sourceHint jujur mengatakan "berdasarkan praktik umum, bukan tren spesifik terkini".`

export async function searchIdeas({ searchSystemPrompt, searchPrompt, formatSystemPrompt }) {
  if (!claudeProvider.isConfigured()) {
    return { available: false, reason: 'Fitur riset AI ini butuh Claude API key yang belum diisi.' }
  }

  try {
    const findings = await claudeWebSearch({ system: searchSystemPrompt, prompt: searchPrompt })
    const parsed = await claudeProvider.generate({
      system: `${formatSystemPrompt}\n${FORMAT_SYSTEM_PROMPT_SUFFIX}`,
      prompt: `TEMUAN RISET:\n${findings}`,
      schema: IDEAS_SCHEMA,
    })
    if (!Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
      return { available: false, reason: 'AI tidak menemukan ide yang relevan, coba lagi nanti.' }
    }
    return { available: true, ideas: parsed.ideas.slice(0, 3), generatedAt: new Date().toISOString() }
  } catch (error) {
    console.error('[ai-idea-search] Gagal mengambil ide:', error.message)
    return { available: false, reason: 'Gagal mengambil ide dari AI, coba lagi nanti.' }
  }
}
