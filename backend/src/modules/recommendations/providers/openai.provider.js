// Provider ChatGPT (OpenAI) — model default gpt-4o-mini (murah & cukup untuk
// tugas rating+reasoning ini), bisa dioverride lewat env OPENAI_MODEL.
// Pakai response_format json_schema mode strict supaya output dijamin valid.

import OpenAI from 'openai'
import { env } from '../../../config/env.js'

const MODEL = env.OPENAI_MODEL || 'gpt-4o-mini'

let client = null

export const openaiProvider = {
  name: 'openai',

  isConfigured() {
    return Boolean(env.OPENAI_API_KEY)
  },

  async generate({ system, prompt, schema }) {
    if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 8000,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'recommendations', strict: true, schema },
      },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    })

    const choice = response.choices?.[0]
    if (!choice?.message?.content) throw new Error('Respons OpenAI kosong')
    if (choice.message.refusal) {
      throw new Error(`OpenAI menolak request: ${choice.message.refusal}`)
    }

    return JSON.parse(choice.message.content)
  },
}

// Riset web live lewat Responses API (tool `web_search` bawaan OpenAI) — dipakai
// sbg fallback searchIdeas() (utils/aiIdeaSearch.js) kalau ANTHROPIC_API_KEY
// kosong tapi OPENAI_API_KEY terisi. Sengaja terpisah dari `openaiProvider.generate()`
// di atas (Chat Completions) krn tool web_search cuma tersedia di Responses API,
// pola sama dgn claudeWebSearch di claude.provider.js: cuma mengembalikan teks
// temuan mentah, diformat ulang lewat generate() biasa oleh pemanggil.
export async function openaiWebSearch({ system, prompt }) {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const response = await client.responses.create({
    model: MODEL,
    tools: [{ type: 'web_search' }],
    input: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  })

  const text = response.output_text
  if (!text) throw new Error('Respons riset OpenAI tidak berisi teks')

  return text
}
