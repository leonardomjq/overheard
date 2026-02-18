import { AlphaFeed } from "@/components/alpha-feed";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alpha Feed</h1>
        <p className="text-text-muted text-sm mt-1">
          Real-time venture intelligence from developer discourse
        </p>
      </div>
      <AlphaFeed />
    </div>
  );
}
