import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  Loader2
} from 'lucide-react';
import type { CallState, TranscriptItem } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { CLARA_AVATAR } from '../constants/doctorAssets';

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
    "Check Dr. Jenkins' slots tomorrow",
    "My phone number is 9876543210",
    "Yes, book 10:30 AM",
    "Cancel appointment APT-7821",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md h-[740px] max-h-[94vh] bg-slate-900 border-4 border-slate-700/80 rounded-[48px] shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* Dynamic Island Notch */}
        <div className="w-full pt-3 pb-1 flex justify-center items-center relative z-20 bg-slate-900/95">
          <div className="w-28 h-4 bg-slate-800 rounded-full flex items-center justify-center space-x-2 border border-slate-700/50">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          {callState === 'idle' || callState === 'ended' ? (
            <button
              onClick={onClose}
              className="absolute right-5 top-3 text-slate-400 hover:text-white p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* Call Status & Caller Avatar Section */}
        <div className="pt-4 pb-3 px-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-925 relative shrink-0">
          <div className="relative inline-block mx-auto mb-2.5">
            {/* Glowing Speaking Ring */}
            {agentState === 'speaking' && (
              <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
            )}
            
            <img
              src={CLARA_AVATAR}
              alt="Clara Receptionist"
              className={`w-16 h-16 rounded-full object-cover border-2 shadow-lg mx-auto relative z-10 transition ${
                agentState === 'speaking' ? 'border-emerald-400 ring-4 ring-emerald-500/20' : 'border-slate-700'
              }`}
            />
            <span className="absolute bottom-0 right-0 z-20 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">Clara</h3>
          <p className="text-xs text-emerald-400 font-medium">Apex Health AI Receptionist</p>

          {/* Call State & Timer */}
          <div className="mt-1 flex items-center justify-center space-x-2 text-xs">
            {callState === 'ringing' && (
              <span className="text-amber-400 font-medium animate-pulse flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Connecting call...
              </span>
            )}
            {callState === 'connected' && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-mono font-medium">{formatTimer(duration)}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium capitalize">
                  {agentState === 'speaking'
                    ? 'Clara Speaking'
                    : agentState === 'thinking'
                    ? 'Consulting Clinic Schedule...'
                    : 'Listening to your voice...'}
                </span>
              </div>
            )}
            {callState === 'ended' && (
              <span className="text-rose-400 font-medium">Call Ended ({formatTimer(duration)})</span>
            )}
          </div>

          {/* Audio Waveform Reaction */}
          {callState === 'connected' && (
            <div className="mt-2 h-7 flex items-center justify-center">
              <AudioWaveform analyser={analyser} isActive={agentState === 'speaking' || !isMuted} />
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Area */}
        <div
          ref={transcriptScrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <p className="font-medium text-slate-400">Call connected</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Say "Hello Clara" or ask for a doctor's availability to begin
              </p>
            </div>
          ) : (
            transcripts.map((t) => {
              const isAgent = t.role === 'agent';
              return (
                <div
                  key={t.id}
                  className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'} animate-fade-in`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">
                      {isAgent ? 'Clara (AI)' : 'You (Caller)'}
                    </span>
                    <span>•</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                      isAgent
                        ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
                        : 'bg-emerald-600 text-white rounded-tr-sm font-medium'
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              );
            })
          )}

          {/* Active Tool Execution Pill */}
          {activeTool && (
            <div className="flex items-center justify-center py-1 animate-pulse">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                <span>
                  {activeTool === 'check_doctor_availability' && 'Checking available clinic slots...'}
                  {activeTool === 'book_appointment' && 'Confirming appointment booking...'}
                  {activeTool === 'cancel_appointment' && 'Processing appointment cancellation...'}
                </span>
              </div>
            </div>
          )}

          {/* Live In-Call Booking Confirmation Card */}
          {lastConfirmedAppointment && (
            <div className="my-2 p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl shadow-lg animate-bounce-short">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">
                  {lastConfirmedAppointment.is_cancelled ? 'Cancellation Confirmed' : 'Appointment Confirmed!'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Code:</span>
                  <span className="font-mono font-bold text-emerald-300">{lastConfirmedAppointment.appointment_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-medium text-white">{lastConfirmedAppointment.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schedule:</span>
                  <span>{lastConfirmedAppointment.date} at {lastConfirmedAppointment.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-emerald-400">{lastConfirmedAppointment.patient_phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Voice Suggestions & Keyboard Fallback */}
        <div className="p-3 bg-slate-900 border-t border-slate-800/80 shrink-0">
          <div className="mb-2">
            <span className="text-[10px] text-slate-500 font-medium block mb-1">Quick Voice Suggestions:</span>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendTextInput(prompt)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 transition truncate max-w-full"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Fallback */}
          <form onSubmit={handleSend} className="flex items-center space-x-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type a spoken message..."
              disabled={callState !== 'connected'}
              className="flex-1 bg-slate-800 text-xs text-white px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={callState !== 'connected' || !inputText.trim()}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* In-Call Controls Bar */}
        <div className="p-4 bg-slate-925 border-t border-slate-800/90 flex items-center justify-around shrink-0">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            disabled={callState !== 'connected'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isMuted
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            disabled={callState === 'idle' || callState === 'ended'}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition transform active:scale-95 disabled:opacity-50"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Close Screen (after call ends) */}
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 flex items-center justify-center transition"
            title="Minimize or close call modal"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
