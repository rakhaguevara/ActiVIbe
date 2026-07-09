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
Kamu menerima ringkasan data dashboard organizer ini (angka nyata, bukan contoh). Tugasmu membuat TEPAT 3 kartu
insight berdasarkan angka itu SAJA — jangan mengarang angka yang tidak ada di ringkasan.
Aturan tiap kartu:
- tone: "success" untuk hal positif (attendance tinggi, tidak ada antrean), "warning" untuk hal yang butuh
  perhatian (pelamar menumpuk, event belum ditutup), "info" untuk aksi rutin yang disarankan.
- title: singkat (maks 8 kata), bahasa Indonesia.
- description: 1-2 kalimat, sebut angka aslinya, actionable.
- actionLabel: label tombol aksi singkat (maks 4 kata), mis. "Tinjau Pelamar".
Kalau suatu angka 0/tidak ada datanya, jangan buat insight seolah-olah ada masalah — buat insight netral
atau soroti aspek lain yang datanya tersedia.`

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

  return insights
}

export async function generateInsights(summary) {
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
    return parsed.insights.slice(0, 3)
  } catch (error) {
    console.error('[organizer-ai] Gagal generate insights, pakai fallback:', error.message)
    return buildFallbackInsights(summary)
  }
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
