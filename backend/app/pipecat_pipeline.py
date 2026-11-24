import asyncio
import json
import base64
from typing import Optional, Callable, Any, Dict
from loguru import logger

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.task import PipelineTask
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.worker import PipelineParams
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.adapters.llm.schemas.tools_schema import ToolsSchema, FunctionSchema
from pipecat.services.google.llm import GoogleLLMService
from pipecat.services.elevenlabs.tts import ElevenLabsTTSService
from pipecat.services.elevenlabs.stt import ElevenLabsSTTService
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.transports.websocket.fastapi import FastAPIWebsocketTransport, FastAPIWebsocketParams
from pipecat.serializers.base_serializer import FrameSerializer
from pipecat.frames.frames import (
    Frame,
    InputAudioRawFrame,
    OutputAudioRawFrame,
    TextFrame,
    TranscriptionFrame,
    InterimTranscriptionFrame,
    LLMFullResponseStartFrame,
    LLMFullResponseEndFrame,
    EndFrame
)
from pipecat.services.llm_service import FunctionCallParams

from app.config import settings
from app.appointment_service import (
    check_doctor_availability,
    book_appointment,
    cancel_appointment,
    get_all_doctors,
    get_all_appointments
)

SYSTEM_PROMPT = """You are Clara, a friendly, warm, and highly professional clinical voice receptionist at Apex Health Medical Center.

Your responsibilities:
1. Help patients check doctor availability across departments (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology).
2. Book new doctor appointments.
3. Cancel existing doctor appointments.

CRITICAL RULES (FOLLOW STRICTLY):
1. Identification: Callers are identified ONLY by the phone number they speak out loud. Never ask for email, password, login, or OTP.
2. CONFIRMATION READ-BACK (MANDATORY):
   - Whenever the caller provides a phone number to book or cancel an appointment, YOU MUST ALWAYS READ THE PHONE NUMBER BACK to the caller to confirm (e.g., "Just to make sure I have that right, your phone number is 9 8 7, 6 5 4, 3 2 1 0, is that correct?").
   - ONLY call the `book_appointment` or `cancel_appointment` tool AFTER the caller confirms their phone number.
3. Availability: Use `check_doctor_availability` to find available dates and time slots. Offer 2 or 3 convenient slots to the caller clearly.
4. Natural Spoken Tone: You are speaking on a live telephone call. Keep your sentences concise, natural, conversational, and polite. Avoid bullet points, long lists, or Markdown symbols (do not say asterisks or hashtags).
5. Multi-Action Handling: In a single phone conversation, the caller may check availability, book an appointment, and also cancel an existing appointment. Handle all requests seamlessly.

Available Doctors:
- Dr. Sarah Jenkins (Cardiologist, Cardiology)
- Dr. Marcus Vance (Dermatologist, Dermatology)
- Dr. Emily Chen (Pediatrician, Pediatrics)
- Dr. Neil Patel (Orthopedic Surgeon, Orthopedics)
- Dr. Alena Rostova (Neurologist, Neurology)

Start the conversation by warmly greeting the caller:
"Hello! Thank you for calling Apex Health Medical Center. My name is Clara. How can I help you today?"
"""

# Standard Tools Schema for Function Calling
DOCTOR_TOOLS = ToolsSchema(standard_tools=[
    FunctionSchema(
        name="check_doctor_availability",
        description="Returns available appointment slots for a doctor and/or specialty on a given date.",
        properties={
            "doctor_name": {
                "type": "string",
                "description": "Name or partial name of the doctor (e.g. Jenkins, Dr. Sarah Jenkins)."
            },
            "specialty": {
                "type": "string",
                "description": "Medical specialty (e.g. Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology)."
            },
            "date_str": {
                "type": "string",
                "description": "Date to check, such as 'today', 'tomorrow', or a date like '2026-11-25'."
            }
        },
        required=[]
    ),
    FunctionSchema(
        name="book_appointment",
        description="Books a doctor appointment for the caller using their confirmed spoken phone number.",
        properties={
            "patient_phone": {
                "type": "string",
                "description": "The caller's 10-digit phone number, confirmed by reading back to the caller."
            },
            "doctor_name": {
                "type": "string",
                "description": "The doctor's name (e.g. Dr. Sarah Jenkins)."
            },
            "date_str": {
                "type": "string",
                "description": "Appointment date (e.g. 'tomorrow', '2026-11-25')."
            },
            "time_slot": {
                "type": "string",
                "description": "Selected time slot (e.g. '10:30 AM', '02:00 PM')."
            },
            "patient_name": {
                "type": "string",
                "description": "Caller's name if they provided it (defaults to 'Caller')."
            }
        },
        required=["patient_phone", "doctor_name", "date_str", "time_slot"]
    ),
    FunctionSchema(
        name="cancel_appointment",
        description="Cancels an existing appointment using the caller's confirmed spoken phone number.",
        properties={
            "patient_phone": {
                "type": "string",
                "description": "The caller's 10-digit phone number, confirmed by reading back to the caller."
            },
            "appointment_id_or_date": {
                "type": "string",
                "description": "Optional appointment code (e.g. 'APT-7821') or date of the appointment."
            }
        },
        required=["patient_phone"]
    )
])


