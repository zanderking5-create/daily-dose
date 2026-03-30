export default function BriefingSkeleton() {
  return (
    <div className="card p-5" style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(45,42,38,0.06)',
      border: '1px solid #E8E4DF'
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-3 w-24" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
          <div className="skeleton h-3 w-20 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4 mb-2" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      ))}
      <div className="pt-4">
        <div className="skeleton h-3 w-28 mb-3" />
        <div className="skeleton h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}
