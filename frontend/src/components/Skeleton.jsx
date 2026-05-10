function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton skeleton-text-lg" style={{ width: '200px' }} />
          <div className="skeleton skeleton-text" style={{ width: '300px' }} />
        </div>
        <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: '0.375rem' }} />
      </div>

      {/* Content Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="skeleton skeleton-card">
      <div className="skeleton skeleton-text-lg" style={{ width: '60%', marginBottom: '1rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '100%' }} />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '40%' }} />
    </div>
  )
}

function ListSkeleton({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '0.375rem' }} />
      ))}
    </div>
  )
}

function TextSkeleton({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}

export { PageSkeleton, CardSkeleton, ListSkeleton, TextSkeleton }
