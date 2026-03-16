import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}

export function MetricCard({ title, children }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
