import React from 'react';
import { PhoneCall, Sparkles, ShieldCheck, Clock, Users, ArrowUpRight } from 'lucide-react';
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
    "Check Dr. Jenkins' slots tomorrow",
    "Book with Dr. Emily Chen",
    "Cancel appointment APT-7821"
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl mb-8">
      {/* Ambient gradient glow in background */}
      <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        
        {/* Left Column: Clinic Value Proposition */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Apex Health Voice AI Receptionist • Clara</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Schedule Doctor Appointments <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              By Speaking Naturally in Real-Time
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            No logins, forms, or hold queues. Speak directly to Clara to check specialist availability, 
            confirm consultation slots using your spoken phone number, or manage cancellations in seconds.
          </p>

          {/* Key Value Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Spoken Phone Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Sub-Second Response Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>5 Board-Certified Specialists</span>
            </div>
          </div>

          {/* Quick Spoken Prompts */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Try asking Clara:</span>
            {quickActions.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectPrompt?.(prompt);
                  if (callState === 'idle') onStartCall();
                }}
                className="text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white px-3 py-1 rounded-lg border border-slate-700/60 transition flex items-center gap-1"
              >
                <span>"{prompt}"</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Clara Call Card CTA */}
        <div className="flex flex-col items-center sm:items-start lg:items-center">
          <div className="relative group">
            {/* Pulsing ring around avatar */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500 animate-pulse" />
            
            <div className="relative bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 w-72 sm:w-80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={CLARA_AVATAR}
                    alt="Clara Receptionist"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Clara</h3>
                  <p className="text-xs text-emerald-400 font-medium">Apex Health AI Receptionist</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pipecat + ElevenLabs + Gemini</p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Voice Status:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Available Now
                  </span>
                </div>

                <button
                  onClick={onStartCall}
                  disabled={callState === 'connected' || callState === 'ringing'}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2"
                >
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>
                    {callState === 'connected' ? 'Call in Progress...' : 'Start Voice Call with Clara'}
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
