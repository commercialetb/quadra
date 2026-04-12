import Link from 'next/link'
import { formatCurrency, formatDateTime } from '@/lib/format'

function StageBadge({ stage }: { stage: string }) {
  const klass =
    stage === 'won' ? 'badge-success' :
    stage === 'lost' ? 'badge-danger' :
    stage === 'proposal' || stage === 'negotiation' ? 'badge-warning' : 'badge-accent'

  return <span className={`badge ${klass}`}>{stage.replace('_', ' ')}</span>
}

export function DashboardShell({ data }: { data: any }) {
  const heroTitle =
    data.kpis.overdueCount > 0
      ? `Hai ${data.kpis.overdueCount} elementi da sbloccare.`
      : data.kpis.todayCount > 0
        ? `${data.kpis.todayCount} follow-up da gestire oggi.`
        : 'Quadra è in ordine. Parti dalle trattative.'

  return (
    <div className="page-wrap">
      <div className="hero-grid">
        <section className="hero-panel surface-card">
          <p className="page-eyebrow">Today</p>
          <h1 className="page-title" style={{ marginTop: 8 }}>Dashboard utile, non decorativa.</h1>
          <p className="page-subtitle">{heroTitle} Il focus è semplice: cosa fare oggi, cosa rischia di fermarsi e cosa merita il prossimo tocco.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="/companies">+ Azienda</Link>
            <Link className="button-secondary" href="/contacts">+ Contatto</Link>
            <Link className="button-secondary" href="/opportunities">+ Opportunità</Link>
          </div>
          <div className="hero-statline">
            <span className="chip chip-accent"><span className="chip-dot" /> {data.kpis.todayCount} oggi</span>
            <span className="chip"><span className="chip-dot" /> {data.kpis.openCount} aperte</span>
            <span className="chip"><span className="chip-dot" /> {data.kpis.overdueCount} scaduti</span>
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Oggi</h2>
              <p className="section-copy">Le prossime cose da non perdere.</p>
            </div>
          </div>
          <div className="list-stack">
            {data.todayFollowups.slice(0, 3).map((item: any) => (
              <div key={item.id} className="list-card">
                <div className="item-top">
                  <div>
                    <p className="item-title">{item.title}</p>
                    <p className="item-subtitle">Scade {formatDateTime(item.due_at)}</p>
                  </div>
                  <span className="badge badge-warning">{item.priority}</span>
                </div>
              </div>
            ))}
            {data.todayFollowups.length === 0 ? <div className="empty-state">Nessun follow-up per oggi. Ottimo momento per lavorare su pipeline e contesto.</div> : null}
          </div>
        </section>
      </div>

      <section className="metrics-grid">
        <article className="metric-card" data-tone="blue">
          <p className="metric-label">Opportunità aperte</p>
          <div className="metric-value">{data.kpis.openCount}</div>
          <p className="metric-note">Trattative da far avanzare</p>
        </article>
        <article className="metric-card" data-tone="red">
          <p className="metric-label">Scaduti</p>
          <div className="metric-value">{data.kpis.overdueCount}</div>
          <p className="metric-note">Azioni che meritano una decisione</p>
        </article>
        <article className="metric-card" data-tone="amber">
          <p className="metric-label">Focus di oggi</p>
          <div className="metric-value">{data.kpis.todayCount}</div>
          <p className="metric-note">Follow-up pianificati in giornata</p>
        </article>
        <article className="metric-card" data-tone="green">
          <p className="metric-label">Valore pipeline</p>
          <div className="metric-value">{formatCurrency(data.kpis.pipelineValue)}</div>
          <p className="metric-note">Totale trattative attive</p>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Priorità da sbloccare</h2>
              <p className="section-copy">Le opportunità che meritano un tocco, non un grafico.</p>
            </div>
            <Link href="/opportunities" className="button-ghost">Vedi tutte</Link>
          </div>
          <div className="list-stack">
            {data.staleOpportunities.length === 0 ? <div className="empty-state">Nessuna opportunità ferma. Ottimo segnale.</div> : data.staleOpportunities.slice(0, 4).map((item: any) => (
              <Link key={item.id} href={`/opportunities/${item.id}`} className="list-card">
                <div className="item-top">
                  <div>
                    <p className="item-title">{item.title}</p>
                    <p className="item-subtitle">Ultimo aggiornamento {formatDateTime(item.updated_at)}</p>
                  </div>
                  <StageBadge stage={item.stage} />
                </div>
                <div className="badge-row">
                  {item.next_action ? <span className="badge badge-soft">{item.next_action}</span> : null}
                  <span className="badge badge-soft">{formatCurrency(item.value_estimate)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Aziende recenti</h2>
              <p className="section-copy">Per rientrare subito nel contesto.</p>
            </div>
            <Link href="/companies" className="button-ghost">Apri</Link>
          </div>
          <div className="list-stack">
            {data.recentCompanies.map((item: any) => (
              <Link key={item.id} href={`/companies/${item.id}`} className="list-card">
                <div className="item-top">
                  <div>
                    <p className="item-title">{item.name}</p>
                    <p className="item-subtitle">{item.city || 'Città non indicata'}</p>
                  </div>
                  <span className="badge badge-soft">{item.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Pipeline attiva</h2>
              <p className="section-copy">Le trattative su cui vale la pena restare lucidi.</p>
            </div>
          </div>
          <div className="list-stack">
            {(data.openOpportunities || []).slice(0, 5).map((item: any) => (
              <Link key={item.id} href={`/opportunities/${item.id}`} className="list-card">
                <div className="item-top">
                  <div>
                    <p className="item-title">{item.title}</p>
                    <p className="item-subtitle">{item.company_name || 'Azienda non indicata'}</p>
                  </div>
                  <StageBadge stage={item.stage} />
                </div>
                <div className="badge-row">
                  <span className="badge badge-soft">{formatCurrency(item.value_estimate)}</span>
                  {item.next_action_due_at ? <span className="badge badge-soft">{formatDateTime(item.next_action_due_at)}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">Attività recenti</h2>
              <p className="section-copy">L’ultimo contesto utile, senza rumore.</p>
            </div>
          </div>
          <div className="list-stack">
            {(data.recentActivities || []).slice(0, 5).map((item: any) => (
              <div key={item.id} className="list-card">
                <div className="item-top">
                  <div>
                    <p className="item-title">{item.subject || 'Attività senza oggetto'}</p>
                    <p className="item-subtitle">{item.kind} · {formatDateTime(item.happened_at)}</p>
                  </div>
                </div>
                {item.content ? <p className="item-meta">{item.content}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
