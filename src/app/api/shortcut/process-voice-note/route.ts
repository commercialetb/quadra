import { NextResponse } from 'next/server'
import { processVoiceFollowup } from '@/lib/shortcut/siri-flow'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const note = String(body?.note || '').trim()

    if (!note) {
      return NextResponse.json({ error: 'Missing note' }, { status: 400 })
    }

    const result = await processVoiceFollowup(note)

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
