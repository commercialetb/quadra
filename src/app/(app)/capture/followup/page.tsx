import { createFollowup } from '@/app/(app)/actions'

function plusOneHourLocalInput() {
  const date = new Date(Date.now() + 60 * 60 * 1000)
  const tzOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

export default async function ShortcutFollowupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const title = typeof params.title === 'string' ? params.title : ''
  const description = typeof params.description === 'string' ? params.description : ''
  const priority = typeof params.priority === 'string' ? params.priority : 'medium'

  return (
    <div className="page-stack">
      <section className="dashboard-hero dashboard-hero-compact">
        <div>
          <p className="page-eyebrow">Shortcut</p>
          <h1 className="page-title">Cattura follow-up rapida</h1>
          <p className="page-subtitle dashboard-subtitle-compact">Questa pagina è pronta per essere aperta da Siri / Comandi Rapidi con campi già precompilati. Per il dettato usa anche la nuova cattura vocale guidata.</p>
        </div>
      </section>

      <section className="panel-card page-section-card">
        <div className="panel-head">
          <div>
            <h2>Nuovo follow-up veloce</h2>
            <p>Usa un URL tipo <code>/capture/followup?title=Richiama%20cliente</code> dal tuo shortcut.</p>
          </div>
        </div>
        <form action={createFollowup} className="sheet-form inline-shortcut-form">
          <div className="form-grid two-col">
            <label className="field-stack"><span>Titolo</span><input className="field-control" name="title" defaultValue={title} required /></label>
            <label className="field-stack"><span>Scadenza</span><input className="field-control" name="due_at" type="datetime-local" defaultValue={plusOneHourLocalInput()} required /></label>
            <label className="field-stack"><span>Priorità</span><select className="field-control" name="priority" defaultValue={priority}><option value="low">Bassa</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
            <label className="field-stack"><span>Stato</span><select className="field-control" name="status" defaultValue="pending"><option value="pending">Da fare</option><option value="in_progress">In corso</option></select></label>
          </div>
          <label className="field-stack"><span>Descrizione</span><textarea className="field-control field-area" name="description" defaultValue={description} /></label>
          <div className="sheet-actions">
            <button className="primary-button" type="submit">Salva follow-up</button>
            <a href="/capture/voice" className="secondary-button">Apri cattura vocale</a>
            <a href="/followups" className="ghost-button">Apri agenda</a>
          </div>
        </form>
      </section>
    </div>
  )
}
