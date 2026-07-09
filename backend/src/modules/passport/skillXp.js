// Turunan level/XP skill dari jumlah kegiatan COMPLETED milik user yang
// men-tag skill itu (EventSkill) — backend belum punya sistem XP yang benar-
// benar jalan (model SkillProgress ada di schema.prisma tapi tidak pernah
// ditulis/dibaca di mana pun, murni scaffolding kosong dari FR-027). Daripada
// nulis ke tabel yang belum pernah dipakai, level/XP dihitung deterministik
// on-read tiap request langsung dari data real (EventSkill x Application
// COMPLETED) — bukan angka yang dikarang.
const XP_PER_EVENT = 100
const XP_PER_LEVEL = 300

/**
 * @param {number} eventCount jumlah event COMPLETED user yang men-tag skill ini
 * @returns {{ xp: number, xpTarget: number, level: number }}
 */
export function deriveSkillXp(eventCount) {
  const xpTotal = Math.max(0, eventCount) * XP_PER_EVENT
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1
  const xp = xpTotal % XP_PER_LEVEL
  return { xp, xpTarget: XP_PER_LEVEL, level }
}
