import { notFound } from 'next/navigation';
import { DetailShell } from '@/components/detail/detail-shell';
import { EntityListCard } from '@/components/detail/entity-list-card';
import { InfoCard, InfoRow } from '@/components/detail/info-card';
import { TimelineCard } from '@/components/detail/timeline-card';
import { getProjectDetail, getTimelineForEntity } from '@/lib/detail-queries';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, notes } = await getProjectDetail(id);
  const timeline = await getTimelineForEntity({ projectId: id });

  if (!project) notFound();

  return (
    <DetailShell title={project.title} subtitle={project.company?.name} backHref="/projects" backLabel="Progetti">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <InfoCard title="Panoramica progetto">
            <InfoRow label="Status" value={project.status} />
            <InfoRow label="Budget" value={project.budget ? `€ ${Number(project.budget).toLocaleString('it-IT')}` : '—'} />
            <InfoRow label="Data inizio" value={project.start_date ? new Date(project.start_date).toLocaleDateString('it-IT') : '—'} />
            <InfoRow label="Data fine" value={project.end_date ? new Date(project.end_date).toLocaleDateString('it-IT') : '—'} />
            <InfoRow label="Manager" value={project.project_manager} />
            <InfoRow label="Priorità" value={project.priority} />
            <InfoRow label="Opportunità origine" value={project.opportunity?.title} />
            <InfoRow label="Descrizione" value={project.description} />
          </InfoCard>

          <TimelineCard items={timeline} />
        </div>

        <div className="space-y-6">
          <EntityListCard
            title="Note recenti"
            empty="Nessuna nota collegata."
            items={notes.map((note) => ({ id: note.id, label: note.title || 'Nota', meta: note.body }))}
          />
        </div>
      </div>
    </DetailShell>
  );
}
