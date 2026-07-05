// Algoritma rule-based Predictive Match Score (FR-005).
//
// Ini sekaligus fallback cold-start yang disebut PRD Section 10 ("Rule-based
// matching + Predictive Match Score sebagai fallback") — dipakai apa adanya
// saat layer AI Claude tidak tersedia (tanpa API key / error), dan dipakai
// sebagai jangkar (anchor) skor saat AI aktif supaya rating AI tetap auditable.
//
// Bobot komponen (total 100%):
//   - skill        40%  — overlap skill user vs skill yang dibutuhkan event
//   - interest     30%  — overlap minat user vs tag minat/kategori event
//   - motivation   15%  — SUDAH DIKUNCI di backend/README.md & schema.prisma,
//                         jangan diubah tanpa update dokumen itu juga
//   - availability 10%  — Profile.availability vs dayType event (BOTH cocok semua)
//   - location      5%  — kecocokan kasar kota/kata pada lokasi
//
// Data profil yang belum diisi user TIDAK menghukum skor: komponennya dinilai
// netral (50%) — sesuai mitigasi risiko "profil tidak lengkap" di PRD.

export const WEIGHTS = {
  skill: 0.4,
  interest: 0.3,
  motivation: 0.15,
  availability: 0.1,
  location: 0.05,
}

const NEUTRAL = 0.5

function normalize(text) {
  return String(text).trim().toLowerCase()
}

// Overlap by-name dua daftar string; mengembalikan rasio terhadap kebutuhan
// event dan daftar item yang cocok (dipakai untuk breakdown & reasoning).
function overlap(userItems, eventItems) {
  if (!eventItems || eventItems.length === 0) return { ratio: NEUTRAL, matched: [] }
  if (!userItems || userItems.length === 0) return { ratio: NEUTRAL, matched: [] }

  const userSet = new Set(userItems.map(normalize))
  const matched = eventItems.filter((item) => userSet.has(normalize(item)))
  return { ratio: matched.length / eventItems.length, matched }
}

function motivationScore(userMotivation, eventMotivationTags) {
  if (!userMotivation) return NEUTRAL
  if (!eventMotivationTags || eventMotivationTags.length === 0) return NEUTRAL
  return eventMotivationTags.includes(userMotivation) ? 1 : 0
}

function availabilityScore(userAvailability, eventDayType) {
  if (!userAvailability) return NEUTRAL
  if (!eventDayType || eventDayType === 'BOTH' || userAvailability === 'BOTH') return 1
  return userAvailability === eventDayType ? 1 : 0
}

// Kecocokan lokasi kasar: ada kata (>3 huruf, buang koma) yang sama di kedua
// string lokasi. Cukup untuk data dummy; nanti diganti geo-matching beneran.
function locationScore(userLocation, eventLocation) {
  if (!userLocation || !eventLocation) return NEUTRAL
  const tokenize = (s) =>
    normalize(s)
      .split(/[\s,]+/)
      .filter((w) => w.length > 3)
  const userTokens = new Set(tokenize(userLocation))
  return tokenize(eventLocation).some((w) => userTokens.has(w)) ? 1 : 0
}

/**
 * Hitung Predictive Match Score satu event untuk satu profil user.
 *
 * @param {object} profile hasil profile.service getProfile():
 *   { availability, motivation, location, interests: [{name}], skills: [{name}] }
 * @param {object} event   satu entri katalog dari event.service.js listMatchableEvents()
 * @returns {{ score: number, breakdown: object }} skor bulat 0–100 + rincian per komponen
 */
export function computeMatchScore(profile, event) {
  const skillNames = (profile.skills ?? []).map((s) => s.name ?? s)
  const interestNames = (profile.interests ?? []).map((i) => i.name ?? i)

  const skill = overlap(skillNames, event.skills)
  const interest = overlap(interestNames, event.interests)
  const motivation = motivationScore(profile.motivation, event.motivationTags)
  const availability = availabilityScore(profile.availability, event.dayType)
  const location = locationScore(profile.location, event.location)

  const raw =
    skill.ratio * WEIGHTS.skill +
    interest.ratio * WEIGHTS.interest +
    motivation * WEIGHTS.motivation +
    availability * WEIGHTS.availability +
    location * WEIGHTS.location

  return {
    score: Math.round(raw * 100),
    breakdown: {
      skill: { score: Math.round(skill.ratio * 100), weight: WEIGHTS.skill, matched: skill.matched },
      interest: { score: Math.round(interest.ratio * 100), weight: WEIGHTS.interest, matched: interest.matched },
      motivation: { score: Math.round(motivation * 100), weight: WEIGHTS.motivation },
      availability: { score: Math.round(availability * 100), weight: WEIGHTS.availability },
      location: { score: Math.round(location * 100), weight: WEIGHTS.location },
    },
  }
}

/**
 * Skor semua event untuk satu profil, urut skor tertinggi dulu.
 */
export function rankEvents(profile, events) {
  return events
    .map((event) => ({ event, ...computeMatchScore(profile, event) }))
    .sort((a, b) => b.score - a.score)
}
