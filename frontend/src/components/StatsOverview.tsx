import React from 'react';
import { UserCheck, Clock, CalendarCheck, Zap } from 'lucide-react';
import type { Doctor, Appointment } from '../types';

interface StatsOverviewProps {
  doctors: Doctor[];
  appointments: Appointment[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ doctors, appointments }) => {
  const totalSlots = doctors.reduce((acc, doc) => {
    return acc + (doc.upcoming_slots ? doc.upcoming_slots.filter(s => s.is_booked === 0).length : 0);
  }, 0);

  const activeBookings = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledBookings = appointments.filter(a => a.status === 'cancelled').length;

  const stats = [
    {
      title: 'Active Doctors',
      value: doctors.length.toString(),
      subtext: '5 medical specialties',
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Available Open Slots',
      value: totalSlots.toString(),
      subtext: 'Next 7 days schedule',
      icon: Clock,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Confirmed Appointments',
      value: activeBookings.toString(),
      subtext: `${cancelledBookings} cancelled`,
      icon: CalendarCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Voice AI Latency',
      value: '< 450ms',
      subtext: 'Silero VAD + Pipecat Turn',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
              <h3 className="text-xl font-bold text-white mt-1">{stat.value}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
