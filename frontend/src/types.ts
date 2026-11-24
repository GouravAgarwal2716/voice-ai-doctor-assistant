export interface Slot {
  id: number;
  doctor_id: number;
  date: string;
  time_slot: string;
  is_booked: number;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  department: string;
  bio: string;
  room_number: string;
  rating: number;
  phone: string;
  upcoming_slots: Slot[];
}

export interface Appointment {
  id: number;
  appointment_code: string;
  patient_phone: string;
  patient_name: string;
  date: string;
  time_slot: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  cancelled_at?: string | null;
  doctor_name: string;
  specialty: string;
  room_number: string;
}

export interface TranscriptItem {
  id: string;
  role: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

export type CallState = 'idle' | 'ringing' | 'connected' | 'ended';

export interface HealthInfo {
  status: string;
  gemini_configured: boolean;
  elevenlabs_configured: boolean;
  llm_model: string;
  voice_id: string;
  db_path: string;
}
