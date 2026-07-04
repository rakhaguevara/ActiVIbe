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
