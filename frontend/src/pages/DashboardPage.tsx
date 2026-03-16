import { DashboardCharts } from "../components/dashboard/DashboardCharts";
import { DashboardMetricCards } from "../components/dashboard/DashboardMetricCards";
import { useParticipants } from "../hooks/useParticipants";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export default function DashboardPage() {
  const { participants, loading, error } = useParticipants();
  const metrics = useDashboardMetrics(participants);

  const body = error ? (
    <p className="text-sm text-destructive" role="alert">
      {error}
    </p>
  ) : loading ? (
    <p className="text-muted-foreground">Loading metrics…</p>
  ) : (
    <>
      <DashboardMetricCards metrics={metrics} />
      <div className="space-y-4">
        <DashboardCharts metrics={metrics} />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {body}
    </div>
  );
}
