import type { Doctor, Appointment, HealthInfo } from '../types';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  async getHealth(): Promise<HealthInfo> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health status');
    return res.json();
  },

  async getDoctors(): Promise<Doctor[]> {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-data`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  async bookAppointment(data: {
    patient_phone: string;
    doctor_name: string;
    date_str: string;
    time_slot: string;
    patient_name?: string;
  }) {
    const res = await fetch(`${API_BASE}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async cancelAppointment(data: {
    patient_phone: string;
    appointment_id_or_date?: string;
  }) {
    const res = await fetch(`${API_BASE}/appointments/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};
