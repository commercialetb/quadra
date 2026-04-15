#!/usr/bin/env node
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  'SHORTCUT_SHARED_TOKEN',
]

const optional = ['GROQ_API_KEY', 'OPENAI_API_KEY']

const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim())
const configuredOptional = optional.filter((key) => process.env[key] && String(process.env[key]).trim())

console.log('Quadra preflight')
console.log(`Required present: ${required.length - missing.length}/${required.length}`)
if (missing.length) {
  console.log(`Missing required env: ${missing.join(', ')}`)
  process.exitCode = 1
} else {
  console.log('All required env present.')
}

console.log(`AI providers configured: ${configuredOptional.join(', ') || 'none'}`)
