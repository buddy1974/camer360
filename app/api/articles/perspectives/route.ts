import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { title, excerpt, body } = await req.json() as {
    title: string; excerpt?: string; body?: string
  }
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const prompt = `You are a cultural analyst writing for Camer360, West & Central Africa's premier entertainment magazine.

For this entertainment story, write three short, punchy perspectives (max 60 words each):

1. FAN VIEW 💜 — How fans and stans see this. Passionate, emotional, protective or celebratory.
2. CRITIC VIEW 🎯 — Sharp, objective analysis. What does this mean for the industry or artistry?
3. INDUSTRY INSIDER 🤫 — Behind-the-scenes business/power angle. What's really going on that the public doesn't see?

Article: "${title}"
${excerpt ? `Summary: ${excerpt}` : ''}
${body ? `Content: ${body.replace(/<[^>]+>/g, '').slice(0, 600)}` : ''}

Return ONLY valid JSON. No markdown fences.
{"fanView":"...","criticView":"...","insiderView":"..."}`

  try {
    const message = await claude.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 600,
      messages:   [{ role: 'user', content: prompt }],
    })
    const text  = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as { fanView: string; criticView: string; insiderView: string }
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to generate perspectives' }, { status: 500 })
  }
}
