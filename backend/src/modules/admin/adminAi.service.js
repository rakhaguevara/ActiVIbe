// Layer AI untuk dashboard admin (insight cards + chat "Ask AI") — pola sama
// dengan recommendations/ai.service.js: multi-provider (Claude/OpenAI/Gemini
// via AI_PROVIDER), structured JSON output, dan SELALU ada fallback
// deterministik supaya dashboard tidak pernah gagal gara-gara AI down/tanpa
// API key. Provider clients di-reuse langsung dari recommendations/providers/
// (bukan duplikat) karena kontraknya generik: generate({system, prompt, schema}).
//
// Keamanan: AI TIDAK pernah dikasih akses tool/DB langsung — hanya menerima
// satu snapshot JSON angka yang SUDAH dihitung deterministik oleh
// admin.service.js (buildDashboardSummary). Jadi AI tidak bisa mengarang query
// atau membocorkan data di luar ringkasan yang memang dimaksudkan utk dilihat.

import { env } from '../../config/env.js'
import { claudeProvider } from '../recommendations/providers/claude.provider.js'
import { openaiProvider } from '../recommendations/providers/openai.provider.js'
import { geminiProvider } from '../recommendations/providers/gemini.provider.js'
import { resolveAiProvider } from '../../utils/aiProviderResolver.js'
import { searchIdeas } from '../../utils/aiIdeaSearch.js'

const PROVIDERS = [claudeProvider, openaiProvider, geminiProvider]
const MAX_CHAT_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000

function resolveProvider() {
  return resolveAiProvider(PROVIDERS, env.AI_PROVIDER, 'admin-ai')
}

// ============================================
// Insight cards
// ============================================

const INSIGHTS_SCHEMA = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tone: { type: 'string', enum: ['success', 'warning', 'info'] },
          title: { type: 'string' },
          description: { type: 'string' },
          actionLabel: { type: 'string' },
        },
        required: ['tone', 'title', 'description', 'actionLabel'],
        additionalProperties: false,
      },
    },
  },
  required: ['insights'],
  additionalProperties: false,
}

const INSIGHTS_SYSTEM_PROMPT = `Kamu adalah asisten analitik untuk admin platform volunteer ActiVibe.
Kamu menerima ringkasan data dashboard (angka nyata, bukan contoh). Tugasmu membuat 3 kartu insight WAJIB
untuk admin berdasarkan angka itu SAJA — jangan mengarang angka yang tidak ada di ringkasan.
Aturan tiap kartu:
- tone: "success" untuk hal positif (pertumbuhan, capaian), "warning" untuk hal yang butuh perhatian
  (item menumpuk, verifikasi tertunda), "info" untuk aksi rutin yang disarankan.
- title: singkat (maks 8 kata), bahasa Indonesia.
- description: 1-2 kalimat, sebut angka aslinya, actionable.
- actionLabel: label tombol aksi singkat (maks 4 kata), mis. "Tinjau Sekarang".
Kalau suatu angka 0/tidak ada datanya, jangan buat insight seolah-olah ada masalah — buat insight netral
atau soroti aspek lain yang datanya tersedia.

Kartu ke-4 KONDISIONAL: kalau registrantTrend.thisMonth < registrantTrend.lastMonth (pendaftar baru bulan ini
lebih sedikit dari bulan lalu), WAJIB tambahkan kartu ke-4 (tone "warning") berisi 1-2 rekomendasi pemasaran
aplikasi ActiVibe yang konkret, sebut kedua angka aslinya. Kalau tidak, jangan buat kartu ke-4 — cukup 3.`

function buildFallbackInsights(summary) {
  const insights = []

  insights.push(
    summary.topGrowingRegion
      ? {
          tone: 'success',
          title: `Pertumbuhan di ${summary.topGrowingRegion.name}`,
          description: `${summary.topGrowingRegion.name} tumbuh ${summary.topGrowingRegion.growth}% dalam 30 hari terakhir dibanding periode sebelumnya.`,
          actionLabel: 'Lihat Region',
        }
      : {
          tone: 'info',
          title: 'Belum ada data pertumbuhan region',
          description: 'Data lokasi volunteer/organisasi masih terlalu sedikit untuk menghitung tren pertumbuhan per region.',
          actionLabel: 'Lihat Region',
        },
  )

  insights.push({
    tone: summary.unverifiedOrganizationCount > 0 ? 'warning' : 'success',
    title: summary.unverifiedOrganizationCount > 0 ? 'NGO belum terverifikasi' : 'Semua NGO terverifikasi',
    description:
      summary.unverifiedOrganizationCount > 0
        ? `Terdapat ${summary.unverifiedOrganizationCount} organisasi yang belum diverifikasi.`
        : 'Semua organisasi terdaftar sudah melalui proses verifikasi.',
    actionLabel: 'Kelola Organisasi',
  })

  insights.push({
    tone: summary.pendingEventsAgingCount > 0 ? 'warning' : 'success',
    title: summary.pendingEventsAgingCount > 0 ? 'Kegiatan menunggu review' : 'Tidak ada antrean review',
    description:
      summary.pendingEventsAgingCount > 0
        ? `Ada ${summary.pendingEventsAgingCount} kegiatan yang menunggu persetujuan lebih dari 24 jam.`
        : 'Tidak ada kegiatan yang menunggu persetujuan lebih dari 24 jam.',
    actionLabel: 'Tinjau Kegiatan',
  })

  if (summary.registrantTrend && summary.registrantTrend.thisMonth < summary.registrantTrend.lastMonth) {
    insights.push({
      tone: 'warning',
      title: 'Pendaftar bulan ini menurun',
      description: `Pendaftar baru bulan ini ${summary.registrantTrend.thisMonth}, turun dari ${summary.registrantTrend.lastMonth} bulan lalu. Pertimbangkan campaign pemasaran tambahan.`,
      actionLabel: 'Lihat Ide Campaign',
    })
  }

  return insights
}

