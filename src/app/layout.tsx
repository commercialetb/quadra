import './globals.css'
import './v5-clean.css'
import './v6-clean.css'
import './v7-clean.css'
import './v15-clean.css'
import './v17-clean.css'
import './v18-clean.css'
import './v19-clean.css'
import './v20-clean.css'
import './v21-clean.css'
import './v22-clean.css'
import './analysis-v2.css'
import type { Metadata, Viewport } from 'next'
import { PwaRegister } from '@/components/pwa-register'

export const metadata: Metadata = {
  metadataBase: new URL('https://quadra-alpha.vercel.app'),
  applicationName: 'Quadra',
  title: 'Quadra CRM',
  description: 'CRM personale.',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192-v21.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512-v21.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon-v21.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icons/icon-192-v21.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Quadra',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#684EFF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body><PwaRegister />{children}</body>
    </html>
  )
}
