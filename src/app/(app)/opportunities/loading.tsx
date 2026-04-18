export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="page-card hero-card">
        <div className="skeleton-line" style={{ width: 120 }} />
        <div className="skeleton-line" style={{ width: '52%', marginTop: 14, height: 28 }} />
        <div className="skeleton-line" style={{ width: '76%', marginTop: 14 }} />
      </div>
      <div className="loading-grid">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    </div>
  )
}