class AudioAndEventSerializer(FrameSerializer):
    """
    Serializes and deserializes audio and JSON control frames between browser WebSocket and Pipecat.
    """
    def __init__(self, broadcast_callback: Optional[Callable[[Dict[str, Any]], Any]] = None):
        super().__init__()
        self.broadcast_callback = broadcast_callback

    async def serialize(self, frame: Frame) -> str | bytes | None:
        if isinstance(frame, OutputAudioRawFrame):
            # Send raw 16kHz PCM audio bytes directly to the browser
            return frame.audio
        return None

    async def deserialize(self, data: str | bytes) -> Frame | None:
        if isinstance(data, bytes):
            # Binary payload from browser microphone: 16kHz 16-bit Mono PCM
            return InputAudioRawFrame(audio=data, sample_rate=16000, num_channels=1)
        elif isinstance(data, str):
            try:
                msg = json.loads(data)
                msg_type = msg.get("type")
                if msg_type == "audio_chunk":
                    # Base64 encoded audio chunk
                    raw_audio = base64.b64decode(msg.get("data", ""))
                    return InputAudioRawFrame(audio=raw_audio, sample_rate=16000, num_channels=1)
                elif msg_type == "hangup" or msg_type == "end_call":
                    return EndFrame()
                elif msg_type == "text_input":
                    # Optional text fallback input
                    return TextFrame(text=msg.get("text", ""))
            except Exception as e:
                logger.error(f"Error deserializing WebSocket message: {e}")
        return None


class TranscriptAndEventBroadcaster(FrameProcessor):
    """
    Captures live transcriptions, assistant spoken responses, and pipeline events,
    forwarding them in real-time to the frontend dashboard.
    """
    def __init__(self, broadcast_callback: Callable[[Dict[str, Any]], Any]):
        super().__init__()
        self.broadcast_callback = broadcast_callback
        self._current_agent_response = ""

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        try:
            # Caller transcription from STT
            if isinstance(frame, TranscriptionFrame):
                if frame.text and frame.text.strip():
                    await self._notify({
                        "type": "transcript",
                        "role": "caller",
                        "text": frame.text.strip(),
                        "timestamp": frame.timestamp
                    })
                    
            elif isinstance(frame, InterimTranscriptionFrame):
                if frame.text and frame.text.strip():
                    await self._notify({
                        "type": "interim_transcript",
                        "role": "caller",
                        "text": frame.text.strip()
                    })

            # Assistant response start
            elif isinstance(frame, LLMFullResponseStartFrame):
                self._current_agent_response = ""
                await self._notify({
                    "type": "agent_state",
                    "state": "speaking"
                })

            # Assistant text output to TTS
            elif isinstance(frame, TextFrame):
                if frame.text and frame.text.strip():
                    self._current_agent_response += (" " + frame.text.strip()).strip()
                    await self._notify({
                        "type": "transcript_chunk",
                        "role": "agent",
                        "text": frame.text.strip()
                    })

            # Assistant response finished
            elif isinstance(frame, LLMFullResponseEndFrame):
                if self._current_agent_response:
                    await self._notify({
                        "type": "transcript",
                        "role": "agent",
                        "text": self._current_agent_response.strip()
                    })
                    self._current_agent_response = ""
                await self._notify({
                    "type": "agent_state",
                    "state": "listening"
                })

        except Exception as e:
            logger.error(f"Error in TranscriptAndEventBroadcaster: {e}")

        # Always push frame along pipeline
        await self.push_frame(frame, direction)

    async def _notify(self, payload: Dict[str, Any]):
        if self.broadcast_callback:
            try:
                res = self.broadcast_callback(payload)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                logger.error(f"Broadcast error: {e}")


