// Provider Gemini (Google) — model default gemini-2.5-flash, override lewat
// env GEMINI_MODEL. Siap dipakai begitu GEMINI_API_KEY diisi di .env.
// Pakai responseSchema + responseMimeType JSON supaya output terstruktur.

import { GoogleGenAI } from '@google/genai'
import { env } from '../../../config/env.js'

const MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash'

let client = null

// Gemini tidak menerima keyword `additionalProperties` di responseSchema —
// buang secara rekursif dari JSON Schema yang dipakai bersama provider lain.
function toGeminiSchema(schema) {
  if (Array.isArray(schema)) return schema.map(toGeminiSchema)
  if (schema && typeof schema === 'object') {
    const cleaned = {}
    for (const [key, value] of Object.entries(schema)) {
      if (key === 'additionalProperties') continue
      cleaned[key] = toGeminiSchema(value)
    }
    return cleaned
  }
  return schema
}

export const geminiProvider = {
  name: 'gemini',

  isConfigured() {
    return Boolean(env.GEMINI_API_KEY)
  },

  async generate({ system, prompt, schema }) {
    if (!client) client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(schema),
      },
    })

    const text = response.text
    if (!text) throw new Error('Respons Gemini kosong')

    return JSON.parse(text)
  },
}
