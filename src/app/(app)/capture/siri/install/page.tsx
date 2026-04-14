import Link from 'next/link'
import { buildShortcutManifest } from '@/lib/shortcut/shortcut-manifest'
import { getShortcutInstallLinks } from '@/lib/shortcut/shortcut-install-links'

const officialKeys = new Set([
  'create_followup',
  'search_record',
  'today_agenda',
  'add_note',
  'log_call_outcome',
  'log_interaction',
])

const primaryKeys = new Set(['log_call_outcome', 'create_followup', 'today_agenda'])

export default function SiriInstallPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://TUO-DOMINIO'
  const actions = buildShortcutManifest(baseUrl)
  const installLinks = new Map(getShortcutInstallLinks().map((item) => [item.key, item.icloudUrl]))
  const official = actions.filter((action) => officialKeys.has(action.key))
  const primary = official.filter((action) => primaryKeys.has(action.key))
  const secondary = official.filter((action) => !primaryKeys.has(action.key))

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Apple Shortcuts</p>
          <h1 className="page-title">Installa gli shortcut ufficiali di Quadra</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Questa pagina serve per l’utente finale: deve solo toccare “Installa su iPhone”. I template tecnici restano disponibili sotto,
            ma il flusso principale e consigliato passa dai link iCloud degli shortcut Apple già pronti.
          </p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>I 3 da installare subito</h2>
            <p>Sono i più semplici, ad alto valore e adatti a un uso quotidiano vero su iPhone.</p>
          </div>
        </div>
        <div className="dashboard-grid three-up assistant-grid">
          {primary.map((action) => {
            const icloudUrl = installLinks.get(action.key)
            return (
              <article key={action.key} className="panel-card page-section-card">
                <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
                <div className="stack-sm">
                  <div><strong>Frase Siri:</strong> {action.phrase}</div>
                  <div><strong>Installazione:</strong> {icloudUrl ? 'pronta' : 'in attesa del link iCloud'}</div>
                  <div className="cluster-wrap">
                    {icloudUrl ? (
                      <Link href={icloudUrl} target="_blank">Installa su iPhone</Link>
                    ) : (
                      <span className="badge-soft">Aggiungi il link iCloud nelle env pubbliche</span>
                    )}
                    <Link href={`/shortcuts/${action.filename}`} target="_blank">Template tecnico</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Tutti i 6 shortcut ufficiali</h2>
            <p>Questi sono i comandi che l’utente deve trovare già pronti, senza costruire nulla a mano nell’app Comandi.</p>
          </div>
        </div>
        <div className="dashboard-grid two-up assistant-grid">
          {[...primary, ...secondary].map((action) => {
            const icloudUrl = installLinks.get(action.key)
            return (
              <article key={action.key} className="panel-card page-section-card">
                <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
                <div className="stack-sm">
                  <div><strong>Frase Siri:</strong> {action.phrase}</div>
                  <div><strong>Azione:</strong> {action.path}</div>
                  <div><strong>Stato installazione:</strong> {icloudUrl ? 'link pronto' : 'link da collegare'}</div>
                  <div className="cluster-wrap">
                    {icloudUrl ? (
                      <Link href={icloudUrl} target="_blank">Installa shortcut</Link>
                    ) : (
                      <span className="badge-soft">Manca link iCloud</span>
                    )}
                    <Link href={`/shortcuts/${action.filename}`} target="_blank">Apri template</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Come si chiude davvero il flusso</h2>
            <p>Per renderli davvero user-friendly, crea gli shortcut Apple una volta, condividili via link iCloud e inserisci quei link qui.</p>
          </div>
        </div>
        <div className="stack-sm">
          <div><strong>1.</strong> Crea o rifinisci il comando nell’app Comandi su iPhone.</div>
          <div><strong>2.</strong> Condividilo come link iCloud.</div>
          <div><strong>3.</strong> Inserisci il link nella env pubblica giusta.</div>
          <div><strong>4.</strong> Ridistribuisci: l’utente finale tocca “Installa” e basta.</div>
        </div>
        <div className="cluster-wrap">
          <Link href="/shortcuts/manifest.json" target="_blank">Apri manifest file</Link>
          <Link href="/api/shortcut/manifest" target="_blank">Apri manifest API</Link>
          <Link href="/capture/siri/review">Apri review queue</Link>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Shortcut email e Gmail</h2>
            <p>Questi restano opzionali e più avanzati. Prima fai bene i 6 ufficiali di iPhone, poi aggiungi il blocco email.</p>
          </div>
        </div>
        <div className="cluster-wrap">
          <Link href="/shortcuts/ingest-email.json" target="_blank">Leggi email</Link>
          <Link href="/shortcuts/ingest-gmail-crm.json" target="_blank">Gmail CRM</Link>
          <Link href="/shortcuts/sync-gmail-crm.json" target="_blank">Sync Gmail CRM</Link>
        </div>
      </section>
    </div>
  )
}
