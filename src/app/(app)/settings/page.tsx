import Link from 'next/link'

function readShortcutLink(envName: string) {
  return process.env[envName]?.trim() || null
}

function shortcutState(envSuffix: string) {
  const icloud = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_LINK_${envSuffix}`)
  const file = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_FILE_${envSuffix}`)
  if (icloud) return { label: 'Pronto su iPhone', href: icloud }
  if (file) return { label: 'Pronto da file', href: file }
  return { label: 'Da collegare', href: '/capture/siri/install' }
}

const shortcuts = [
  { key: 'CREATE_FOLLOWUP', title: 'Crea follow-up' },
  { key: 'SEARCH_RECORD', title: 'Cerca record' },
  { key: 'TODAY_AGENDA', title: 'Mostra oggi' },
  { key: 'ADD_NOTE', title: 'Aggiungi nota' },
  { key: 'LOG_CALL_OUTCOME', title: 'Registra esito chiamata' },
  { key: 'LOG_INTERACTION', title: 'Registra interazione' },
]

const exportsList = [
  { key: 'companies', title: 'Esporta aziende CSV' },
  { key: 'contacts', title: 'Esporta contatti CSV' },
  { key: 'opportunities', title: 'Esporta opportunità CSV' },
  { key: 'followups', title: 'Esporta follow-up CSV' },
]

export default function SettingsPage() {
  return (
    <div className="page-stack utility-page-stack">
      <div className="utility-tag-row">
        <span className="hero-chip">Import CSV / Excel</span>
        <span className="hero-chip">Shortcut Siri</span>
        <span className="hero-chip">Google / Android</span>
      </div>

      <div className="settings-grid">
        <section className="panel-card settings-panel">
          <div className="panel-head compact">
            <div>
              <p className="page-eyebrow">Data</p>
              <h2>Import</h2>
            </div>
          </div>
          <p className="settings-copy">Carica file Excel o CSV e importa aziende, contatti e opportunità senza sporcare il CRM.</p>
          <div className="cluster-wrap">
            <Link href="/import" className="primary-button">Apri import</Link>
            <Link href="/import" className="ghost-button">Mappatura campi</Link>
          </div>
        </section>

        <section className="panel-card settings-panel settings-panel-accent">
          <div className="panel-head compact">
            <div>
              <p className="page-eyebrow">Voice</p>
              <h2>Shortcut Siri</h2>
            </div>
          </div>
          <p className="settings-copy">Tieni il capitolo shortcut pronto, senza farne il centro dell'app. I link iPhone vivono qui.</p>
          <div className="shortcut-mini-list">
            {shortcuts.map((item) => {
              const state = shortcutState(item.key)
              return (
                <div key={item.key} className="shortcut-mini-item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{state.label}</span>
                  </div>
                  <Link href={state.href} className="ghost-button">Apri</Link>
                </div>
              )
            })}
          </div>
          <div className="cluster-wrap">
            <Link href="/capture/siri/install" className="primary-button">Gestisci shortcut</Link>
            <Link href="/capture/siri/review" className="ghost-button">Apri review</Link>
          </div>
        </section>
      </div>

      <div className="settings-grid settings-grid-bottom">
        <section className="panel-card settings-panel">
          <div className="panel-head compact">
            <div>
              <p className="page-eyebrow">Data</p>
              <h2>Export CSV</h2>
            </div>
          </div>
          <p className="settings-copy">Esporta rapidamente i dati principali del CRM. Un click, un file pulito.</p>
          <div className="shortcut-mini-list export-list">
            {exportsList.map((item) => (
              <div key={item.key} className="shortcut-mini-item">
                <div>
                  <strong>{item.title}</strong>
                  <span>Download immediato</span>
                </div>
                <Link href={`/api/export/${item.key}`} className="ghost-button">Scarica</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card settings-panel settings-panel-muted">
          <div className="panel-head compact">
            <div>
              <p className="page-eyebrow">Android</p>
              <h2>Google comandi</h2>
            </div>
          </div>
          <p className="settings-copy">Non perdiamo Android. Qui teniamo pronto il capitolo Google Assistant / Android commands, senza complicare l'app oggi.</p>
          <div className="status-card-grid">
            <div className="status-card-soft">
              <strong>Stato</strong>
              <span>In preparazione</span>
            </div>
            <div className="status-card-soft">
              <strong>Target</strong>
              <span>Android / Google</span>
            </div>
          </div>
          <div className="cluster-wrap">
            <span className="badge-soft">Teniamolo vivo, ma non centrale</span>
          </div>
        </section>
      </div>
    </div>
  )
}
