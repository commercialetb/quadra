import Link from 'next/link'
import { buildShortcutManifest } from '@/lib/shortcut/shortcut-manifest'

const primaryKeys = new Set(['log_call_outcome', 'create_followup', 'today_agenda'])

export default function SiriInstallPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://TUO-DOMINIO'
  const actions = buildShortcutManifest(baseUrl)
  const primary = actions.filter((action) => primaryKeys.has(action.key))
  const secondary = actions.filter((action) => !primaryKeys.has(action.key))

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Apple Shortcuts</p>
          <h1 className="page-title">Installa i shortcut ufficiali di Quadra</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Qui trovi gli shortcut già allineati al backend di Quadra. L’utente finale deve solo copiare il file giusto in Apple Shortcuts, sostituire dominio e token una volta, e usare Siri.
          </p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Prima installa questi 3</h2>
            <p>Sono i più semplici e ad alto valore per l’uso reale su iPhone.</p>
          </div>
        </div>
        <div className="dashboard-grid three-up assistant-grid">
          {primary.map((action) => (
            <article key={action.key} className="panel-card page-section-card">
              <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
              <div className="stack-sm">
                <div><strong>Frase Siri:</strong> {action.phrase}</div>
                <div><strong>File:</strong> <code>{action.filename}</code></div>
                <div><strong>Risposta da leggere:</strong> <code>{action.responseFields.includes('spokenResponse') ? 'spokenResponse' : action.responseFields[0]}</code></div>
                <div className="cluster-wrap">
                  <Link href={`/shortcuts/${action.filename}`} target="_blank">Apri template JSON</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Installazione iPhone in 4 passi</h2>
            <p>Niente payload inventati: usa i template già pronti.</p>
          </div>
        </div>
        <div className="stack-sm">
          <div><strong>1.</strong> Apri uno dei file JSON qui sotto e copia i campi nel tuo shortcut Apple.</div>
          <div><strong>2.</strong> Sostituisci <code>https://TUO-DOMINIO</code> con il dominio reale di Quadra.</div>
          <div><strong>3.</strong> Sostituisci <code>SHORTCUT_SHARED_TOKEN</code> con il token condiviso.</div>
          <div><strong>4.</strong> In Apple Shortcuts usa: <em>Ottieni contenuti di URL</em> → metodo <strong>POST</strong> → leggi <code>spokenResponse</code> → apri <code>openUrl</code> se presente.</div>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Tutti gli shortcut</h2>
            <p>Pack completo da consegnare al cliente, compresi il flusso email, Gmail con etichetta CRM e la sync batch v21 con auto-triage, creazione automatica di azienda e contatto.</p>
          </div>
        </div>
        <div className="dashboard-grid two-up assistant-grid">
          {actions.map((action) => (
            <article key={action.key} className="panel-card page-section-card">
              <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
              <div className="stack-sm">
                <div><strong>Frase:</strong> {action.phrase}</div>
                <div><strong>Endpoint:</strong> <code>{action.url}</code></div>
                <div><strong>Template:</strong> <Link href={`/shortcuts/${action.filename}`} target="_blank">{action.filename}</Link></div>
                <div><strong>Campi risposta:</strong> {action.responseFields.join(', ')}</div>
                <pre className="assistant-json" style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{JSON.stringify(action.bodyExample, null, 2)}
                </pre>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Review queue</h2>
            <p>Se Siri non trova il record giusto, Quadra salva tutto e rimanda qui.</p>
          </div>
        </div>
        <div className="cluster-wrap">
          <Link href="/capture/siri/review">Apri review queue</Link>
          <Link href="/shortcuts/ingest-email.json" target="_blank">Apri template Leggi email</Link>
          <Link href="/shortcuts/ingest-gmail-crm.json" target="_blank">Apri template Gmail CRM</Link>
          <Link href="/shortcuts/sync-gmail-crm.json" target="_blank">Apri template Sync Gmail CRM</Link>
          <Link href="/api/shortcut/manifest" target="_blank">Apri manifest API</Link>
          <Link href="/shortcuts/manifest.json" target="_blank">Apri manifest file</Link>
        </div>
      </section>
    </div>
  )
}
