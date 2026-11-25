import React, { useState } from 'react';
import { Mic, Sparkles, Calendar, Phone, CheckCircle2 } from 'lucide-react';
import type { CallState } from '../types';

interface InteractiveVoiceBarProps {
  callState: CallState;
  onStartCall: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const InteractiveVoiceBar: React.FC<InteractiveVoiceBarProps> = ({
  callState,
  onStartCall,
  onSelectPrompt
}) => {
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);

  const smartIntents = [
    {
      category: 'schedule',
      label: 'Check Available Slots',
      prompt: "What slots does Dr. Jenkins have available tomorrow?",
      icon: Calendar,
      tag: "Cardiology"
    },
    {
      category: 'schedule',
      label: 'Book Consultation',
      prompt: "I want to book an appointment with Dr. Emily Chen for tomorrow at 10:30 AM",
      icon: CheckCircle2,
      tag: "Pediatrics"
    },
    {
      category: 'cancel',
      label: 'Cancel or Modify Visit',
      prompt: "I need to cancel my appointment code APT-7821",
      icon: Phone,
      tag: "Cancellation"
    },
    {
      category: 'doctors',
      label: 'Find Dermatologist',
      prompt: "Is Dr. Marcus Vance available this week?",
      icon: Sparkles,
      tag: "Dermatology"
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0C1326] via-[#090E1D] to-[#121A30] border border-slate-700/80 shadow-2xl p-6 sm:p-8 mb-8">
      {/* Background Animated Gradient Aura */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Side: Voice AI Interactive Hub */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Interactive Voice Reception Desk</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Speak Your Appointment Request <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-200">
              Zero Forms. No Waiting on Hold.
            </span>
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Our autonomous AI receptionist Clara coordinates schedules across all 5 clinical departments. 
            Just state your doctor or preferred date, and verify your phone number verbally to secure your booking.
          </p>

          {/* Smart Voice Intent Trigger Cards */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {smartIntents.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onMouseEnter={() => setHoveredPrompt(item.prompt)}
                  onMouseLeave={() => setHoveredPrompt(null)}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-750 hover:border-teal-500/50 transition-all duration-200 text-left flex items-start space-x-3 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-teal-500/20 text-teal-400 transition shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-teal-300 transition truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                      "{item.prompt}"
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3D Animated Soundwave Sphere Orb */}
        <div className="flex flex-col items-center justify-center lg:pr-4">
          <div className="relative group cursor-pointer" onClick={onStartCall}>
            {/* Multi-Layer Pulsing Soundwave Rings */}
            <div className="absolute -inset-4 rounded-full bg-teal-500/20 blur-xl animate-pulse" />
            <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-2xl animate-spin-slow opacity-60" />

            {/* Main Interactive Sphere Button */}
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-slate-900 via-[#101C38] to-[#17254A] border-2 border-teal-400/40 p-1 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-teal-400">
              
              {/* Dynamic Equalizer Rings */}
              <div className="flex items-center space-x-1 mb-2">
                <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-8 bg-amber-300 rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-extrabold text-white tracking-wide">
                <Mic className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>{callState === 'connected' ? 'In Call' : 'Start Call'}</span>
              </div>

              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Click to Speak</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            {hoveredPrompt ? (
              <span className="text-teal-300 font-medium animate-fade-in">Click to say: "{hoveredPrompt}"</span>
            ) : (
              <span>Or click any physician card below to view specific open slots</span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};
