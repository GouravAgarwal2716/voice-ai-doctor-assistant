import React, { useState } from 'react';
import {
  UserCheck,
  Clock,
  MapPin,
  Star,
  Search,
  Heart,
  Sparkles,
  Baby,
  Activity,
  Brain,
  Calendar,
  CheckCircle,
  PhoneCall
} from 'lucide-react';
import type { Doctor } from '../types';
import { DOCTOR_METAS } from '../constants/doctorAssets';

interface DoctorsListProps {
  doctors: Doctor[];
  onSelectSlot?: (doctorName: string, date: string, timeSlot: string) => void;
  onCallForDoctor?: (doctorName: string) => void;
}

export const DoctorsList: React.FC<DoctorsListProps> = ({
  doctors,
  onSelectSlot,
  onCallForDoctor
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = [
    { key: 'all', label: 'All Specialties', icon: UserCheck },
    { key: 'cardiology', label: 'Cardiology', icon: Heart },
    { key: 'dermatology', label: 'Dermatology', icon: Sparkles },
    { key: 'pediatrics', label: 'Pediatrics', icon: Baby },
    { key: 'orthopedics', label: 'Orthopedics', icon: Activity },
    { key: 'neurology', label: 'Neurology', icon: Brain },
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const meta = DOCTOR_METAS[doc.name];
    const matchesDept =
      selectedDept === 'all' ? true : meta?.department_key === selectedDept;

    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Specialist Medical Directory</h2>
              <p className="text-xs text-slate-400">Check live schedule and book via voice call</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by physician, specialty, or condition..."
            className="w-full bg-slate-800/80 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Specialty Filter Tabs */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {departments.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDept === dept.key;
          return (
            <button
              key={dept.key}
              onClick={() => setSelectedDept(dept.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>

      {/* Doctors Grid / List */}
      <div className="divide-y divide-slate-800/80">
        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">No doctors found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-600 mt-1">Try searching for a department like Cardiology or Pediatrics</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => {
            const meta = DOCTOR_METAS[doc.name] || {
              avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
              experience: "10+ Years",
              education: "Board Certified Physician",
              department_key: "cardiology",
              color: "from-emerald-500 to-teal-600",
              badge: doc.specialty
            };

            const openSlots = doc.upcoming_slots ? doc.upcoming_slots.filter((s) => s.is_booked === 0) : [];

            return (
              <div key={doc.id} className="p-6 hover:bg-slate-850/40 transition">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  
                  {/* Doctor Info Section */}
                  <div className="flex items-start space-x-4">
                    {/* Doctor Photo */}
                    <div className="relative shrink-0">
                      <img
                        src={meta.avatar_url}
                        alt={doc.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-lg"
                      />
                      <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{doc.name}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                          {doc.specialty}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                          {meta.experience}
                        </span>
                        <div className="flex items-center text-xs text-amber-400 font-semibold ml-auto sm:ml-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                          <span>{doc.rating.toFixed(2)}</span>
                          <span className="text-slate-500 text-[11px] font-normal ml-1">(120+ reviews)</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-medium mt-1">{meta.education}</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{doc.bio}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2.5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Room {doc.room_number}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{doc.department}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{openSlots.length} available slots</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button for Doctor */}
                  <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2">
                    <button
                      onClick={() => onCallForDoctor?.(doc.name)}
                      className="px-4 py-2 bg-slate-800 hover:bg-emerald-600/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      title={`Open voice call with Clara to book with ${doc.name}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Book with Clara</span>
                    </button>
                  </div>
                </div>

                {/* Available Slots Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upcoming Consultation Slots:</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Click any slot or tell Clara your preferred time
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {doc.upcoming_slots && doc.upcoming_slots.length > 0 ? (
                      doc.upcoming_slots.slice(0, 8).map((slot) => {
                        const isBooked = slot.is_booked === 1;
                        return (
                          <button
                            key={slot.id}
                            disabled={isBooked}
                            onClick={() => onSelectSlot?.(doc.name, slot.date, slot.time_slot)}
                            className={`group relative text-xs px-3 py-1.5 rounded-xl border font-mono transition flex items-center gap-1.5 ${
                              isBooked
                                ? 'bg-slate-900/60 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                                : 'bg-slate-800/80 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border-slate-700 hover:border-emerald-500/50 shadow-sm cursor-pointer'
                            }`}
                            title={isBooked ? 'Slot already booked' : `${slot.date} at ${slot.time_slot}`}
                          >
                            <Calendar className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                            <span>{slot.time_slot}</span>
                            {!isBooked && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-500 italic">No available slots this week</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
