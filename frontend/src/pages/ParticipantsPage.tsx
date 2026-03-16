import { ParticipantTable } from "../components/participants/ParticipantTable";
import { useParticipants } from "../hooks/useParticipants";

export default function ParticipantsPage() {
  const { participants, loading, error } = useParticipants();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Participants</h1>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <ParticipantTable participants={participants} loading={loading} />
    </div>
  );
}
