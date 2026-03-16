import type { DashboardMetrics } from "../../hooks/useDashboardMetrics";
import { MetricCard } from "./MetricCard";

function MetricValue({ children }: { children: React.ReactNode }) {
  return <p className="text-2xl font-semibold">{children}</p>;
}

interface DashboardMetricCardsProps {
  metrics: DashboardMetrics;
}

export function DashboardMetricCards({ metrics }: DashboardMetricCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="Total participants">
        <MetricValue>{metrics.total}</MetricValue>
      </MetricCard>
      <MetricCard title="Treatment / Control">
        <MetricValue>
          {metrics.treatmentCount} / {metrics.controlCount}
        </MetricValue>
      </MetricCard>
      <MetricCard title="Active / Completed / Withdrawn">
        <MetricValue>
          {metrics.activeCount} / {metrics.completedCount} /{" "}
          {metrics.withdrawnCount}
        </MetricValue>
      </MetricCard>
      <MetricCard title="Gender">
        <MetricValue>
          F: {metrics.genderBreakdown.F} / M: {metrics.genderBreakdown.M} /{" "}
          Other: {metrics.genderBreakdown.Other}
        </MetricValue>
      </MetricCard>
    </div>
  );
}
