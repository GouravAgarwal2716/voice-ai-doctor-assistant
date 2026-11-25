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
  PhoneCall,
  Award
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
    { key: 'all', label: 'All Specialties', icon: UserCheck, activeStyle: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white' },
    { key: 'cardiology', label: 'Cardiology', icon: Heart, activeStyle: 'bg-rose-500 text-white shadow-rose-500/30' },
    { key: 'dermatology', label: 'Dermatology', icon: Sparkles, activeStyle: 'bg-amber-500 text-slate-950 shadow-amber-500/30' },
    { key: 'pediatrics', label: 'Pediatrics', icon: Baby, activeStyle: 'bg-teal-500 text-slate-950 shadow-teal-500/30' },
    { key: 'orthopedics', label: 'Orthopedics', icon: Activity, activeStyle: 'bg-blue-600 text-white shadow-blue-500/30' },
    { key: 'neurology', label: 'Neurology', icon: Brain, activeStyle: 'bg-purple-600 text-white shadow-purple-500/30' },
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
    <div className="bg-[#0A0F1E]/95 border border-indigo-500/20 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-6 sm:px-8 py-6 border-b border-slate-800/80 bg-[#070B14]/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-orange-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Clinical Specialists Directory</h2>
              <p className="text-xs text-slate-400">Review doctor schedules and book instantly via Clara</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search physician, specialty, or condition..."
            className="w-full bg-[#121A2F] text-xs text-white pl-10 pr-4 py-2.5 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
          />
        </div>
      </div>

      {/* Specialty Filter Tabs */}
      <div className="px-6 sm:px-8 py-3.5 border-b border-slate-800/80 bg-[#060912]/80 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
        {departments.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDept === dept.key;
          return (
            <button
              key={dept.key}
              onClick={() => setSelectedDept(dept.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition duration-200 cursor-pointer ${
                isSelected
                  ? `${dept.activeStyle} shadow-lg scale-102`
                  : 'bg-slate-850/70 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{dept.label}</span>
            </button>
          );
        })}
      </div>

      {/* Doctors Grid / List */}
      <div className="divide-y divide-slate-800/60">
        {filteredDoctors.length === 0 ? (
          <div className="p-14 text-center text-slate-500">
            <UserCheck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-400">No specialists found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-600 mt-1">Try selecting another specialty tab above</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => {
            const meta = DOCTOR_METAS[doc.name] || {
              avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
              experience: "10+ Years",
              education: "Board Certified Physician",
              department_key: "cardiology",
              color: "from-rose-500 to-amber-500",
              badge: doc.specialty
            };

            const openSlots = doc.upcoming_slots ? doc.upcoming_slots.filter((s) => s.is_booked === 0) : [];

            return (
              <div key={doc.id} className="p-6 sm:p-7 hover:bg-[#11192F]/50 transition duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  
                  {/* Doctor Info Section */}
                  <div className="flex items-start space-x-4 sm:space-x-5">
                    {/* Doctor Photo */}
                    <div className="relative shrink-0">
                      <img
                        src={meta.avatar_url}
                        alt={doc.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-700 shadow-xl"
                      />
                      <span className="absolute -bottom-1 -right-1 p-1.5 bg-[#0A0F1E] rounded-full border border-slate-700 shadow-md">
                        <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-extrabold text-white tracking-tight">{doc.name}</h3>
                        <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-lg">
                          {doc.specialty}
                        </span>
                        <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
                          {meta.experience}
                        </span>
                        <div className="flex items-center text-xs text-amber-300 font-bold ml-auto sm:ml-0 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                          <span>{doc.rating.toFixed(2)}</span>
                          <span className="text-slate-400 text-[10px] font-normal ml-1">(140+ reviews)</span>
                        </div>
                      </div>

                      <p className="text-xs text-rose-300 font-semibold mt-1">{meta.education}</p>
                      <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">{doc.bio}</p>

                      <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-400 mt-3 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" /> Room {doc.room_number}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">{doc.department}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{openSlots.length} open consultation slots</span>
                      </div>
                    </div>
                  </div>

                  {/* Book with Clara Button */}
                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => onCallForDoctor?.(doc.name)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500 hover:to-orange-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Book with Clara</span>
                    </button>
                  </div>
                </div>

                {/* Available Slots Bar */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Available Consultation Timings:</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Speak your preferred time to Clara during the call
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
                            className={`group text-xs px-3.5 py-1.5 rounded-xl border font-mono transition duration-200 flex items-center gap-2 ${
                              isBooked
                                ? 'bg-slate-900/80 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                                : 'bg-[#121B32] hover:bg-rose-500 text-slate-200 hover:text-white border-slate-700/80 hover:border-rose-400 shadow-sm cursor-pointer hover:scale-102'
                            }`}
                            title={isBooked ? 'Slot already booked' : `${slot.date} at ${slot.time_slot}`}
                          >
                            <Calendar className="w-3 h-3 text-slate-500 group-hover:text-white" />
                            <span>{slot.time_slot}</span>
                            {!isBooked && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-white" />
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
