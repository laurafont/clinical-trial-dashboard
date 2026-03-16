import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useParticipants } from "../hooks/useParticipants";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export default function DashboardPage() {
  const { participants, loading, error } = useParticipants();
  const metrics = useDashboardMetrics(participants);

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Loading metrics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Treatment / Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {metrics.treatmentCount} / {metrics.controlCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active / Completed / Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {metrics.activeCount} / {metrics.completedCount} /{" "}
              {metrics.withdrawnCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              F: {metrics.genderBreakdown.F} / M: {metrics.genderBreakdown.M} /{" "}
              Other: {metrics.genderBreakdown.Other}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
