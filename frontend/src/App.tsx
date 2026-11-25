import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { InteractiveVoiceBar } from './components/InteractiveVoiceBar';
import { StatsOverview } from './components/StatsOverview';
import { DoctorsList } from './components/DoctorsList';
import { AppointmentsTable } from './components/AppointmentsTable';
import { LiveTranscript } from './components/LiveTranscript';
import { PhoneCallModal } from './components/PhoneCallModal';
import { useVoiceCall } from './hooks/useVoiceCall';
import { api } from './services/api';
import type { Doctor, Appointment, HealthInfo } from './types';

export function App() {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  
  // Highlight state for newly booked / cancelled appointment row
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<'booked' | 'cancelled' | null>(null);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      const [h, docs, apts] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getDoctors().catch(() => []),
        api.getAppointments().catch(() => [])
      ]);
      if (h) setHealth(h);
      setDoctors(docs);
      setAppointments(apts);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#06b6d4', '#3b82f6']
    });
  };

  // Voice Call hook callbacks
  const handleBookingConfirmed = useCallback((data: any) => {
    loadData();
    triggerConfetti();
    if (data?.appointment_code) {
      setHighlightedCode(data.appointment_code);
      setHighlightType('booked');
      setTimeout(() => setHighlightedCode(null), 4000);
    }
  }, [loadData]);

  const handleCancellationConfirmed = useCallback((data: any) => {
    loadData();
    if (data?.appointment_code) {
      setHighlightedCode(data.appointment_code);
      setHighlightType('cancelled');
      setTimeout(() => setHighlightedCode(null), 4000);
    }
  }, [loadData]);

  const {
    callState,
    duration,
    isMuted,
    agentState,
    transcripts,
    activeTool,
    lastConfirmedAppointment,
    analyser,
    startCall,
    endCall,
    toggleMute,
    sendTextInput,
  } = useVoiceCall({
    onAppointmentChanged: loadData,
    onBookingConfirmed: handleBookingConfirmed,
    onCancellationConfirmed: handleCancellationConfirmed,
  });

  // Listen to background dashboard WebSocket for multi-tab sync
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/dashboard`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'appointment_booked') {
            loadData();
            if (msg.appointment?.appointment_code) {
              setHighlightedCode(msg.appointment.appointment_code);
              setHighlightType('booked');
              setTimeout(() => setHighlightedCode(null), 4000);
            }
          } else if (msg.type === 'appointment_cancelled') {
            loadData();
            if (msg.appointment?.appointment_code) {
              setHighlightedCode(msg.appointment.appointment_code);
              setHighlightType('cancelled');
              setTimeout(() => setHighlightedCode(null), 4000);
            }
          } else if (msg.type === 'data_refreshed') {
            loadData();
          }
        } catch (e) {
          console.error(e);
        }
      };
      ws.onclose = () => {
        reconnectTimeout = window.setTimeout(connectWs, 3000);
      };
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [loadData]);

  // Handle Start Call
  const handleStartCall = () => {
    setIsPhoneModalOpen(true);
    startCall();
  };

  // Handle Reset Demo Data
  const handleResetData = async () => {
    if (confirm('Reset clinic database to original seed state?')) {
      setIsResetting(true);
      try {
        await api.resetData();
        await loadData();
      } catch (err) {
        alert('Failed to reset demo data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white relative font-sans">
      {/* Subtle Ambient Mesh Lights */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      
      {/* Top Navigation & Controls */}
      <Header
        health={health}
        callState={callState}
        onStartCall={handleStartCall}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Interactive Voice AI Scheduling Console */}
        <InteractiveVoiceBar
          callState={callState}
          onStartCall={handleStartCall}
          onSelectPrompt={(prompt) => {
            handleStartCall();
            setTimeout(() => {
              sendTextInput(prompt);
            }, 1200);
          }}
        />

        {/* KPI & Pipeline Metrics */}
        <StatsOverview doctors={doctors} appointments={appointments} />

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Doctors & Slots (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DoctorsList
              doctors={doctors}
              onSelectSlot={(docName, _date, time) => {
                if (callState === 'connected') {
                  sendTextInput(`I would like to book an appointment with ${docName} at ${time}`);
                } else {
                  handleStartCall();
                  setTimeout(() => {
                    sendTextInput(`I would like to book with ${docName} at ${time}`);
                  }, 1200);
                }
              }}
              onCallForDoctor={(docName) => {
                handleStartCall();
                setTimeout(() => {
                  sendTextInput(`I want to check ${docName}'s availability`);
                }, 1200);
              }}
            />
          </div>

          {/* Right Column: Live Conversation Transcript (5 cols) */}
          <div className="lg:col-span-5">
            <LiveTranscript transcripts={transcripts} />
          </div>

        </div>

        {/* Full-width Appointments Ledger */}
        <div className="w-full">
          <AppointmentsTable
            appointments={appointments}
            highlightedCode={highlightedCode}
            highlightType={highlightType}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        Apex Health Voice AI • Built with Pipecat, ElevenLabs STT/TTS & Google Gemini LLM • SDE Assignment Round 1
      </footer>

      {/* Phone-Style Call Modal Screen (Bonus Item) */}
      <PhoneCallModal
        isOpen={isPhoneModalOpen || callState !== 'idle'}
        callState={callState}
        duration={duration}
        isMuted={isMuted}
        agentState={agentState}
        transcripts={transcripts}
        activeTool={activeTool}
        lastConfirmedAppointment={lastConfirmedAppointment}
        analyser={analyser}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onClose={() => setIsPhoneModalOpen(false)}
        onSendTextInput={sendTextInput}
      />
    </div>
  );
}
export default App;
