import { NextResponse } from 'next/server'
import { buildShortcutManifest } from '@/lib/shortcut/shortcut-manifest'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  return NextResponse.json(
    {
      ok: true,
      app: 'Quadra',
      version: 'v11',
      installPage: `${origin}/capture/siri/install`,
      reviewPage: `${origin}/capture/siri/review`,
      actions: buildShortcutManifest(origin),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
