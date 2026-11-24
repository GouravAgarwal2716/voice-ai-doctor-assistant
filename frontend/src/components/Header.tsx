import React from 'react';
import { Stethoscope, PhoneCall, RefreshCw } from 'lucide-react';
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
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Apex Health</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Voice AI Reception
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Real-Time Doctor Booking Assistant (Pipecat + ElevenLabs + Gemini)
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Health status badge */}
          <div className="hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              Pipeline: <span className="text-emerald-400 font-mono font-medium">Ready</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">{health?.llm_model || 'gemini-2.0-flash'}</span>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition"
            title="Reset database to initial demo state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Try Call / Start Voice Call Button */}
          <button
            onClick={onStartCall}
            disabled={callState === 'connected' || callState === 'ringing'}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition transform active:scale-95 disabled:opacity-60"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>{callState === 'connected' ? 'Call in Progress...' : 'Start Voice Call'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
