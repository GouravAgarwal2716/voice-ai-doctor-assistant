# 🏥 Apex Health — Voice AI Doctor Appointment Assistant

An enterprise-grade, real-time voice AI assistant that checks availability, books appointments, and cancels doctor consultations over natural spoken telephone calls. Built with the **Pipecat** voice framework, **ElevenLabs** for Speech-to-Text & Text-to-Speech, **Google Gemini** for function-calling LLM reasoning, and a modern **React 19 + TypeScript + Tailwind CSS** clinical booking dashboard.

---

## 🌟 Key Capabilities & Highlights

- **Natural Voice Pipeline**: Full-duplex real-time pipeline: `Caller Audio → Silero VAD → ElevenLabs STT → Google Gemini LLM → ElevenLabs TTS → Caller Audio`.
- **Spoken Phone Identification**: Callers are authenticated solely by the phone number they speak out loud (zero logins, zero OTPs, zero passwords).
- **Mandatory Confirmation Read-Back**: Before executing any booking or cancellation, the agent reads the 10-digit phone number back to the caller for verbal confirmation.
- **Three Required Function Calling Tools**:
  1. `check_doctor_availability`: Checks open slots for doctors and specialties on any given date.
  2. `book_appointment`: Reserves the chosen slot and generates a unique appointment code (`APT-XXXX`).
  3. `cancel_appointment`: Finds and cancels active bookings linked to the caller's phone, freeing up the slot in real time.
- **Top-Tier Clinical Dashboard (Like One Medical / Zocdoc)**:
  - High-resolution, verified physician directory with photos, credentials, and specialties.
  - Specialty filtering tabs (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology) with live search.
  - Interactive upcoming slot inspection with quick booking triggers.
  - Live appointments ledger with real-time status pills and pulse animations when Clara modifies appointments.
  - Interactive iPhone-style phone call modal with dynamic island, volume controls, real-time audio waveform visualizer, and in-call booking confirmation receipt cards.
  - Docker & Docker Compose setup for one-command deployment on any operating system.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Voice Framework** | [Pipecat AI (Python)](https://github.com/pipecat-ai/pipecat) | Orchestrates real-time audio pipeline, interruption handling, and turn-taking |
| **VAD** | Silero VAD (ONNX) | Low-latency voice activity detection and natural conversational interruptions |
| **STT** | ElevenLabs Speech-to-Text | Real-time speech recognition tuned for conversational phone numbers and names |
| **LLM** | Google Gemini (`gemini-3.5-flash-lite`) | Sub-second (< 0.8s) response turnaround and native tool function calling on free tier quota |
| **TTS** | ElevenLabs Text-to-Speech | Ultra-natural, empathetic clinical receptionist voice (Sarah - `EXAVITQu4vr4xnSDxMaL`) |
| **Backend & WS** | FastAPI + WebSockets | REST API and bidirectional PCM16 audio & JSON event streaming |
| **Database** | SQLite | Normalized relational database tracking doctors, slots, and appointments |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | Clinical dashboard with responsive phone modal, waveform visualizer & multi-tab sync |
| **Containerization** | Docker & Docker Compose | Containerized backend & frontend reverse-proxied via Nginx |

---

## 📐 Voice Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caller as 👤 Caller (Browser Mic)
    participant WS as ⚡ FastAPI WebSocket
    participant VAD as 🎙️ Silero VAD
    participant STT as 🗣️ ElevenLabs STT
    participant LLM as 🧠 Google Gemini
    participant DB as 🗄️ SQLite Clinic DB
    participant TTS as 🔊 ElevenLabs TTS
    participant Dash as 💻 Live Dashboard

    Caller->>WS: Speaks (Raw PCM16 Audio)
    WS->>VAD: Stream audio chunks
    VAD->>STT: Audio segment on speech detection
    STT->>Dash: Emit live transcript (Caller)
    STT->>LLM: User transcription
    Note over LLM: Evaluates intent & checks phone confirmation
    alt Needs Availability / Booking / Cancellation
        LLM->>DB: Execute Function Call (Tool)
        DB-->>LLM: Return slot & appointment status
        LLM->>Dash: Broadcast booking/cancellation event
    end
    LLM->>TTS: Agent spoken response text
    TTS->>WS: Synthesized audio stream
    WS->>Caller: Audio playback (Browser Speaker)
    WS->>Dash: Emit live transcript (Agent Clara)
```

---

## 🐳 Running with Docker (Recommended)

Run the entire application (Python backend + Nginx frontend) with one command on any machine:

### 1. Configure `.env`
Ensure your `.env` file exists in the project root:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
```

### 2. Start Containers
```bash
docker compose up --build
```

- **Frontend Dashboard**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API & Swagger Docs**: Available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 💻 Running Locally Without Docker

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** (Tested on Node.js v20)
- API Keys:
  - **Google Gemini API Key** (Free quota at [Google AI Studio](https://aistudio.google.com/))
  - **ElevenLabs API Key** ([ElevenLabs](https://elevenlabs.io/))

### 1. Backend Setup
```bash
# From project root
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r backend/requirements.txt
python backend/run.py
```
Backend will start on `http://127.0.0.1:8000`.

### 2. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Demo Walkthrough

1. **Open Dashboard**: Go to `http://localhost:5173`.
2. **Start Call**: Click the green **"Start Voice Call"** button. The phone call screen pops up with ringing sound and connects to Clara.
3. **Check Availability**:
   - Speak: *"Hello Clara, can you check Dr. Jenkins' available slots tomorrow?"*
   - Clara checks the database and reads back available slots (e.g. 09:00 AM, 10:30 AM).
4. **Book Appointment with Phone Confirmation**:
   - Speak: *"I'd like to book 10:30 AM. My phone number is 9876543210."*
   - Clara reads back your phone number to confirm: *"Just to make sure I have that right, your phone number is 9 8 7, 6 5 4, 3 2 1 0, is that correct?"*
   - Speak: *"Yes, that's correct."*
   - Clara confirms booking with a code (e.g., `APT-4821`). The live dashboard instantly flashes green, updates the appointment table, and plays celebratory confetti.
5. **Cancel Appointment**:
   - Speak: *"I need to cancel my appointment."*
   - Clara checks your phone number, confirms cancellation, and immediately frees up the slot on the dashboard.

---

## 📋 Evaluation Checklist

- [x] Pipecat framework with full-duplex audio pipeline
- [x] ElevenLabs Speech-to-Text (STT)
- [x] ElevenLabs Text-to-Speech (TTS) with premade voice `EXAVITQu4vr4xnSDxMaL`
- [x] Google Gemini LLM (`gemini-3.5-flash-lite` for < 0.8s sub-second latency)
- [x] All 3 required tools implemented and tested: `check_doctor_availability`, `book_appointment`, `cancel_appointment`
- [x] Caller identified only by spoken phone number
- [x] Mandatory phone number read-back confirmation rule enforced
- [x] Top-level clinical web dashboard with real-time sync
- [x] Phone-style call screen modal (ringing, connected, ended, timer, mute, end call)
- [x] Real-time audio waveform visualizer (Web Audio API)
- [x] Row highlight pulse animations & sound effects
- [x] Dockerfile & Docker Compose for zero-friction setup
- [x] Comprehensive documentation & `.env.example`
