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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md h-[740px] max-h-[94vh] bg-[#0A0E1A] border-4 border-slate-700/80 rounded-[50px] shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10">
        
        {/* Dynamic Island Notch */}
        <div className="w-full pt-3 pb-1 flex justify-center items-center relative z-20 bg-[#0A0E1A]/95">
          <div className="w-28 h-4 bg-[#141B2D] rounded-full flex items-center justify-center space-x-2 border border-slate-700/60 shadow-inner">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
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
        <div className="pt-4 pb-3 px-6 text-center border-b border-slate-800 bg-gradient-to-b from-[#0A0E1A] to-[#11172A] relative shrink-0">
          <div className="relative inline-block mx-auto mb-2.5">
            {/* Glowing Speaking Multi-Color Ring */}
            {agentState === 'speaking' && (
              <span className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 animate-ping opacity-60" />
            )}
            
            <img
              src={CLARA_AVATAR}
              alt="Clara Receptionist"
              className={`w-18 h-18 rounded-full object-cover border-2 shadow-2xl mx-auto relative z-10 transition ${
                agentState === 'speaking' ? 'border-rose-400 ring-4 ring-rose-500/25' : 'border-slate-700'
              }`}
            />
            <span className="absolute bottom-0.5 right-0.5 z-20 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0A0E1A]" />
          </div>

          <h3 className="text-lg font-black text-white tracking-tight">Clara</h3>
          <p className="text-xs text-rose-300 font-bold">Apex Health AI Receptionist</p>

          {/* Call State & Timer */}
          <div className="mt-1 flex items-center justify-center space-x-2 text-xs">
            {callState === 'ringing' && (
              <span className="text-amber-300 font-bold animate-pulse flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calling Apex Health...
              </span>
            )}
            {callState === 'connected' && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-mono font-bold">{formatTimer(duration)}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-semibold capitalize">
                  {agentState === 'speaking'
                    ? 'Clara Speaking'
                    : agentState === 'thinking'
                    ? 'Checking Clinic Schedule...'
                    : 'Listening to your voice...'}
                </span>
              </div>
            )}
            {callState === 'ended' && (
              <span className="text-rose-400 font-bold">Call Finished ({formatTimer(duration)})</span>
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
          className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#060913] scrollbar-thin scrollbar-thumb-slate-800"
        >
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
              <Sparkles className="w-9 h-9 text-rose-400/60 mb-2.5 animate-pulse" />
              <p className="font-bold text-slate-300 text-sm">Call Connected with Clara</p>
              <p className="text-xs text-slate-500 mt-1">
                Speak naturally or say "Hello Clara" to check specialist availability
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
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                    <span className="font-bold uppercase tracking-wider text-rose-300/80">
                      {isAgent ? 'Clara (AI)' : 'You (Caller)'}
                    </span>
                    <span>•</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                      isAgent
                        ? 'bg-[#141C31] text-slate-100 rounded-tl-sm border border-indigo-500/20'
                        : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-tr-sm font-semibold'
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
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>
                  {activeTool === 'check_doctor_availability' && 'Consulting clinic slot schedule...'}
                  {activeTool === 'book_appointment' && 'Confirming appointment slot...'}
                  {activeTool === 'cancel_appointment' && 'Cancelling appointment slot...'}
                </span>
              </div>
            </div>
          )}

          {/* In-Call Booking Confirmation Card */}
          {lastConfirmedAppointment && (
            <div className="my-2 p-4 bg-gradient-to-br from-[#0F1E2A] to-[#13172E] border border-emerald-500/40 rounded-2xl shadow-xl animate-bounce-short">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-extrabold text-xs">
                  {lastConfirmedAppointment.is_cancelled ? 'Cancellation Confirmed' : 'Appointment Confirmed!'}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1.5 bg-[#080D1A]/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Appointment Code:</span>
                  <span className="font-mono font-black text-rose-300">{lastConfirmedAppointment.appointment_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Physician:</span>
                  <span className="font-bold text-white">{lastConfirmedAppointment.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-medium text-teal-300">{lastConfirmedAppointment.date} at {lastConfirmedAppointment.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Caller Phone:</span>
                  <span className="font-mono font-bold text-amber-300">{lastConfirmedAppointment.patient_phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Voice Suggestions & Keyboard Fallback */}
        <div className="p-3 bg-[#0A0E1A] border-t border-slate-800 shrink-0">
          <div className="mb-2">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Quick Voice Prompts:</span>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendTextInput(prompt)}
                  className="text-[10px] bg-[#141B2D] hover:bg-rose-500/20 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 transition truncate max-w-full cursor-pointer"
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
              className="flex-1 bg-[#141B2D] text-xs text-white px-3.5 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-rose-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={callState !== 'connected' || !inputText.trim()}
              className="p-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white rounded-xl disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* In-Call Controls Bar */}
        <div className="p-4 bg-[#080C16] border-t border-slate-800 flex items-center justify-around shrink-0">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            disabled={callState !== 'connected'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              isMuted
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#141B2D] text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            disabled={callState === 'idle' || callState === 'ended'}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Volume / Minimize Screen */}
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[#141B2D] text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Minimize call modal"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
