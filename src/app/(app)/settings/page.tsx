'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type ExportKey = 'all' | 'companies' | 'contacts' | 'opportunities' | 'followups'

type ExportChoice = {
  key: ExportKey
  title: string
  description: string
  href: string
}

const SHORTCUT_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_SHORTCUT_LINK_CREATE_FOLLOWUP: process.env.NEXT_PUBLIC_SHORTCUT_LINK_CREATE_FOLLOWUP,
  NEXT_PUBLIC_SHORTCUT_FILE_CREATE_FOLLOWUP: process.env.NEXT_PUBLIC_SHORTCUT_FILE_CREATE_FOLLOWUP,
  NEXT_PUBLIC_SHORTCUT_LINK_SEARCH_RECORD: process.env.NEXT_PUBLIC_SHORTCUT_LINK_SEARCH_RECORD,
  NEXT_PUBLIC_SHORTCUT_FILE_SEARCH_RECORD: process.env.NEXT_PUBLIC_SHORTCUT_FILE_SEARCH_RECORD,
  NEXT_PUBLIC_SHORTCUT_LINK_TODAY_AGENDA: process.env.NEXT_PUBLIC_SHORTCUT_LINK_TODAY_AGENDA,
  NEXT_PUBLIC_SHORTCUT_FILE_TODAY_AGENDA: process.env.NEXT_PUBLIC_SHORTCUT_FILE_TODAY_AGENDA,
  NEXT_PUBLIC_SHORTCUT_LINK_LOG_CALL_OUTCOME: process.env.NEXT_PUBLIC_SHORTCUT_LINK_LOG_CALL_OUTCOME,
  NEXT_PUBLIC_SHORTCUT_FILE_LOG_CALL_OUTCOME: process.env.NEXT_PUBLIC_SHORTCUT_FILE_LOG_CALL_OUTCOME,
}

function readShortcutLink(envName: keyof typeof SHORTCUT_ENV) {
  return SHORTCUT_ENV[envName]?.trim() || null
}

