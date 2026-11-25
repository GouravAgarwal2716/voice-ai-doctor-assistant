import React from 'react';
import { Users, CalendarCheck, Clock, Zap } from 'lucide-react';
import type { Doctor, Appointment } from '../types';

interface StatsOverviewProps {
  doctors: Doctor[];
  appointments: Appointment[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ doctors, appointments }) => {
  // Count total open slots
  const totalOpenSlots = doctors.reduce((acc, doc) => {
    const freeSlots = doc.upcoming_slots ? doc.upcoming_slots.filter((s) => s.is_booked === 0).length : 0;
    return acc + freeSlots;
  }, 0);

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  const stats = [
    {
      label: 'Specialists On Duty',
      value: doctors.length.toString(),
      subtext: '5 Departments Active',
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      label: 'Available Consultation Slots',
      value: totalOpenSlots.toString(),
      subtext: 'Next 7 Days Real-Time',
      icon: Clock,
      color: 'from-teal-500/20 to-cyan-500/10',
      iconColor: 'text-teal-400',
      borderColor: 'border-teal-500/30'
    },
    {
      label: 'Confirmed Appointments',
      value: confirmedCount.toString(),
      subtext: 'Booked via Voice / Online',
      icon: CalendarCheck,
      color: 'from-cyan-500/20 to-blue-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30'
    },
    {
      label: 'Average AI Turnaround',
      value: '< 0.8s',
      subtext: 'Ultra-Fast Voice Response',
      icon: Zap,
      color: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.color} bg-slate-900/90 border ${stat.borderColor} rounded-2xl p-4 sm:p-5 shadow-sm transition hover:border-emerald-500/50 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${stat.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">{stat.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
