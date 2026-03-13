import { request } from "../api/client";
import type {
  ParticipantCreate,
  ParticipantRead,
  ParticipantUpdate,
} from "../types/api";

export function getParticipants(): Promise<ParticipantRead[]> {
  return request<ParticipantRead[]>("/participants");
}

export function getParticipant(id: string): Promise<ParticipantRead> {
  return request<ParticipantRead>(`/participants/${id}`);
}

export function createParticipant(
  data: ParticipantCreate,
): Promise<ParticipantRead> {
  return request<ParticipantRead>("/participants", { method: "POST", body: data });
}

export function updateParticipant(
  id: string,
  data: ParticipantUpdate,
): Promise<ParticipantRead> {
  return request<ParticipantRead>(`/participants/${id}`, {
    method: "PUT",
    body: data,
  });
}

export function deleteParticipant(id: string): Promise<void> {
  return request<void>(`/participants/${id}`, { method: "DELETE" });
}
