import React, { useState } from 'react';
import { CalendarCheck, Phone, CheckCircle2, XCircle, Search } from 'lucide-react';
import type { Appointment } from '../types';

interface AppointmentsTableProps {
  appointments: Appointment[];
  highlightedCode?: string | null;
  highlightType?: 'booked' | 'cancelled' | null;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  highlightedCode,
  highlightType
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.appointment_code.toLowerCase().includes(search.toLowerCase()) ||
      apt.patient_phone.includes(search) ||
      apt.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      apt.patient_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Table Header & Search Filter */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/95">
        <div className="flex items-center space-x-2">
          <CalendarCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Live Appointments Ledger</h2>
          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
            {appointments.length} Total
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone, code, doc..."
              className="w-44 sm:w-56 bg-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                statusFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                statusFilter === 'confirmed' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                statusFilter === 'cancelled' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Code</th>
              <th className="py-2.5 px-4 font-semibold">Caller Phone</th>
              <th className="py-2.5 px-4 font-semibold">Doctor & Specialty</th>
              <th className="py-2.5 px-4 font-semibold">Scheduled Slot</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold">Logged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                  No appointments match the filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const isTarget = highlightedCode === apt.appointment_code;
                const highlightClass = isTarget
                  ? highlightType === 'booked'
                    ? 'row-highlight-booked'
                    : 'row-highlight-cancelled'
                  : '';

                return (
                  <tr
                    key={apt.id}
                    className={`hover:bg-slate-855/50 transition ${highlightClass}`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {apt.appointment_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-white">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{apt.patient_phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{apt.patient_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{apt.doctor_name}</div>
                      <div className="text-[10px] text-slate-400">{apt.specialty} • {apt.room_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{apt.date}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{apt.time_slot}</div>
                    </td>
                    <td className="py-3 px-4">
                      {apt.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3 text-rose-400" /> Cancelled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {new Date(apt.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
