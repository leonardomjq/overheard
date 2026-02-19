export default function SettingsLoading() {
  return (
    <div className="max-w-2xl">
      {/* Heading */}
      <div className="h-8 w-28 bg-surface-elevated rounded animate-pulse mb-6" />

      {/* Account card */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="h-5 w-20 bg-surface-elevated rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-12 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-40 bg-surface-elevated rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-8 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-12 bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="h-5 w-28 bg-surface-elevated rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-surface-elevated rounded animate-pulse" />
          <div className="h-10 w-36 bg-surface-elevated rounded animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}