export async function generateInsights(summary) {
  const provider = resolveProvider()
  if (!provider) return buildFallbackInsights(summary)

  try {
    const parsed = await provider.generate({
      system: INSIGHTS_SYSTEM_PROMPT,
      prompt: `RINGKASAN DATA DASHBOARD:\n${JSON.stringify(summary, null, 2)}`,
      schema: INSIGHTS_SCHEMA,
    })
    if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
      return buildFallbackInsights(summary)
    }
    return parsed.insights.slice(0, 4)
  } catch (error) {
    console.error('[admin-ai] Gagal generate insights, pakai fallback:', error.message)
    return buildFallbackInsights(summary)
  }
}

// ============================================
// Cari Ide Campaign (on-demand, web search — lihat utils/aiIdeaSearch.js)
// ============================================

export async function generateCampaignIdeas(summary) {
  return searchIdeas({
    searchSystemPrompt: `Kamu adalah asisten riset marketing untuk aplikasi volunteer ActiVibe di Indonesia.
Cari peluang campaign/promosi yang benar-benar sedang relevan SEKARANG (momentum nasional, hari peringatan,
tren volunteering/kegiatan sosial terkini) yang bisa dipakai admin ActiVibe untuk menaikkan jumlah pendaftar
platform. Fokus ke Indonesia.`,
    searchPrompt: `Data pendaftar bulan ini: ${JSON.stringify(summary.registrantTrend)}. Cari 3 peluang campaign/promosi
terkini yang relevan untuk menaikkan pendaftaran ActiVibe.`,
    formatSystemPrompt: `Kamu memformat hasil riset campaign marketing untuk aplikasi volunteer ActiVibe menjadi kartu ide.`,
  })
}

// ============================================
// Chat ("Ask AI" modal)
// ============================================

const CHAT_SCHEMA = {
  type: 'object',
  properties: { reply: { type: 'string' } },
  required: ['reply'],
  additionalProperties: false,
}

function buildChatSystemPrompt(summary, knowledge) {
  return `Kamu adalah asisten admin ActiVibe. Jawab HANYA berdasarkan data berikut (angka & data nyata dari
database) — jangan mengarang apa pun yang tidak ada di sini. Jawab singkat, bahasa Indonesia. Kalau admin
bertanya sesuatu yang tidak bisa dijawab dari data ini, katakan terus terang bahwa datanya tidak tersedia,
jangan menebak.

RINGKASAN DATA DASHBOARD (angka agregat platform-wide):
${JSON.stringify(summary, null, 2)}

DATA DETAIL TERKAIT PERTANYAAN (organisasi/kegiatan/feedback/laporan penutupan paling relevan dgn
pertanyaan admin — daftar ini SUDAH disaring/dipilihkan, bukan seluruh database, jadi kalau sesuatu tidak
ada di sini, katakan datanya tidak tersedia/tidak ditemukan, jangan mengasumsikan tidak ada sama sekali di
platform):
${JSON.stringify(knowledge, null, 2)}`
}

function buildFallbackReply(summary) {
  return (
    `Maaf, asisten AI sedang tidak tersedia saat ini. Berikut ringkasan data yang saya punya: ` +
    `${summary.totalUsers} pengguna terdaftar, ${summary.pendingEvents} kegiatan menunggu persetujuan, ` +
    `${summary.approvedEvents} kegiatan disetujui.`
  )
}

// Sanitasi input chat dari client: batasi jumlah pesan & panjang tiap pesan
// (biaya panggilan AI + defense-in-depth), buang entri dengan role/isi tidak valid.
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_CHAT_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }))
}

export async function chat(summary, rawMessages, knowledge) {
  const messages = sanitizeMessages(rawMessages)
  if (messages.length === 0) {
    return { reply: 'Silakan tulis pertanyaan Anda terlebih dahulu.', aiGenerated: false }
  }

  const provider = resolveProvider()
  if (!provider) return { reply: buildFallbackReply(summary), aiGenerated: false }

  const transcript = messages.map((m) => `${m.role === 'user' ? 'Admin' : 'Asisten'}: ${m.content}`).join('\n\n')

  try {
    const parsed = await provider.generate({
      system: buildChatSystemPrompt(summary, knowledge),
      prompt: transcript,
      schema: CHAT_SCHEMA,
    })
    return { reply: parsed.reply, aiGenerated: true }
  } catch (error) {
    console.error('[admin-ai] Gagal chat, pakai fallback:', error.message)
    return { reply: buildFallbackReply(summary), aiGenerated: false }
  }
}
