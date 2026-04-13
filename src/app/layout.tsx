import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Quadra CRM',
  description: 'CRM personale.',
  icons: {
    icon: [
      { url: '/icons/icon-192-v18.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512-v18.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon-v18.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icons/icon-192-v18.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'Quadra',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
