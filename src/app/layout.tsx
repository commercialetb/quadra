import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quadra CRM',
  description: 'CRM pulito e operativo per aziende, contatti e opportunita.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
