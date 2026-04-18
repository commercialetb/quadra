import { NextResponse } from 'next/server'

function configured(value: string | undefined) {
  return Boolean(value && value.trim())
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'quadra-crm',
      checks: {
        supabaseUrl: configured(process.env.NEXT_PUBLIC_SUPABASE_URL),
        supabaseAnonKey: configured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        appUrl: configured(process.env.NEXT_PUBLIC_APP_URL),
        shortcutToken: configured(process.env.SHORTCUT_SHARED_TOKEN),
        groqConfigured: configured(process.env.GROQ_API_KEY),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
