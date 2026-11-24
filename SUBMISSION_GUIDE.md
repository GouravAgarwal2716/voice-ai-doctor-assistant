# 📋 Submission Guide & Checklist

## Assignment Details
- **Role**: SDE Intern / Forward Deployed Engineer (FDE) Round 1
- **Project**: Voice AI Doctor Appointment Assistant
- **Deadline**: Wednesday, 25 November, 11:00 PM IST
- **Submission Form**: [Google Form Link](https://docs.google.com/forms/d/e/1FAIpQLSdruhcgKFC4LjnlwHfYDRZoGsa0r-qy4k68SJ8RsmxsPbYxpg/viewform?usp=publish-editor)

---

## 1. Quick Verification Before Recording

### Terminal 1: Backend
```bash
cd NexovAI
# Make sure your .env has your GEMINI_API_KEY and ELEVENLABS_API_KEY
python backend/run.py
```
Expected output:
```
Starting Apex Health Voice AI Assistant on http://0.0.0.0:8000
Database initialized successfully.
```

### Terminal 2: Frontend
```bash
cd NexovAI/frontend
npm run dev
```
Open your browser at: `http://localhost:5173`.

---

## 2. Video Recording Script (Under 3 Minutes)

Use Loom, OBS, or Windows Game Bar (`Win + G`):

1. **Introduction (10 seconds)**:
   - *"Hi! This is my submission for the Voice AI Doctor Appointment Assistant assignment. I built the voice pipeline using Pipecat with ElevenLabs STT and TTS, Google Gemini 2.0 Flash for function-calling reasoning, and Silero VAD for natural interruption handling."*

2. **Starting the Voice Call (15 seconds)**:
   - Click the green **Start Voice Call** button.
   - Point out the phone modal popping up, the telephone ringing sound, and the transition to **Connected**.
   - Clara will greet: *"Hello! Thank you for calling Apex Health Medical Center. My name is Clara. How can I help you today?"*

3. **Checking Doctor Availability (30 seconds)**:
   - Speak: *"I'd like to check Dr. Sarah Jenkins' availability tomorrow."*
   - Show Clara retrieving the open slots and the live waveform reacting to the audio.
   - Clara responds with the available times (e.g. 09:00 AM, 11:45 AM, 02:00 PM).

4. **Booking an Appointment & Confirmation Read-Back (45 seconds)**:
   - Speak: *"Let's book the 11:45 AM slot. My phone number is 987-654-3210."*
   - **Crucial Rule Highlight**: Notice Clara reads the number back to confirm:
     *"Just to make sure I have that right, your phone number is 9 8 7, 6 5 4, 3 2 1 0, is that correct?"*
   - Speak: *"Yes, that is correct."*
   - Show the booking confirmation card popping up inside the phone, confetti on the dashboard, and the newly booked appointment row glowing in the **Appointments Ledger**!

5. **Cancelling an Appointment (Optional Bonus, 20 seconds)**:
   - Speak: *"I also need to cancel an appointment under phone number 555-123-4567."*
   - Clara confirms the cancellation and the slot is released.

6. **Wrap-up (10 seconds)**:
   - Click **End Call** (hear the chime).
   - Show that the ledger updated dynamically.

---

## 3. GitHub Push Instructions

Ensure you **never commit your real API keys** (your `.env` is already in `.gitignore`):

```bash
cd NexovAI
git init
git add .
git commit -m "feat: complete Voice AI Doctor Appointment Assistant with Pipecat, ElevenLabs, Gemini and React dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 4. What to Fill in the Google Form

1. **GitHub Repository Link**:
   - `https://github.com/<your-username>/<your-repo-name>`
   - (Ensure the repository is Public)
2. **Video Recording Link**:
   - Link to your Loom video or Google Drive link (make sure permission is set to *"Anyone with the link can view"*).
3. **Pipeline Description**:
   - Copy and paste the text from [`PIPELINE_DESCRIPTION.md`](./PIPELINE_DESCRIPTION.md).