function shortcutState(envSuffix: string) {
  const icloud = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_LINK_${envSuffix}` as keyof typeof SHORTCUT_ENV)
  const file = readShortcutLink(`NEXT_PUBLIC_SHORTCUT_FILE_${envSuffix}` as keyof typeof SHORTCUT_ENV)
  if (icloud) return { label: 'Pronto su iPhone', href: icloud }
  if (file) return { label: 'Pronto da file', href: file }
  return { label: 'Da collegare', href: '/capture/siri/install' }
}

const shortcutCards = [
  { key: 'CREATE_FOLLOWUP', title: 'Crea follow-up' },
  { key: 'SEARCH_RECORD', title: 'Cerca record' },
  { key: 'TODAY_AGENDA', title: 'Mostra oggi' },
  { key: 'LOG_CALL_OUTCOME', title: 'Registra esito chiamata' },
]

const exportChoices: ExportChoice[] = [
  {
    key: 'all',
    title: 'Tutti i dati',
    description: 'Aziende, contatti, opportunità e follow-up in un unico export.',
    href: '/api/export/all',
  },
  {
    key: 'companies',
    title: 'Solo aziende',
    description: 'Anagrafica, città, stato e canali principali.',
    href: '/api/export/companies',
  },
  {
    key: 'contacts',
    title: 'Solo contatti',
    description: 'Persone, ruoli, email e collegamenti azienda.',
    href: '/api/export/contacts',
  },
  {
    key: 'opportunities',
    title: 'Solo opportunità',
    description: 'Pipeline, fase, valore e probabilità.',
    href: '/api/export/opportunities',
  },
  {
    key: 'followups',
    title: 'Solo follow-up',
    description: 'Agenda, scadenze, priorità e stato attività.',
    href: '/api/export/followups',
  },
]

export default function SettingsPage() {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedExport, setSelectedExport] = useState<ExportKey>('all')

  const currentExport = useMemo(
    () => exportChoices.find((item) => item.key === selectedExport) ?? exportChoices[0],
    [selectedExport],
  )

  return (
    <div className="page-stack utility-page-stack utility-page-stack-tight">
      <div className="settings-columns">
        <div className="settings-column-main">
          <section className="panel-card settings-panel settings-panel-import settings-panel-flat">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Data</p>
                <h2>Import</h2>
              </div>
            </div>
            <p className="settings-copy">
              Carica file Excel o CSV e importa aziende, contatti e opportunità senza sporcare il CRM.
            </p>
            <div className="cluster-wrap">
              <Link href="/import" className="primary-button">Apri import</Link>
              <Link href="/import" className="ghost-button">Mappatura campi</Link>
            </div>
          </section>

          <section className="panel-card settings-panel settings-panel-flat settings-panel-export">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Data</p>
                <h2>Export dati</h2>
              </div>
            </div>
            <p className="settings-copy">
              Un solo flusso di export: scegli cosa scaricare quando ti serve, senza quattro card duplicate.
            </p>

            <div className="export-summary-card">
              <div>
                <strong>{currentExport.title}</strong>
                <span>{currentExport.description}</span>
              </div>
              <button type="button" className="ghost-button" onClick={() => setPickerOpen((open) => !open)}>
                {pickerOpen ? 'Chiudi scelta' : 'Scegli export'}
              </button>
            </div>

            {pickerOpen ? (
              <div className="export-picker-grid" role="list" aria-label="Scelta export dati">
                {exportChoices.map((item) => {
                  const isActive = item.key === selectedExport
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`export-choice-card ${isActive ? 'is-active' : ''}`}
                      onClick={() => setSelectedExport(item.key)}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div className="cluster-wrap">
              <Link href={currentExport.href} className="primary-button">Scarica export</Link>
              <button type="button" className="ghost-button" onClick={() => setPickerOpen(true)}>
                Cambia selezione
              </button>
            </div>
          </section>
        </div>

        <div className="settings-column-side">
          <section className="panel-card settings-panel settings-panel-accent settings-panel-flat">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Voice</p>
                <h2>Shortcut Siri</h2>
              </div>
            </div>
            <p className="settings-copy">
              Tieni i comandi davvero utili, senza trasformare la pagina in un elenco lunghissimo da scorrere.
            </p>
            <div className="shortcut-mini-list shortcut-mini-list-compact">
              {shortcutCards.map((item) => {
                const state = shortcutState(item.key)
                return (
                  <div key={item.key} className="shortcut-mini-item shortcut-mini-item-clean">
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

          <section className="panel-card settings-panel settings-panel-muted settings-panel-flat settings-panel-android">
            <div className="panel-head compact">
              <div>
                <p className="page-eyebrow">Android</p>
                <h2>Google comandi</h2>
              </div>
            </div>
            <p className="settings-copy">
              Rimane vivo ma secondario: teniamo il capitolo Android pronto senza rubare spazio alla parte davvero operativa.
            </p>
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

      <section className="panel-card milestone-panel">
        <div className="panel-head compact">
          <div>
            <p className="page-eyebrow">Milestone board</p>
            <h2>Stato lavori</h2>
          </div>
        </div>

        <div className="milestone-board-grid">
          <div className="milestone-column milestone-column-done">
            <div className="milestone-column-head">
              <strong>Done</strong>
              <span>Base stabile</span>
            </div>
            <ul className="milestone-list">
              <li>Shell molto più pulita rispetto all’inizio</li>
              <li>Sidebar desktop credibile e topbar più coerente</li>
              <li>Dashboard meno caotica e con meno duplicazioni</li>
              <li>CRUD principali molto più ordinati</li>
              <li>Voice e AI riportate in una gerarchia più leggibile</li>
            </ul>
          </div>

          <div className="milestone-column milestone-column-progress">
            <div className="milestone-column-head">
              <strong>In corso</strong>
              <span>Rifinitura</span>
            </div>
            <ul className="milestone-list">
              <li>Dashboard iPad da alleggerire ancora</li>
              <li>Colonna destra dashboard da compattare meglio</li>
              <li>Copilota AI da rifinire come modulo definitivo</li>
              <li>Pagina Strumenti da semplificare</li>
              <li>Coerenza totale tra desktop, iPad e iPhone</li>
            </ul>
          </div>

          <div className="milestone-column milestone-column-next">
            <div className="milestone-column-head">
              <strong>Da fare</strong>
              <span>Step successivi</span>
            </div>
            <ul className="milestone-list">
              <li>Milestone 2: dashboard production-ready</li>
              <li>Milestone 3: tools redesign completo</li>
              <li>Milestone 4: AI operativa e query complesse più affidabili</li>
              <li>Milestone 5: polish finale di Aziende, Contatti, Opportunità e Follow-up</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
