import { useCallback, useEffect, useState } from "react";

import * as participantService from "../services/participantService";
import type { ParticipantCreate, ParticipantRead } from "../types/api";

export function useParticipants() {
  const [participants, setParticipants] = useState<ParticipantRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await participantService.getParticipants();
      setParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load participants");
    } finally {
      setLoading(false);
    }
  }, []);

  const addParticipant = useCallback(
    async (data: ParticipantCreate) => {
      setError(null);
      try {
        await participantService.createParticipant(data);
        await fetchParticipants();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add participant");
        throw err;
      }
    },
    [fetchParticipants],
  );

  useEffect(() => {
    void fetchParticipants();
  }, [fetchParticipants]);

  return { participants, loading, error, fetchParticipants, addParticipant };
}
