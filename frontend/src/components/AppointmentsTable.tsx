import React, { useState } from 'react';
import {
  CalendarCheck,
  Phone,
  XCircle,
  Search,
  Calendar,
  Clock,
  User,
  Copy,
  Check
} from 'lucide-react';
import type { Appointment } from '../types';
import { DOCTOR_METAS } from '../constants/doctorAssets';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Header & Search Filter */}
      <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/95">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Clinical Appointments Ledger</h2>
              <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono border border-slate-700">
                {appointments.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400">Updates live when Clara completes a voice booking or cancellation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, phone, doctor..."
              className="w-48 sm:w-60 bg-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs transition ${
                statusFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1 rounded-lg text-xs transition ${
                statusFilter === 'confirmed' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1 rounded-lg text-xs transition ${
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
          <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-5 font-semibold">Appointment Code</th>
              <th className="py-3 px-5 font-semibold">Caller / Patient</th>
              <th className="py-3 px-5 font-semibold">Consulting Doctor</th>
              <th className="py-3 px-5 font-semibold">Scheduled Date & Time</th>
              <th className="py-3 px-5 font-semibold">Status</th>
              <th className="py-3 px-5 font-semibold">Booking Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <CalendarCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-medium">No appointments found</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Click "Start Voice Call" and speak to Clara to book your first appointment!
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((apt) => {
                const isHighlighted = highlightedCode === apt.appointment_code;
                const docMeta = DOCTOR_METAS[apt.doctor_name];
                const isConfirmed = apt.status === 'confirmed';

                return (
                  <tr
                    key={apt.id}
                    className={`transition duration-300 ${
                      isHighlighted
                        ? highlightType === 'booked'
                          ? 'bg-emerald-500/20 ring-1 ring-emerald-500'
                          : 'bg-rose-500/20 ring-1 ring-rose-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Code */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                          {apt.appointment_code}
                        </span>
                        <button
                          onClick={() => handleCopy(apt.appointment_code)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded transition"
                          title="Copy appointment code"
                        >
                          {copiedCode === apt.appointment_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Patient / Spoken Phone */}
                    <td className="py-3.5 px-5">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.patient_name || 'Caller'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{apt.patient_phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor with Avatar */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        {docMeta?.avatar_url ? (
                          <img
                            src={docMeta.avatar_url}
                            alt={apt.doctor_name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                            {apt.doctor_name[4]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white">{apt.doctor_name}</div>
                          <div className="text-[11px] text-slate-400">{apt.specialty} • {apt.room_number}</div>
                        </div>
                      </div>
                    </td>

                    {/* Scheduled Slot */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{apt.time_slot}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-5">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(apt.created_at).toLocaleString([], {
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