def create_pipecat_pipeline(
    websocket,
    broadcast_callback: Callable[[Dict[str, Any]], Any]
) -> tuple[PipelineTask, PipelineRunner]:
    """
    Constructs the Pipecat voice pipeline:
    Caller Audio (WebSocket) → Silero VAD → STT → LLM (with Function Calling) → TTS → Caller Audio (WebSocket)
    """
    # 1. WebSocket Transport
    serializer = AudioAndEventSerializer(broadcast_callback)
    transport_params = FastAPIWebsocketParams(
        audio_in_enabled=True,
        audio_in_sample_rate=16000,
        audio_in_channels=1,
        audio_out_enabled=True,
        audio_out_sample_rate=16000,
        audio_out_channels=1,
        serializer=serializer
    )
    transport = FastAPIWebsocketTransport(websocket, transport_params)

    # 2. Silero VAD (Voice Activity Detection bonus)
    vad_analyzer = SileroVADAnalyzer()

    # 3. Speech-to-Text (STT) - ElevenLabs
    eleven_api_key = settings.ELEVENLABS_API_KEY or "dummy_key_for_init"
    stt = ElevenLabsSTTService(
        api_key=eleven_api_key,
        sample_rate=16000
    )

    # 4. LLM - Google Gemini with Function Calling Tools
    gemini_key = settings.GEMINI_API_KEY or "dummy_key_for_init"
    llm = GoogleLLMService(
        api_key=gemini_key,
        settings=GoogleLLMService.Settings(
            model=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        ),
        tools=DOCTOR_TOOLS
    )

    # Register Tool 1: check_doctor_availability
    async def on_check_availability(params: FunctionCallParams):
        args = params.arguments
        doc_name = args.get("doctor_name")
        specialty = args.get("specialty")
        date_str = args.get("date_str")
        
        logger.info(f"Tool check_doctor_availability: doc={doc_name}, spec={specialty}, date={date_str}")
        await broadcast_callback({
            "type": "tool_executing",
            "tool": "check_doctor_availability",
            "args": args
        })
        
        result = check_doctor_availability(doc_name, specialty, date_str)
        
        await broadcast_callback({
            "type": "tool_result",
            "tool": "check_doctor_availability",
            "result": result
        })
        await params.result_callback(result["voice_summary"])

    # Register Tool 2: book_appointment
    async def on_book_appointment(params: FunctionCallParams):
        args = params.arguments
        patient_phone = args.get("patient_phone", "")
        doctor_name = args.get("doctor_name", "")
        date_str = args.get("date_str", "")
        time_slot = args.get("time_slot", "")
        patient_name = args.get("patient_name", "Caller")

        logger.info(f"Tool book_appointment: phone={patient_phone}, doc={doctor_name}, time={time_slot}")
        await broadcast_callback({
            "type": "tool_executing",
            "tool": "book_appointment",
            "args": args
        })

        result = book_appointment(patient_phone, doctor_name, date_str, time_slot, patient_name)

        await broadcast_callback({
            "type": "appointment_booked" if result.get("success") else "booking_failed",
            "appointment": result
        })
        await params.result_callback(result["voice_summary"])

    # Register Tool 3: cancel_appointment
    async def on_cancel_appointment(params: FunctionCallParams):
        args = params.arguments
        patient_phone = args.get("patient_phone", "")
        appointment_id_or_date = args.get("appointment_id_or_date")

        logger.info(f"Tool cancel_appointment: phone={patient_phone}, identifier={appointment_id_or_date}")
        await broadcast_callback({
            "type": "tool_executing",
            "tool": "cancel_appointment",
            "args": args
        })

        result = cancel_appointment(patient_phone, appointment_id_or_date)

        await broadcast_callback({
            "type": "appointment_cancelled" if result.get("success") else "cancellation_failed",
            "appointment": result
        })
        await params.result_callback(result["voice_summary"])

    llm.register_function("check_doctor_availability", on_check_availability)
    llm.register_function("book_appointment", on_book_appointment)
    llm.register_function("cancel_appointment", on_cancel_appointment)

    # 5. Text-to-Speech (TTS) - ElevenLabs
    tts = ElevenLabsTTSService(
        api_key=eleven_api_key,
        voice_id=settings.ELEVENLABS_VOICE_ID,
        model=settings.ELEVENLABS_MODEL_ID,
        sample_rate=16000
    )

    # 6. Event & Transcript Broadcaster
    broadcaster = TranscriptAndEventBroadcaster(broadcast_callback)

    # 7. Context & Turn Aggregators
    context = LLMContext()
    context_pair = LLMContextAggregatorPair(context)

    # Build Pipecat Pipeline
    pipeline = Pipeline([
        transport.input(),        # Caller Audio In
        stt,                      # ElevenLabs STT
        broadcaster,              # Intercepts Transcripts & notifies Dashboard
        context_pair.user(),      # Aggregates user speech
        llm,                      # Google Gemini with 3 tools
        tts,                      # ElevenLabs TTS
        transport.output(),       # Audio Out to Caller
        context_pair.assistant()  # Aggregates assistant response
    ])

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            allow_interruptions=True,
            audio_in_sample_rate=16000,
            audio_out_sample_rate=16000
        )
    )
    runner = PipelineRunner()

    return task, runner
