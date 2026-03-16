import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardMetrics } from "../../hooks/useDashboardMetrics";
import { MetricCard } from "./MetricCard";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];

interface DashboardChartsProps {
  metrics: DashboardMetrics;
}

const statusData = (m: DashboardMetrics) => [
  { name: "Active", count: m.activeCount },
  { name: "Completed", count: m.completedCount },
  { name: "Withdrawn", count: m.withdrawnCount },
];

const genderData = (m: DashboardMetrics) => [
  { name: "Female", value: m.genderBreakdown.F },
  { name: "Male", value: m.genderBreakdown.M },
  { name: "Other", value: m.genderBreakdown.Other },
];

function ChartContainer({
  height = 200,
  children,
}: {
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardCharts({ metrics }: DashboardChartsProps) {
  const status = statusData(metrics);
  const gender = genderData(metrics);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <MetricCard title="Study group">
          <ChartContainer>
            <BarChart
                data={[
                  { name: "Treatment", count: metrics.treatmentCount },
                  { name: "Control", count: metrics.controlCount },
                ]}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </MetricCard>
        <MetricCard title="Status">
          <ChartContainer>
            <BarChart
                data={status}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {status.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Bar>
            </BarChart>
          </ChartContainer>
        </MetricCard>
      </div>

      <MetricCard title="Gender breakdown">
        <ChartContainer height={240}>
          <PieChart>
              <Pie
                data={gender}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : null)}
              >
                {gender.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
          </PieChart>
        </ChartContainer>
      </MetricCard>
    </>
  );
}
