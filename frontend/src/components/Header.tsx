import React, { useState, useEffect } from 'react';
import { PhoneCall, RefreshCw, Clock, PlusCircle } from 'lucide-react';
import type { CallState, HealthInfo } from '../types';

interface HeaderProps {
  health?: HealthInfo | null;
  callState: CallState;
  onStartCall: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  callState,
  onStartCall,
  onResetData,
  isResetting,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080D1A]/90 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Clinic Identity */}
        <div className="flex items-center space-x-3.5">
          {/* Medical Shield Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-teal-400 shadow-sm">
            <PlusCircle className="w-5 h-5 text-teal-400 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white font-sans">
                Apex<span className="text-teal-400">Health</span>
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60">
                Medical Center
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Ambulatory Care & Specialist Scheduling
            </p>
          </div>
        </div>

        {/* Center: Live Center Time Only */}
        <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full text-slate-300">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-mono font-medium text-white">{timeStr}</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Reception Desk Open
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Reset clinic database to original seed state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Single Clean Call Action */}
          <button
            onClick={onStartCall}
            disabled={callState === 'connected' || callState === 'ringing'}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>{callState === 'connected' ? 'In Call...' : 'Call Reception'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
