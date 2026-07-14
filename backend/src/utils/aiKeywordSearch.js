// Ekstraksi keyword sederhana dari pesan chat "Ask AI" (admin/organizer) —
// dipakai sbg sinyal retrieval terstruktur (lihat aiRelevanceRank.js): bukan
// semantic/vector search, cuma tokenisasi + stopword removal supaya query
// bebas ("event apa yang paling banyak komplain?") bisa dicocokkan ke field
// teks (title/description/comment/dst) di adminKnowledge.service.js &
// organizerKnowledge.service.js. Cukup utk skala data saat ini — kalau nanti
// datanya jauh lebih besar, ini titik yang perlu diganti embedding/vector DB.
const STOPWORDS = new Set([
  'yang', 'dengan', 'untuk', 'dari', 'pada', 'dan', 'atau', 'apa', 'apakah', 'siapa',
  'bagaimana', 'gimana', 'kenapa', 'mengapa', 'adalah', 'saya', 'kamu', 'anda', 'kita',
  'bisa', 'tolong', 'coba', 'mohon', 'please', 'ini', 'itu', 'di', 'ke', 'ada', 'nya',
  'saja', 'juga', 'lagi', 'sudah', 'belum', 'akan', 'harus', 'perlu', 'kalau', 'jika',
  'tentang', 'soal', 'mana', 'dalam', 'oleh', 'sebagai', 'karena', 'jadi', 'lebih',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'will', 'would', 'can', 'how', 'what',
  'why', 'about', 'and', 'or', 'for', 'with', 'that', 'this', 'you', 'me', 'my',
])

export function extractKeywords(text, { max = 8 } = {}) {
  if (!text) return []
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
  return [...new Set(tokens)].slice(0, max)
}

// Ambil keyword dari beberapa pesan user TERAKHIR (bukan cuma satu) supaya
// pertanyaan lanjutan ("kalau bulan lalu gimana?") tetap kebawa konteks topik
// dari pesan sebelumnya dalam chat yang sama.
export function extractKeywordsFromMessages(messages, { maxMessages = 3, max = 8 } = {}) {
  if (!Array.isArray(messages)) return []
  const userMessages = messages.filter((m) => m?.role === 'user').slice(-maxMessages)
  const combined = userMessages.map((m) => m.content).join(' ')
  return extractKeywords(combined, { max })
}
