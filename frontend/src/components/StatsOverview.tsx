import React from 'react';
import { Users, CalendarCheck, Clock, Zap } from 'lucide-react';
import type { Doctor, Appointment } from '../types';

interface StatsOverviewProps {
  doctors: Doctor[];
  appointments: Appointment[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ doctors, appointments }) => {
  const totalOpenSlots = doctors.reduce((acc, doc) => {
    const freeSlots = doc.upcoming_slots ? doc.upcoming_slots.filter((s) => s.is_booked === 0).length : 0;
    return acc + freeSlots;
  }, 0);

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  const stats = [
    {
      label: 'Specialists On Duty',
      value: doctors.length.toString(),
      subtext: '5 Department Heads Active',
      icon: Users,
      gradient: 'from-violet-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-violet-500/30 hover:border-violet-500/60',
      iconBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      accentText: 'text-violet-400'
    },
    {
      label: 'Available Time Slots',
      value: totalOpenSlots.toString(),
      subtext: 'Next 7 Days Real-Time',
      icon: Clock,
      gradient: 'from-rose-600/20 via-orange-600/10 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60',
      iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      accentText: 'text-rose-400'
    },
    {
      label: 'Confirmed Appointments',
      value: confirmedCount.toString(),
      subtext: 'Synchronized with DB',
      icon: CalendarCheck,
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentText: 'text-emerald-400'
    },
    {
      label: 'Average Voice Turnaround',
      value: '0.7s',
      subtext: 'Sub-Second Voice Latency',
      icon: Zap,
      gradient: 'from-amber-600/20 via-yellow-600/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accentText: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} bg-[#0A0F1E]/95 border ${stat.borderColor} rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2.5 rounded-2xl border ${stat.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stat.value}</div>
            <div className={`text-xs mt-1.5 font-medium ${stat.accentText}`}>{stat.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
