import React from 'react';
import { MessageSquareText, Copy, Check } from 'lucide-react';
import type { TranscriptItem } from '../types';

interface LiveTranscriptProps {
  transcripts: TranscriptItem[];
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ transcripts }) => {
  const [copied, setCopied] = React.useState(false);

  const copyAll = () => {
    const text = transcripts
      .map(t => `[${t.timestamp}] ${t.role === 'caller' ? 'Caller' : 'Clara'}: ${t.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
        <div className="flex items-center space-x-2">
          <MessageSquareText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Live Conversation Transcript</h2>
          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
            {transcripts.length} lines
          </span>
        </div>
        {transcripts.length > 0 && (
          <button
            onClick={copyAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[320px] max-h-[440px]">
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <MessageSquareText className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs">No active conversation yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Click "Start Voice Call" to talk to Clara in real-time.</p>
          </div>
        ) : (
          transcripts.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                t.role === 'caller'
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-200 ml-4'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-100 mr-4'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px]">
                <span className={`font-semibold ${t.role === 'caller' ? 'text-emerald-400' : 'text-teal-400'}`}>
                  {t.role === 'caller' ? 'Caller' : 'Clara (AI Receptionist)'}
                </span>
                <span className="text-slate-500 font-mono">{t.timestamp}</span>
              </div>
              <div>{t.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
