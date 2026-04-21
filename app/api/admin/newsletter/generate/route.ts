import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_FAST, completionText } from '@/lib/ai/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { articles, template } = await req.json();

  const titles = articles.map((a: any) => a.title).join('\n- ');
  const prompt = `You are the editor of Camer360 news. Given these article titles:
- ${titles}

Generate for a ${template} newsletter:
1. A compelling email subject line (max 60 chars)
2. Preview text (max 90 chars)
3. A brief intro paragraph (2 sentences max)

Reply ONLY with JSON: {"subject":"...","preview":"...","intro":"..."}`;

  const completion = await openai.chat.completions.create({
    model: MODEL_FAST,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = completionText(completion) || '{}';
  const result = JSON.parse(text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim());
  return NextResponse.json(result);
}
