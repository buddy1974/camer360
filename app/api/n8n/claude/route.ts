export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_QUALITY, MODEL_FAST, completionText } from '@/lib/ai/client';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== (process.env.AUTOMATION_API_KEY ?? process.env.NEXT_PUBLIC_AUTOMATION_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawText = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawText);
      if (typeof body === 'string') body = JSON.parse(body);
    } catch(e: any) {
      return NextResponse.json({ error: 'Body parse failed: ' + e.message, raw: rawText.substring(0, 200) }, { status: 400 });
    }
    const { system, user, model } = body;

    if (!system || !user) {
      return NextResponse.json({ error: 'Missing system or user field', received: Object.keys(body) }, { status: 400 });
    }

    const selectedModel = model === 'fast' ? MODEL_FAST : MODEL_QUALITY;
    const message = await openai.chat.completions.create({
      model: selectedModel,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]
    });

    let text = completionText(message);
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    console.log('RAW OPENAI RESPONSE:', text.substring(0, 500));

    // Validate JSON before returning
    try {
      JSON.parse(text);
    } catch {
      console.error('INVALID JSON FROM CLAUDE:', text.substring(0, 500));
      return new NextResponse(JSON.stringify({
        publish: false,
        error: 'INVALID_JSON_FROM_CLAUDE',
        raw: text.substring(0, 500),
      }), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-transform, no-store',
        }
      });
    }

    const payload = JSON.stringify({ text });
    return new NextResponse(payload, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(Buffer.byteLength(payload, 'utf8')),
        'Cache-Control': 'no-transform, no-store, no-cache',
        'X-Content-Type-Options': 'nosniff',
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
