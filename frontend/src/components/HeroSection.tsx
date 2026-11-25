import React from 'react';
import { PhoneCall, Sparkles, ShieldCheck, Users, ArrowUpRight, Zap } from 'lucide-react';
import { CLARA_AVATAR } from '../constants/doctorAssets';
import type { CallState } from '../types';

interface HeroSectionProps {
  callState: CallState;
  onStartCall: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  callState,
  onStartCall,
  onSelectPrompt
}) => {
  const quickActions = [
    { text: "Check Dr. Jenkins' slots tomorrow", highlight: "Cardiology" },
    { text: "Book 10:30 AM with Dr. Emily Chen", highlight: "Pediatrics" },
    { text: "Cancel appointment APT-7821", highlight: "Cancellation" }
  ];

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0D152A] via-[#090E1D] to-[#120D24] border border-violet-500/20 shadow-2xl mb-8">
      {/* Dynamic Ambient Radiant Mesh Orbs */}
      <div className="absolute top-0 right-10 -mt-16 w-96 h-96 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 w-96 h-96 bg-gradient-to-tr from-violet-600/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 py-9 sm:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
        
        {/* Left Column: Clinic Value Proposition */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/15 via-rose-500/15 to-amber-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold mb-5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span className="tracking-wide">Autonomous Clinical Voice Assistant • Clara</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Book Doctor Visits <br />
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-teal-300 bg-clip-text text-transparent">
              In Seconds Over Real Voice Call
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            No endless online forms, tedious app downloads, or waiting on hold. Speak directly to Clara: 
            she verifies specialist schedules, confirms your booking using only your spoken phone number, 
            and updates our clinic calendar in real-time.
          </p>

          {/* Key Value Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Spoken Phone Auth (No OTPs)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>0.7s Voice Turnaround</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200">
              <Users className="w-4 h-4 text-rose-400" />
              <span>5 Department Heads On Duty</span>
            </div>
          </div>

          {/* Quick Spoken Prompts */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-slate-400 font-semibold">Try asking Clara:</span>
            {quickActions.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectPrompt?.(item.text);
                  if (callState === 'idle') onStartCall();
                }}
                className="group text-xs bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-700/70 hover:border-rose-500/50 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>"{item.text}"</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Clara Call Card CTA */}
        <div className="flex flex-col items-center sm:items-start lg:items-center">
          <div className="relative group w-full sm:w-auto">
            {/* Luminous Multi-Color Aura Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600 rounded-[32px] blur-md opacity-40 group-hover:opacity-85 transition duration-500 animate-pulse" />
            
            <div className="relative bg-[#0E1528]/95 border border-white/15 rounded-[28px] p-6 w-full sm:w-80 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={CLARA_AVATAR}
                    alt="Clara Receptionist"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-400/90 shadow-xl"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0E1528] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Clara</h3>
                  <p className="text-xs text-rose-300 font-semibold">Lead Clinical Receptionist</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pipecat + ElevenLabs + Gemini</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-3.5">
                  <span className="font-medium">Voice Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live &amp; Ready
                  </span>
                </div>

                <button
                  onClick={onStartCall}
                  disabled={callState === 'connected' || callState === 'ringing'}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2.5 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>
                    {callState === 'connected' ? 'Call in Progress...' : 'Speak with Clara Now'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
