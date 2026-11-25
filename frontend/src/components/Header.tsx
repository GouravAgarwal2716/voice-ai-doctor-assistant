import React, { useState, useEffect } from 'react';
import { PhoneCall, RefreshCw, Sparkles, Activity, ShieldCheck, Clock } from 'lucide-react';
import type { HealthInfo, CallState } from '../types';

interface HeaderProps {
  health: HealthInfo | null;
  callState: CallState;
  onStartCall: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  callState,
  onStartCall,
  onResetData,
  isResetting,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070B14]/85 border-b border-indigo-500/15 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Clinic Identity */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            {/* Custom Logo Badge: Multi-Tone Violet & Coral Radiant Pulse */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-rose-500 to-amber-400 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#121A2F] to-[#0A0E1A] border border-white/20 flex items-center justify-center shadow-xl">
                <Activity className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  APEX<span className="bg-gradient-to-r from-rose-400 via-amber-300 to-teal-300 bg-clip-text text-transparent">HEALTH</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-violet-500/20 to-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  Voice Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Apex Medical Center • Real-Time AI Scheduling
              </p>
            </div>
          </div>

          {/* Mobile Start Call Button */}
          <div className="md:hidden">
            <button
              onClick={onStartCall}
              disabled={callState === 'connected' || callState === 'ringing'}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {callState === 'connected' ? 'In Call' : 'Call AI'}
            </button>
          </div>
        </div>

        {/* Center Live Status Strip (Desktop) */}
        <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-900/90 border border-slate-800/80 px-4 py-1.5 rounded-full shadow-inner">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Live Clinical AI</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300">{timeStr}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Spoken Phone Auth</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
            {health?.llm_model || 'gemini-3.5-flash-lite'} (<span className="text-emerald-400">&lt;0.8s</span>)
          </span>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Reset Demo Button */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 rounded-xl transition shadow-sm"
            title="Reset clinic database to original seed state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          {/* Primary Call Action: Vibrant Sunset Coral to Electric Violet Gradient */}
          <button
            onClick={onStartCall}
            disabled={callState === 'connected' || callState === 'ringing'}
            className="group relative inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-300 shadow-xl overflow-hidden disabled:opacity-60 cursor-pointer active:scale-95"
          >
            {/* Pulsing Gradient Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 group-hover:from-rose-400 group-hover:to-amber-400 transition" />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition duration-1000" />
            
            <span className="relative flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="tracking-wide">
                {callState === 'connected' ? 'Call in Progress...' : 'Start Voice Call with Clara'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
