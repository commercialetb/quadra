export function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(value));
}
