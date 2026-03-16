import { useState } from "react";

import { AddParticipantModal } from "../components/participants/AddParticipantModal";
import { ParticipantTable } from "../components/participants/ParticipantTable";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { useParticipants } from "../hooks/useParticipants";

export default function ParticipantsPage() {
  const { participants, loading, error, addParticipant } = useParticipants();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Participants</h1>
        <Button onClick={() => setModalOpen(true)}>Add participant</Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <ParticipantTable participants={participants} loading={loading} />

      <AddParticipantModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        addParticipant={addParticipant}
      />
    </div>
  );
}
