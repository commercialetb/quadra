import { buildShortcutManifest } from '@/lib/shortcut/shortcut-manifest'

export default function SiriInstallPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://TUO-DOMINIO'
  const actions = buildShortcutManifest(baseUrl)

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Siri install kit</p>
          <h1 className="page-title">Quadra v11 Apple Shortcuts</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Kit operativo per Apple Shortcuts con deep link, review queue, confidence scoring e retry intelligente pronti da usare.
          </p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head"><div><h2>Setup rapido</h2><p>Configura token, endpoint e fallback review prima del deploy produzione.</p></div></div>
        <div className="stack-sm">
          <div><strong>1.</strong> Imposta <code>NEXT_PUBLIC_APP_URL</code> e <code>SHORTCUT_SHARED_TOKEN</code> in ambiente.</div>
          <div><strong>2.</strong> Usa <code>/api/health</code> per verificare che env e token siano davvero caricati.</div>
          <div><strong>3.</strong> In Shortcuts usa <em>Ottieni contenuti di URL</em> con metodo <strong>POST</strong> e passa il token nel body JSON oppure nell’header.</div>
          <div><strong>4.</strong> Fai leggere a Siri <code>spokenResponse</code> o <code>spokenSummary</code>.</div>
          <div><strong>5.</strong> Se la risposta contiene <code>openUrl</code>, aggiungi <em>Apri URL</em> per portare Quadra direttamente al record o alla queue review.</div>
          <div><strong>6.</strong> Per casi ambigui usa <code>/capture/siri/review</code>: in v11 puoi retry, auto-resolve o chiudere a mano mantenendo il payload tracciato.</div>
        </div>
      </section>

      <div className="dashboard-grid two-up assistant-grid">
        {actions.map((action) => (
          <section key={action.key} className="panel-card page-section-card">
            <div className="panel-head"><div><h2>{action.title}</h2><p>{action.description}</p></div></div>
            <div className="stack-sm">
              <div><strong>Frase:</strong> {action.phrase}</div>
              <div><strong>Endpoint:</strong> <code>{action.url}</code></div>
              <div><strong>Metodo:</strong> <code>{action.method}</code></div>
              <div><strong>Campi risposta:</strong> {action.responseFields.join(', ')}</div>
              <div>
                <strong>Body JSON:</strong>
                <pre className="assistant-json" style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                  {JSON.stringify(action.bodyExample, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
