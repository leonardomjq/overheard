export default function AlphaDetailLoading() {
  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <div className="h-4 w-28 bg-surface-elevated rounded animate-pulse mb-4" />

      <div className="space-y-6">
        {/* Category + badge */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-3 w-28 bg-surface-elevated rounded animate-pulse" />
            <div className="h-5 w-14 bg-surface-elevated rounded-full animate-pulse" />
          </div>
          {/* Title */}
          <div className="h-8 w-2/3 bg-surface-elevated rounded animate-pulse" />
        </div>

        {/* Entity chips */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 bg-surface-elevated rounded animate-pulse"
            />
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse mb-2" />
              <div className="h-7 w-12 bg-surface-elevated rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content sections */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-5 w-24 bg-surface-elevated rounded animate-pulse mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-surface-elevated rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
