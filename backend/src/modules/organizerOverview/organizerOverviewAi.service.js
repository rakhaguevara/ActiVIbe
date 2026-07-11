// Layer AI untuk dashboard organizer (insight cards + chat "Ask AI") — mirror
// structural admin/adminAi.service.js: multi-provider (Claude/OpenAI/Gemini
// via AI_PROVIDER), structured JSON output, dan SELALU ada fallback
// deterministik supaya dashboard tidak pernah gagal gara-gara AI down/tanpa
// API key. Provider clients di-reuse langsung dari recommendations/providers/.
//
// Keamanan: AI TIDAK pernah dikasih akses tool/DB langsung — hanya menerima
// satu snapshot JSON angka yang SUDAH dihitung deterministik oleh
// organizerOverview.service.js (buildOrganizerSummary), dan angka itu SUDAH
// discope ke organizerId pemanggil — jadi tidak ada risiko bocor data
// organizer lain lewat insight/chat.

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
  return resolveAiProvider(PROVIDERS, env.AI_PROVIDER, 'organizer-ai')
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

const INSIGHTS_SYSTEM_PROMPT = `Kamu adalah asisten analitik untuk organizer/NGO di platform volunteer ActiVibe.
Kamu menerima ringkasan data dashboard organizer ini (angka nyata, bukan contoh). Tugasmu membuat 3 kartu
insight WAJIB berdasarkan angka itu SAJA — jangan mengarang angka yang tidak ada di ringkasan.
Aturan tiap kartu:
- tone: "success" untuk hal positif (attendance tinggi, tidak ada antrean), "warning" untuk hal yang butuh
  perhatian (pelamar menumpuk, event belum ditutup), "info" untuk aksi rutin yang disarankan.
- title: singkat (maks 8 kata), bahasa Indonesia.
- description: 1-2 kalimat, sebut angka aslinya, actionable.
- actionLabel: label tombol aksi singkat (maks 4 kata), mis. "Tinjau Pelamar".
Kalau suatu angka 0/tidak ada datanya, jangan buat insight seolah-olah ada masalah — buat insight netral
atau soroti aspek lain yang datanya tersedia.

Kartu ke-4 KONDISIONAL: kalau eventsNeedingBoost tidak kosong, WAJIB tambahkan kartu ke-4 (tone "warning")
merekomendasikan "boost"/promosi event paling mendesak (elemen pertama array — sebut namanya, filled/quota,
dan daysUntilStart aslinya). Kalau eventsNeedingBoost kosong, jangan buat kartu ke-4 — cukup 3.`

function buildFallbackInsights(summary) {
  const insights = []

  insights.push({
    tone: summary.pendingApplicants > 0 ? 'warning' : 'success',
    title: summary.pendingApplicants > 0 ? 'Pelamar menunggu review' : 'Tidak ada pelamar tertunda',
    description:
      summary.pendingApplicants > 0
        ? `Ada ${summary.pendingApplicants} pelamar yang belum ditinjau di seluruh kegiatanmu.`
        : 'Semua pelamar di kegiatanmu sudah ditinjau.',
    actionLabel: 'Tinjau Pelamar',
  })

  insights.push({
    tone: summary.eventsNeedClosing > 0 ? 'warning' : 'success',
    title: summary.eventsNeedClosing > 0 ? 'Kegiatan perlu ditutup' : 'Semua kegiatan up to date',
    description:
      summary.eventsNeedClosing > 0
        ? `${summary.eventsNeedClosing} kegiatan sudah melewati tanggal selesai dan belum ditutup.`
        : 'Tidak ada kegiatan yang menunggu untuk ditutup.',
    actionLabel: 'Tutup Kegiatan',
  })

  insights.push(
    summary.todayAttendance.expected > 0
      ? {
          tone: summary.todayAttendance.pct >= 80 ? 'success' : 'info',
          title: `Kehadiran hari ini ${summary.todayAttendance.pct}%`,
          description: `${summary.todayAttendance.checkedIn} dari ${summary.todayAttendance.expected} volunteer terjadwal sudah check-in hari ini.`,
          actionLabel: 'Lihat Attendance',
        }
      : {
          tone: 'info',
          title: 'Tidak ada shift hari ini',
          description: 'Tidak ada volunteer yang terjadwal check-in hari ini.',
          actionLabel: 'Lihat Attendance',
        },
  )

  if (Array.isArray(summary.eventsNeedingBoost) && summary.eventsNeedingBoost.length > 0) {
    const urgent = summary.eventsNeedingBoost[0]
    insights.push({
      tone: 'warning',
      title: `Boost pendaftaran "${urgent.title}"`,
      description: `Baru ${urgent.filled}/${urgent.quota} slot terisi, sementara kegiatan mulai dalam ${urgent.daysUntilStart} hari. Pertimbangkan promosi tambahan.`,
      actionLabel: 'Cari Ide Campaign',
    })
  }

  return insights
}

