import Link from 'next/link'
import { buildShortcutManifest } from '@/lib/shortcut/shortcut-manifest'

const officialKeys = new Set([
  'create_followup',
  'search_record',
  'today_agenda',
  'add_note',
  'log_call_outcome',
  'log_interaction',
])

const primaryKeys = new Set(['log_call_outcome', 'create_followup', 'today_agenda'])


type ShortcutInstallLink = {
  key: string
  installUrl: string | null
  source: 'icloud' | 'file' | null
}

function readShortcutLink(envName: string): string | null {
  const value = process.env[envName]?.trim()
  return value || null
}

function resolveShortcutInstallLink(key: string, envSuffix: string): ShortcutInstallLink {
  const icloudUrl = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_LINK_${envSuffix}`)
  if (icloudUrl) return { key, installUrl: icloudUrl, source: 'icloud' }

  const fileUrl = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_FILE_${envSuffix}`)
  if (fileUrl) return { key, installUrl: fileUrl, source: 'file' }

  return { key, installUrl: null, source: null }
}

function getShortcutInstallLinks(): ShortcutInstallLink[] {
  return [
    resolveShortcutInstallLink('create_followup', 'CREATE_FOLLOWUP'),
    resolveShortcutInstallLink('search_record', 'SEARCH_RECORD'),
    resolveShortcutInstallLink('today_agenda', 'TODAY_AGENDA'),
    resolveShortcutInstallLink('add_note', 'ADD_NOTE'),
    resolveShortcutInstallLink('log_call_outcome', 'LOG_CALL_OUTCOME'),
    resolveShortcutInstallLink('log_interaction', 'LOG_INTERACTION'),
    resolveShortcutInstallLink('ingest_email', 'INGEST_EMAIL'),
    resolveShortcutInstallLink('ingest_gmail_crm', 'INGEST_GMAIL_CRM'),
    resolveShortcutInstallLink('sync_gmail_crm', 'SYNC_GMAIL_CRM'),
  ]
}

export default function SiriInstallPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://TUO-DOMINIO'
  const actions = buildShortcutManifest(baseUrl)
  const installLinks = new Map(getShortcutInstallLinks().map((item) => [item.key, item]))
  const official = actions.filter((action) => officialKeys.has(action.key))
  const primary = official.filter((action) => primaryKeys.has(action.key))
  const secondary = official.filter((action) => !primaryKeys.has(action.key))

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Apple Shortcuts</p>
          <h1 className="page-title">Installa gli shortcut iPhone di Quadra</h1>
          <p className="page-subtitle dashboard-subtitle-compact">
            Questa pagina serve per l’utente finale: deve solo toccare “Installa su iPhone”. Il flusso corretto usa un link iCloud Apple oppure
            un file .shortcut già esportato. I template tecnici restano sotto solo come supporto.
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
            const install = installLinks.get(action.key)
            return (
              <article key={action.key} className="panel-card page-section-card">
                <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
                <div className="stack-sm">
                  <div><strong>Frase Siri:</strong> {action.phrase}</div>
                  <div><strong>Installazione:</strong> {install?.installUrl ? `pronta via ${install.source === 'icloud' ? 'link iCloud' : 'file .shortcut'}` : 'non attiva: manca link Apple'}</div>
                  <div className="cluster-wrap">
                    {install?.installUrl ? (
                      <Link href={install.installUrl} target="_blank">Installa su iPhone</Link>
                    ) : (
                      <span className="badge-soft">Installa non attiva: collega un link iCloud o un file .shortcut</span>
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
            const install = installLinks.get(action.key)
            return (
              <article key={action.key} className="panel-card page-section-card">
                <div className="panel-head"><div><h3>{action.title}</h3><p>{action.description}</p></div></div>
                <div className="stack-sm">
                  <div><strong>Frase Siri:</strong> {action.phrase}</div>
                  <div><strong>Azione:</strong> {action.path}</div>
                  <div><strong>Stato installazione:</strong> {install?.installUrl ? `pronto via ${install.source === 'icloud' ? 'iCloud' : 'file'}` : 'non attivo'}</div>
                  <div className="cluster-wrap">
                    {install?.installUrl ? (
                      <Link href={install.installUrl} target="_blank">Installa shortcut</Link>
                    ) : (
                      <span className="badge-soft">Manca link Apple</span>
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
            <p>Per renderli davvero user-friendly, collega qui i link iCloud Apple oppure i file .shortcut già esportati. L’utente finale non deve costruire nulla a mano.</p>
          </div>
        </div>
        <div className="stack-sm">
          <div><strong>1.</strong> Crea o rifinisci il comando nell’app Comandi su iPhone.</div>
          <div><strong>2.</strong> Condividilo come link iCloud oppure esportalo come file .shortcut.</div>
          <div><strong>3.</strong> Inserisci il link pubblico nella env giusta.</div>
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
