import OpenAI from 'openai'
import type { ChatCompletion } from 'openai/resources/chat/completions'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export const MODEL_QUALITY = 'gpt-4o'
export const MODEL_FAST = 'gpt-4o-mini'

export function completionText(res: ChatCompletion): string {
  return res.choices[0]?.message?.content ?? ''
}
