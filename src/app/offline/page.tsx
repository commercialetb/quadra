import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="offline-shell">
      <section className="offline-card">
        <p className="page-eyebrow">Quadra offline</p>
        <h1 className="offline-title">Sei offline.</h1>
        <p className="offline-copy">
          Puoi riaprire la dashboard appena torni online. Se hai installato Quadra su iPhone, l&apos;app
          resta disponibile anche dalla Home.
        </p>
        <div className="offline-actions">
          <Link href="/dashboard" className="primary-button">
            Riprova
          </Link>
          <Link href="/capture/siri/install" className="ghost-button">
            Siri e Shortcut
          </Link>
        </div>
      </section>
    </main>
  )
}
