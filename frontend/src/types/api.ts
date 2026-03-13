// Enums — mirror app/domain/enums.py

export type StudyGroup = "treatment" | "control";

export type ParticipantStatus = "active" | "completed" | "withdrawn";

export type Gender = "F" | "M" | "Other";

// Auth

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Participants

export interface ParticipantCreate {
  subject_id: string;
  study_group: StudyGroup;
  enrollment_date: string; // ISO date: YYYY-MM-DD
  status: ParticipantStatus;
  age: number;
  gender: Gender;
}

export interface ParticipantRead extends ParticipantCreate {
  participant_id: string; // UUID
}

export interface ParticipantUpdate {
  subject_id?: string | null;
  study_group?: StudyGroup | null;
  enrollment_date?: string | null;
  status?: ParticipantStatus | null;
  age?: number | null;
  gender?: Gender | null;
}
