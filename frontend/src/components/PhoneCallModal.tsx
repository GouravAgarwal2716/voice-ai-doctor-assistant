import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  User,
  CheckCircle2,
  X,
  Send,
  Loader2
} from 'lucide-react';
import type { CallState, TranscriptItem } from '../types';
import { AudioWaveform } from './AudioWaveform';

interface PhoneCallModalProps {
  isOpen: boolean;
  callState: CallState;
  duration: number;
  isMuted: boolean;
  agentState: 'idle' | 'listening' | 'speaking' | 'thinking';
  transcripts: TranscriptItem[];
  activeTool: string | null;
  lastConfirmedAppointment: any;
  analyser: AnalyserNode | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onClose: () => void;
  onSendTextInput: (text: string) => void;
}

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  isOpen,
  callState,
  duration,
  isMuted,
  agentState,
  transcripts,
  activeTool,
  lastConfirmedAppointment,
  analyser,
  onEndCall,
  onToggleMute,
  onClose,
  onSendTextInput
}) => {
  const [inputText, setInputText] = useState('');
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, activeTool]);

  if (!isOpen && callState === 'idle') return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendTextInput(inputText.trim());
      setInputText('');
    }
  };

  const quickPrompts = [
    "Check Dr. Jenkins availability tomorrow",
    "My phone number is 9876543210",
    "Yes, that's my number. Book 10:30 AM",
    "Cancel my existing appointment",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md h-[720px] max-h-[92vh] bg-slate-900 border-4 border-slate-700/80 rounded-[44px] shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* Dynamic Island Notch */}
        <div className="w-full pt-3 pb-1 flex justify-center items-center relative z-20 bg-slate-900/90">
          <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center space-x-2 border border-slate-700/50">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          {callState === 'idle' || callState === 'ended' ? (
            <button
              onClick={onClose}
              className="absolute right-4 top-3 text-slate-400 hover:text-white p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* Call Header */}
        <div className="px-6 pt-2 pb-3 text-center border-b border-slate-800 bg-slate-900/95 flex-shrink-0">
          <div className="relative inline-block mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            {agentState === 'speaking' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">Clara</h3>
          <p className="text-xs text-emerald-400 font-medium">Apex Health AI Receptionist</p>

          <div className="mt-1 flex items-center justify-center space-x-2 text-xs text-slate-400">
            {callState === 'ringing' && (
              <span className="text-amber-400 animate-pulse flex items-center gap-1 font-semibold">
                <Phone className="w-3.5 h-3.5 animate-bounce" /> Connecting call...
              </span>
            )}
            {callState === 'connected' && (
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-300 font-bold tracking-wider">{formatTimer(duration)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 capitalize">{agentState}</span>
              </div>
            )}
            {callState === 'ended' && (
              <span className="text-rose-400 font-medium">Call Ended ({formatTimer(duration)})</span>
            )}
          </div>
        </div>

        {/* Audio Waveform */}
        <div className="px-6 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-center flex-shrink-0">
          <AudioWaveform
            analyser={analyser}
            isActive={callState === 'connected'}
            barColor={agentState === 'speaking' ? '#10b981' : '#38bdf8'}
            className="h-10 w-48"
          />
        </div>

        {/* Active Tool Badge */}
        {activeTool && (
          <div className="mx-4 mt-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Executing: <strong className="font-mono text-white">{activeTool}</strong></span>
          </div>
        )}

        {/* Transcript Area */}
        <div
          ref={transcriptScrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 text-sm scroll-smooth bg-gradient-to-b from-slate-900 to-slate-950"
        >
          {transcripts.length === 0 && callState === 'connected' && (
            <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-emerald-500/50 mb-2 animate-pulse" />
              Speak into your microphone or choose a quick prompt below
            </div>
          )}

          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${t.role === 'caller' ? 'items-end' : 'items-start'} animate-slide-up`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t.role === 'caller' ? 'You (Caller)' : 'Clara (AI)'}
                </span>
                <span className="text-[10px] text-slate-500">{t.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  t.role === 'caller'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60 shadow-sm'
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}

          {/* In-Call Confirmation Card */}
          {lastConfirmedAppointment && (
            <div className="my-3 p-3.5 bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {lastConfirmedAppointment.is_cancelled ? 'Appointment Cancelled' : 'Booking Confirmed!'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Code:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {lastConfirmedAppointment.appointment_code}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Doctor:</span>
                  <span className="font-semibold text-white truncate block">
                    {lastConfirmedAppointment.doctor_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date & Time:</span>
                  <span className="text-white">
                    {lastConfirmedAppointment.date} {lastConfirmedAppointment.time_slot}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Patient Phone:</span>
                  <span className="font-mono text-white">
                    {lastConfirmedAppointment.patient_phone}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Voice Suggestions */}
        {callState === 'connected' && (
          <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800/80 flex-shrink-0">
            <div className="text-[10px] text-slate-400 mb-1 font-medium">Quick Voice Suggestions:</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendTextInput(q)}
                  className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 text-[10px] transition"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Fallback Form */}
        {callState === 'connected' && (
          <form onSubmit={handleSend} className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type a spoken message..."
              className="flex-1 bg-slate-900 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Dock Controls */}
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-around flex-shrink-0">
          {callState === 'connected' ? (
            <>
              <button
                onClick={onToggleMute}
                className={`p-3.5 rounded-full transition shadow-md flex items-center justify-center ${
                  isMuted
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={onEndCall}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition transform hover:scale-105 active:scale-95"
                title="End Phone Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              <div
                className="p-3.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center"
                title="Audio Output Active"
              >
                <Volume2 className="w-5 h-5 text-emerald-400" />
              </div>
            </>
          ) : callState === 'ringing' ? (
            <button
              onClick={onEndCall}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg transition flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" /> Cancel Call
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Close Screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
