import React from 'react';
import { UserCheck, Clock, MapPin, Star } from 'lucide-react';
import type { Doctor } from '../types';

interface DoctorsListProps {
  doctors: Doctor[];
  onSelectSlot?: (doctorName: string, date: string, timeSlot: string) => void;
}

export const DoctorsList: React.FC<DoctorsListProps> = ({ doctors, onSelectSlot }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Clinic Doctors & Available Slots</h2>
        </div>
        <span className="text-xs text-slate-400">
          {doctors.length} Doctors on duty
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {doctors.map((doc) => {
          const openSlots = doc.upcoming_slots ? doc.upcoming_slots.filter(s => s.is_booked === 0) : [];
          return (
            <div key={doc.id} className="p-4 hover:bg-slate-850/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{doc.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                      {doc.specialty}
                    </span>
                    <div className="flex items-center text-[11px] text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{doc.bio}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {doc.room_number}
                    </span>
                    <span>•</span>
                    <span>{doc.department}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 sm:text-right">
                  <span className="font-semibold text-emerald-400">{openSlots.length}</span> open slots
                </div>
              </div>

              {/* Slots Row */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium mr-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Open Slots:
                </span>
                {doc.upcoming_slots && doc.upcoming_slots.length > 0 ? (
                  doc.upcoming_slots.slice(0, 6).map((slot) => {
                    const isBooked = slot.is_booked === 1;
                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked}
                        onClick={() => onSelectSlot?.(doc.name, slot.date, slot.time_slot)}
                        className={`text-[10px] px-2 py-1 rounded-md border font-mono transition ${
                          isBooked
                            ? 'bg-slate-800/60 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                            : 'bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60'
                        }`}
                        title={isBooked ? 'Slot already booked' : `${slot.date} at ${slot.time_slot}`}
                      >
                        {slot.time_slot}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-[11px] text-slate-600 italic">No open slots</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
