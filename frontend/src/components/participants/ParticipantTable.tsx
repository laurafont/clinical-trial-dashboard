import type {
  ParticipantRead,
  ParticipantStatus,
  StudyGroup,
} from "../../types/api";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/** Formats an ISO date string ("YYYY-MM-DD") as a locale-aware date, e.g. "Jan 15, 2024". */
function formatDate(iso: string): string {
  // Parse as UTC noon to avoid timezone-offset shifting the day.
  const date = new Date(`${iso}T12:00:00Z`);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function StudyGroupBadge({ value }: { value: StudyGroup }) {
  return (
    <Badge variant={value === "treatment" ? "default" : "secondary"}>
      {value}
    </Badge>
  );
}

function StatusBadge({ value }: { value: ParticipantStatus }) {
  const variant =
    value === "active"
      ? "default"
      : value === "completed"
        ? "secondary"
        : "destructive";
  return <Badge variant={variant}>{value}</Badge>;
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-md bg-muted"
          data-slot="table-skeleton"
        />
      ))}
    </div>
  );
}

interface ParticipantTableProps {
  participants: ParticipantRead[];
  loading?: boolean;
}

export function ParticipantTable({
  participants,
  loading,
}: ParticipantTableProps) {
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject ID</TableHead>
          <TableHead>Study Group</TableHead>
          <TableHead>Enrollment Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Gender</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              No participants yet.
            </TableCell>
          </TableRow>
        ) : (
          participants.map((p) => (
            <TableRow key={p.participant_id}>
              <TableCell>{p.subject_id}</TableCell>
              <TableCell>
                <StudyGroupBadge value={p.study_group} />
              </TableCell>
              <TableCell>{formatDate(p.enrollment_date)}</TableCell>
              <TableCell>
                <StatusBadge value={p.status} />
              </TableCell>
              <TableCell>{p.age}</TableCell>
              <TableCell>{p.gender}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
