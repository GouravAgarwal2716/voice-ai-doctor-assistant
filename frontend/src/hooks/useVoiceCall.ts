import { useState, useRef, useEffect, useCallback } from 'react';
import type { CallState, TranscriptItem } from '../types';
import { useSoundEffects } from './useSoundEffects';

interface UseVoiceCallOptions {
  onAppointmentChanged?: () => void;
  onBookingConfirmed?: (data: unknown) => void;
  onCancellationConfirmed?: (data: unknown) => void;
}

export const useVoiceCall = (options?: UseVoiceCallOptions) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [lastConfirmedAppointment, setLastConfirmedAppointment] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const { startRinging, stopRinging, playEndCall, playConfirmation } = useSoundEffects();

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Audio playback queue for smooth streaming
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  const playNextAudioChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0 || !audioCtxRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }
    const chunk = audioQueueRef.current.shift()!;
    const buffer = ctx.createBuffer(1, chunk.length, 16000);
    buffer.getChannelData(0).set(chunk);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Play audio through destination speakers
    source.connect(ctx.destination);

    // Tap into analyser for reactive visualizer (WITHOUT looping back to destination)
    if (analyserRef.current) {
      source.connect(analyserRef.current);
    }

    source.onended = () => {
      playNextAudioChunk();
    };
    source.start();
  }, []);

  const queueAudioForPlayback = useCallback((pcmBytes: ArrayBuffer) => {
    const int16Array = new Int16Array(pcmBytes);
    const float32 = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32[i] = int16Array[i] / 32768.0;
    }
    audioQueueRef.current.push(float32);
    if (!isPlayingRef.current) {
      playNextAudioChunk();
    }
  }, [playNextAudioChunk]);

  // Start Call
  const startCall = useCallback(async () => {
    try {
      setCallState('ringing');
      startRinging();
      setTranscripts([]);
      setLastConfirmedAppointment(null);
      setActiveTool(null);

      // Initialize Web Audio Context
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioCtxRef.current = audioCtx;

      // Setup AnalyserNode for live waveform
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // Connect to WebSocket
      const wsUrl = `ws://${window.location.hostname}:8000/ws/call`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice Call WebSocket connected');
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          // Incoming TTS audio chunk from Pipecat
          queueAudioForPlayback(event.data);
          return;
        }

        try {
          const data = JSON.parse(event.data);
          console.log('WS Event:', data);

          if (data.type === 'call_connected') {
            stopRinging();
            setCallState('connected');
            setAgentState('speaking');
            if (data.greeting) {
              setTranscripts(prev => [
                ...prev,
                {
                  id: String(Date.now()),
                  role: 'agent',
                  text: data.greeting,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }
          } else if (data.type === 'transcript_chunk') {
            // Live agent streaming words into the chat
            setTranscripts(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'agent' && (last as any).isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + data.text }
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: String(Date.now()),
                    role: 'agent',
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isStreaming: true,
                  } as any
                ];
              }
            });
          } else if (data.type === 'transcript') {
            setTranscripts(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === data.role && (last as any).isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: data.text, isStreaming: false }
                ];
              }
              if (prev.length > 0 && prev[prev.length - 1].text === data.text) {
                return prev;
              }
              return [
                ...prev,
                {
                  id: String(Date.now() + Math.random()),
                  role: data.role,
                  text: data.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ];
            });
          } else if (data.type === 'agent_state') {
            setAgentState(data.state);
          } else if (data.type === 'tool_executing') {
            setActiveTool(data.tool);
            setAgentState('thinking');
          } else if (data.type === 'tool_result') {
            setActiveTool(null);
          } else if (data.type === 'appointment_booked') {
            playConfirmation();
            setLastConfirmedAppointment(data.appointment);
            setActiveTool(null);
            options?.onAppointmentChanged?.();
            options?.onBookingConfirmed?.(data.appointment);
          } else if (data.type === 'appointment_cancelled') {
            playConfirmation();
            setLastConfirmedAppointment({ ...data.appointment, is_cancelled: true });
            setActiveTool(null);
            options?.onAppointmentChanged?.();
            options?.onCancellationConfirmed?.(data.appointment);
          } else if (data.type === 'call_ended') {
            endCall();
          }
        } catch (e) {
          console.error('Failed to parse WS text message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (callState === 'connected' || callState === 'ringing') {
          endCall();
        }
      };

      // Set up microphone audio capture
      const micSource = audioCtx.createMediaStreamSource(stream);
      micSource.connect(analyser);

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        ws.send(pcm16.buffer);
      };

      micSource.connect(processor);
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

    } catch (err) {
      console.error('Failed to start call:', err);
      stopRinging();
      setCallState('ended');
      setTimeout(() => setCallState('idle'), 2500);
    }
  }, [callState, isMuted, options, playConfirmation, queueAudioForPlayback, startRinging, stopRinging]);

  // End Call
  const endCall = useCallback(() => {
    stopRinging();
    playEndCall();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'hangup' }));
        wsRef.current.close();
      } catch (e) {
        console.warn('Error closing WS:', e);
      }
    }
    wsRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setCallState('ended');
    setAgentState('idle');
    setActiveTool(null);

    setTimeout(() => {
      setCallState('idle');
    }, 3000);
  }, [playEndCall, stopRinging]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const sendTextInput = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setTranscripts(prev => [
      ...prev,
      {
        id: String(Date.now()),
        role: 'caller',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    wsRef.current.send(JSON.stringify({
      type: 'text_input',
      text: text.trim()
    }));
  }, []);

  return {
    callState,
    duration,
    isMuted,
    agentState,
    transcripts,
    activeTool,
    lastConfirmedAppointment,
    analyser: analyserRef.current,
    startCall,
    endCall,
    toggleMute,
    sendTextInput,
  };
};
