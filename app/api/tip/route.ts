import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json() as { tip?: string; name?: string; contact?: string; category?: string }

  if (!body.tip?.trim() || body.tip.trim().length < 30) {
    return NextResponse.json({ error: 'Tip too short' }, { status: 400 })
  }

  // Log to console — in production connect to Resend/email or a tips DB table
  console.log('[TIP RECEIVED]', {
    category: body.category,
    name:     body.name || 'Anonymous',
    contact:  body.contact || 'None',
    tip:      body.tip.trim(),
    receivedAt: new Date().toISOString(),
  })

  // TODO: send email via Resend
  // await resend.emails.send({
  //   from: 'tips@camer360.com',
  //   to:   'newsroom@camer360.com',
  //   subject: `[Tip] ${body.category} — ${new Date().toLocaleDateString()}`,
  //   text: `From: ${body.name || 'Anonymous'}\nContact: ${body.contact || 'None'}\n\n${body.tip}`,
  // })

  return NextResponse.json({ ok: true })
}
