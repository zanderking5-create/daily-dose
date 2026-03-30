import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = authHeader?.replace('Bearer ', '')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/generate-briefing`, {
      method: 'POST',
      headers: {
        'x-cron-secret': process.env.CRON_SECRET!,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error }, { status: res.status })
    }

    return NextResponse.json({ success: true, message: 'Briefing generated for today' })
  } catch (err: unknown) {
    console.error('Cron error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cron job failed' },
      { status: 500 }
    )
  }
}
