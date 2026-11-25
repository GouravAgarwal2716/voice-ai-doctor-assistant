import React, { useRef, useEffect } from 'react';
import { MessageSquareText, Sparkles, Copy, Check } from 'lucide-react';
import type { TranscriptItem } from '../types';

interface LiveTranscriptProps {
  transcripts: TranscriptItem[];
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ transcripts }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const handleCopyTranscript = () => {
    if (transcripts.length === 0) return;
    const text = transcripts
      .map((t) => `[${t.timestamp}] ${t.role === 'agent' ? 'Clara (AI)' : 'Caller'}: ${t.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0F1E]/95 border border-indigo-500/20 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-[#070B14]/90 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">Live Spoken Transcript</h3>
            <p className="text-xs text-slate-400">Streams caller STT and Clara's responses</p>
          </div>
        </div>

        {transcripts.length > 0 && (
          <button
            onClick={handleCopyTranscript}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#121A2F] hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition cursor-pointer"
            title="Copy conversation transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Transcript Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs bg-[#060913] scrollbar-thin scrollbar-thumb-slate-800"
      >
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
            <Sparkles className="w-9 h-9 text-rose-400/50 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-slate-400">No active conversation</p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              Click "Start Voice Call with Clara" to speak with the AI assistant. Real-time words appear here automatically.
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
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 px-1">
                  <span className={`font-bold uppercase tracking-wider ${isAgent ? 'text-rose-300' : 'text-teal-300'}`}>
                    {isAgent ? 'Clara (AI)' : 'Caller'}
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
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-slate-800/80 bg-[#070B14]/80 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <span>ElevenLabs STT + Google Gemini</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active Channel
        </span>
      </div>
    </div>
  );
};
