import { AddParticipantForm } from "../components/participants/AddParticipantForm";
import { ParticipantTable } from "../components/participants/ParticipantTable";
import { useParticipants } from "../hooks/useParticipants";

export default function ParticipantsPage() {
  const { participants, loading, error, addParticipant } = useParticipants();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Participants</h1>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <AddParticipantForm addParticipant={addParticipant} />
      <ParticipantTable participants={participants} loading={loading} />
    </div>
  );
}
