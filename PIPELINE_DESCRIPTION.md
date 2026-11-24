# Voice AI Pipeline Architecture & Description

### 1. High-Level Summary
I built an end-to-end full-duplex voice pipeline using the **Pipecat** framework in Python. The system streams raw 16kHz mono PCM audio back and forth over a persistent WebSocket connection between the caller's browser and our FastAPI backend. It allows patients to check doctor schedules, book appointments, and cancel existing appointments in real time using only their spoken phone number.

---

### 2. The Turn-Taking & Audio Flow
1. **Audio Ingestion & VAD**:
   - The browser captures microphone audio via `navigator.mediaDevices.getUserMedia` at 16,000 Hz and sends raw PCM16 binary chunks over a WebSocket.
   - On the backend, Pipecat feeds incoming audio chunks through **Silero VAD (ONNX)**. Silero detects speech onset within ~30ms and triggers interruptions if the user begins speaking while the agent is currently talking.
2. **Speech Recognition (STT)**:
   - When speech is detected, the audio frame passes to **ElevenLabs STT**, which transcribes spoken utterances in real-time.
   - Transcribed text frames are intercepted by a custom `TranscriptAndEventBroadcaster` processor, which emits WebSocket events to the frontend dashboard so the caller sees live transcription instantly.
3. **Reasoning & Tool Execution (LLM)**:
   - We use **Google Gemini 2.0 Flash** (`gemini-2.0-flash-exp`) via `GoogleLLMService`. Gemini was selected because its sub-400ms time-to-first-token keeps conversational latency crisp and natural, and it provides generous free-tier quotas.
   - Three function calling tools are registered:
     - `check_doctor_availability`: Queries SQLite for available doctors and open slots by doctor name, specialty, or date.
     - `book_appointment`: Validates slot availability, marks the slot as booked, inserts the appointment into the database, and returns a unique code (`APT-XXXX`).
     - `cancel_appointment`: Finds confirmed appointments linked to the caller's phone, marks the status as `cancelled`, and frees up the doctor's slot.
   - **Safety / Confirmation Guardrail**: The system prompt enforces a strict rule: before the LLM can invoke `book_appointment` or `cancel_appointment`, it MUST read the caller's 10-digit phone number back to them out loud to confirm accuracy.
4. **Speech Synthesis (TTS)**:
   - The LLM's streaming response is directed into **ElevenLabs TTS** using voice ID `21m00Tcm4TlvDq8ikWAM` (Rachel - warm, professional medical receptionist tone).
   - Generated 16kHz PCM audio frames are serialized and streamed directly back down the WebSocket to the browser.
5. **Client Playback & Visualization**:
   - The frontend decodes the PCM frames into Web Audio API `AudioBufferSourceNode`s played through an `AudioContext`.
   - An `AnalyserNode` extracts real-time frequency data and renders a dynamic, fluid audio waveform on an HTML5 canvas inside the phone interface.

---

### 3. Synchronization & Frontend Dashboard
Whenever a tool succeeds:
- The backend emits an `appointment_booked` or `appointment_cancelled` event over the WebSocket.
- The dashboard listens via a background WebSocket manager, instantly refreshing the doctors' open slots and appointments ledger.
- The affected row in the table glows with an animated emerald or rose pulse, and celebratory confetti triggers on successful bookings.

---

### 4. Technical Trade-offs & Engineering Decisions
- **WebSockets vs Daily WebRTC**: Instead of requiring a third-party Daily.co WebRTC account and API room tokens, I implemented a direct FastAPI WebSocket transport (`FastAPIWebsocketTransport`). This makes the application 100% self-contained, reproducible, and runnable on any local machine without external room configurations.
- **Synthesized Audio vs Static Assets**: The telephone ringing and call-ending sound effects are synthesized programmatically using the browser's Web Audio API oscillators (dual-tone 440Hz/480Hz US telephone ring standard), eliminating missing audio assets or broken 404 links.