// ActiVibe Plus — "AI Management Recommendation" (insight cards asli dari
// provider) khusus tier PLUS_PRO; FREE & PLUS_STARTER selalu dapat
// buildFallbackInsights() ("insight biasa", deterministik dari angka
// summary) — TIDAK memanggil provider sama sekali (skip resolveProvider,
// bukan cuma menyembunyikan hasilnya di frontend). "Ask AI" chat di bawah
// TIDAK ikut dibatasi tier ini (cuma kartu insight yang dibatasi).
export async function generateInsights(summary, tier) {
  if (tier !== 'PLUS_PRO') return buildFallbackInsights(summary)

  const provider = resolveProvider()
  if (!provider) return buildFallbackInsights(summary)

  try {
    const parsed = await provider.generate({
      system: INSIGHTS_SYSTEM_PROMPT,
      prompt: `RINGKASAN DATA DASHBOARD ORGANIZER:\n${JSON.stringify(summary, null, 2)}`,
      schema: INSIGHTS_SCHEMA,
    })
    if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
      return buildFallbackInsights(summary)
    }
    return parsed.insights.slice(0, 4)
  } catch (error) {
    console.error('[organizer-ai] Gagal generate insights, pakai fallback:', error.message)
    return buildFallbackInsights(summary)
  }
}

// ============================================
// Cari Ide Event/Campaign Baru (on-demand, web search — lihat utils/aiIdeaSearch.js)
// ============================================

export async function generateGrowthIdeas(summary) {
  const hasRecentCompletion = summary.thisMonth?.eventsCompleted > 0
  const urgentEvent = summary.eventsNeedingBoost?.[0] ?? null

  if (hasRecentCompletion) {
    return searchIdeas({
      searchSystemPrompt: `Kamu adalah asisten riset untuk organizer/NGO volunteer di Indonesia yang baru saja
menyelesaikan kegiatan. Cari isu/kebutuhan sosial yang benar-benar sedang mendesak SEKARANG di Indonesia (mis.
kekurangan tenaga pengajar di daerah, bencana alam terkini, isu lingkungan/kesehatan yang lagi ramai) yang bisa
jadi ide kegiatan volunteer baru.`,
      searchPrompt: `Organizer ini baru menyelesaikan ${summary.thisMonth.eventsCompleted} kegiatan bulan ini. Cari 3 ide
kegiatan volunteer baru yang relevan dengan kebutuhan/isu terkini di Indonesia.`,
      formatSystemPrompt: `Kamu memformat hasil riset ide kegiatan volunteer baru untuk organizer ActiVibe menjadi kartu ide.`,
    })
  }

  return searchIdeas({
    searchSystemPrompt: `Kamu adalah asisten riset marketing untuk organizer/NGO volunteer di platform ActiVibe,
Indonesia. Cari peluang campaign/promosi yang benar-benar sedang relevan SEKARANG (momentum nasional, tren
volunteering, komunitas/media sosial relevan) yang bisa dipakai organizer untuk menaikkan pendaftaran event mereka.`,
    searchPrompt: urgentEvent
      ? `Event "${urgentEvent.title}" baru terisi ${urgentEvent.filled}/${urgentEvent.quota} slot, mulai dalam
${urgentEvent.daysUntilStart} hari. Cari 3 ide campaign/promosi terkini untuk membantu menaikkan pendaftaran event ini.`
      : `Cari 3 ide campaign/promosi terkini yang relevan untuk organizer volunteer di Indonesia menaikkan pendaftaran event mereka.`,
    formatSystemPrompt: `Kamu memformat hasil riset campaign marketing untuk organizer ActiVibe menjadi kartu ide.`,
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

function buildChatSystemPrompt(summary) {
  return `Kamu adalah asisten organizer ActiVibe. Jawab HANYA berdasarkan ringkasan data dashboard organizer ini
(angka nyata dari database, khusus milik organizer ini) — jangan mengarang angka yang tidak ada di sini. Jawab
singkat, bahasa Indonesia. Kalau organizer bertanya sesuatu yang tidak bisa dijawab dari data ini, katakan terus
terang bahwa datanya tidak tersedia, jangan menebak.

RINGKASAN DATA DASHBOARD ORGANIZER:
${JSON.stringify(summary, null, 2)}`
}

function buildFallbackReply(summary) {
  return (
    `Maaf, asisten AI sedang tidak tersedia saat ini. Berikut ringkasan data yang saya punya: ` +
    `${summary.activeEvents} kegiatan aktif, ${summary.pendingApplicants} pelamar menunggu review, ` +
    `${summary.eventsNeedClosing} kegiatan perlu ditutup.`
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

export async function chat(summary, rawMessages) {
  const messages = sanitizeMessages(rawMessages)
  if (messages.length === 0) {
    return { reply: 'Silakan tulis pertanyaan Anda terlebih dahulu.', aiGenerated: false }
  }

  const provider = resolveProvider()
  if (!provider) return { reply: buildFallbackReply(summary), aiGenerated: false }

  const transcript = messages.map((m) => `${m.role === 'user' ? 'Organizer' : 'Asisten'}: ${m.content}`).join('\n\n')

  try {
    const parsed = await provider.generate({
      system: buildChatSystemPrompt(summary),
      prompt: transcript,
      schema: CHAT_SCHEMA,
    })
    return { reply: parsed.reply, aiGenerated: true }
  } catch (error) {
    console.error('[organizer-ai] Gagal chat, pakai fallback:', error.message)
    return { reply: buildFallbackReply(summary), aiGenerated: false }
  }
}
