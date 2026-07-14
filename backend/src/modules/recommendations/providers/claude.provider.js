// Provider Claude (Anthropic) — model default claude-opus-4-8, pakai
// structured outputs (output_config.format) supaya respons dijamin JSON valid.

import Anthropic from '@anthropic-ai/sdk'
import { env } from '../../../config/env.js'

const MODEL = env.CLAUDE_MODEL || 'claude-opus-4-8'

let client = null

export const claudeProvider = {
  name: 'claude',

  isConfigured() {
    return Boolean(env.ANTHROPIC_API_KEY)
  },

  /**
   * @param {{system: string, prompt: string, schema: object}} params
   *   schema = JSON Schema objek root (type: object, additionalProperties false)
   * @returns {Promise<object>} hasil parse JSON sesuai schema
   */
  async generate({ system, prompt, schema }) {
    if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema', schema } },
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    if (response.stop_reason === 'refusal') {
      throw new Error('Claude menolak request (stop_reason: refusal)')
    }

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock) throw new Error('Respons Claude tidak berisi blok teks')

    return JSON.parse(textBlock.text)
  },
}

// Riset web live (Claude + OpenAI — lihat openaiWebSearch di openai.provider.js
// utk versi ChatGPT; Gemini provider di repo ini masih belum dikawinkan dengan
// tool search apa pun). SENGAJA terpisah dari `claudeProvider` di atas: bukan
// bagian dari kontrak generik generate({system,prompt,schema}) yang dipakai
// resolveAiProvider lintas 3 provider, jadi dipilih lewat daftar provider
// khusus web-search di searchIdeas() (utils/aiIdeaSearch.js), bukan lewat
// provider resolution biasa. Tidak dikombinasikan dengan output_config/json_schema
// dalam satu call yang sama — dipisah jadi 2 langkah oleh pemanggil: call ini
// cuma mengembalikan teks temuan mentah, lalu diformat ulang lewat `generate()`
// biasa di atas.
export async function claudeWebSearch({ system, prompt }) {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    tools: [{ type: 'web_search_20260318', name: 'web_search', max_uses: 3 }],
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude menolak request riset (stop_reason: refusal)')
  }

  const textBlocks = response.content.filter((block) => block.type === 'text').map((block) => block.text)
  if (textBlocks.length === 0) throw new Error('Respons riset Claude tidak berisi blok teks')

  return textBlocks.join('\n\n')
}
