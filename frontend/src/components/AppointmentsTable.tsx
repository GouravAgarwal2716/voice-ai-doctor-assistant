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
    <div className="bg-[#0A0F1E]/95 border border-indigo-500/20 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
      {/* Table Header & Search Filter */}
      <div className="px-6 sm:px-8 py-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070B14]/90">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-white tracking-tight">Real-Time Appointments Ledger</h2>
              <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-teal-300 rounded-full font-mono font-bold border border-slate-700">
                {appointments.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400">Updates live when Clara executes voice bookings or cancellations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, phone, doctor..."
              className="w-48 sm:w-64 bg-[#121A2F] text-xs text-white pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-teal-500 transition shadow-inner"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-[#121A2F] rounded-2xl p-1 border border-slate-700/80 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'confirmed' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'cancelled' ? 'bg-rose-500 text-white font-black' : 'text-slate-400 hover:text-white'
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
          <thead className="bg-[#050811] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-6 font-bold">Appointment Code</th>
              <th className="py-3.5 px-6 font-bold">Caller Spoken Phone</th>
              <th className="py-3.5 px-6 font-bold">Consulting Specialist</th>
              <th className="py-3.5 px-6 font-bold">Scheduled Date & Time</th>
              <th className="py-3.5 px-6 font-bold">Status</th>
              <th className="py-3.5 px-6 font-bold">Logged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  <CalendarCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No appointments found</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Click "Start Voice Call with Clara" to make your first appointment!
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
                          ? 'bg-emerald-500/25 ring-2 ring-emerald-400'
                          : 'bg-rose-500/25 ring-2 ring-rose-400'
                        : 'hover:bg-[#11192F]/60'
                    }`}
                  >
                    {/* Code */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                          {apt.appointment_code}
                        </span>
                        <button
                          onClick={() => handleCopy(apt.appointment_code)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition"
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

                    {/* Caller / Spoken Phone */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{apt.patient_name || 'Caller'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold mt-0.5">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{apt.patient_phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor with Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {docMeta?.avatar_url ? (
                          <img
                            src={docMeta.avatar_url}
                            alt={apt.doctor_name}
                            className="w-9 h-9 rounded-2xl object-cover border border-slate-700 shadow-md"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">
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
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-white font-bold">
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
                    <td className="py-4 px-6">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
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
