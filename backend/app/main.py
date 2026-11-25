import asyncio
import json
import aiohttp
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

from app.config import settings
from app.database import init_db
from app.seed_data import seed_initial_data
from app.appointment_service import (
    get_all_doctors,
    get_all_appointments,
    check_doctor_availability,
    book_appointment,
    cancel_appointment
)
from app.pipecat_pipeline import create_pipecat_pipeline

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Clinic Database & Seeding Initial Data...")
    init_db()
    seed_initial_data()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down Apex Health Assistant server.")

app = FastAPI(
    title="Apex Health - Voice AI Doctor Appointment Assistant",
    description="Real-time voice agent pipeline built with Pipecat, ElevenLabs STT/TTS, and Google Gemini LLM.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend and general access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections for broadcasting real-time updates across the dashboard
class ConnectionManager:
    def __init__(self):
        self.dashboard_sockets: list[WebSocket] = []

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_sockets.append(websocket)

    def disconnect_dashboard(self, websocket: WebSocket):
        if websocket in self.dashboard_sockets:
            self.dashboard_sockets.remove(websocket)

    async def broadcast_to_dashboards(self, message: Dict[str, Any]):
        data_text = json.dumps(message)
        dead = []
        for ws in self.dashboard_sockets:
            try:
                await ws.send_text(data_text)
            except Exception:
                dead.append(ws)
        for d in dead:
            if d in self.dashboard_sockets:
                self.dashboard_sockets.remove(d)

manager = ConnectionManager()

# --- REST API Endpoints ---

@app.get("/api/health")
async def health_check():
    """Health check reporting configuration and service availability."""
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_elevenlabs = bool(settings.ELEVENLABS_API_KEY)
    return {
        "status": "healthy",
        "gemini_configured": has_gemini,
        "elevenlabs_configured": has_elevenlabs,
        "llm_model": settings.GEMINI_MODEL,
        "voice_id": settings.ELEVENLABS_VOICE_ID,
        "db_path": str(settings.DB_PATH)
    }

@app.get("/api/doctors")
async def list_doctors():
    """Retrieve all clinic doctors and their upcoming open slots."""
    return get_all_doctors()

@app.get("/api/appointments")
async def list_appointments():
    """Retrieve all current appointments with real-time status."""
    return get_all_appointments()

class AvailabilityRequest(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    date_str: Optional[str] = None

@app.post("/api/availability")
async def check_availability(req: AvailabilityRequest):
    """Check doctor slots for a given doctor, specialty, or date."""
    return check_doctor_availability(req.doctor_name, req.specialty, req.date_str)

class BookRequest(BaseModel):
    patient_phone: str
    doctor_name: str
    date_str: str
    time_slot: str
    patient_name: Optional[str] = "Caller"

@app.post("/api/appointments/book")
async def api_book(req: BookRequest):
    """Book an appointment manually from the dashboard."""
    result = book_appointment(
        req.patient_phone, req.doctor_name, req.date_str, req.time_slot, req.patient_name
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result)
    
    # Broadcast to all open dashboards to highlight the new appointment in real-time
    await manager.broadcast_to_dashboards({
        "type": "appointment_booked",
        "appointment": result
    })
    return result

class CancelRequest(BaseModel):
    patient_phone: str
    appointment_id_or_date: Optional[str] = None

@app.post("/api/appointments/cancel")
async def api_cancel(req: CancelRequest):
    """Cancel an appointment manually from the dashboard."""
    result = cancel_appointment(req.patient_phone, req.appointment_id_or_date)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result)
        
    await manager.broadcast_to_dashboards({
        "type": "appointment_cancelled",
        "appointment": result
    })
    return result

@app.post("/api/reset-data")
async def reset_data():
    """Reset the database to initial seed data for clean demonstration."""
    if settings.DB_PATH.exists():
        settings.DB_PATH.unlink()
    init_db()
    seed_initial_data()
    
    await manager.broadcast_to_dashboards({"type": "data_refreshed"})
    return {"success": True, "message": "Database reset to initial demo state."}

# --- WebSocket Endpoints ---

@app.websocket("/ws/dashboard")
async def dashboard_events_ws(websocket: WebSocket):
    """Real-time event stream for the dashboard to receive updates when appointments change."""
    await manager.connect_dashboard(websocket)
    try:
        while True:
            # Keep alive ping-pong
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_dashboard(websocket)
    except Exception as e:
        logger.warning(f"Dashboard WS disconnected: {e}")
        manager.disconnect_dashboard(websocket)

@app.websocket("/ws/call")
async def voice_call_ws(websocket: WebSocket):
    """
    Main Voice AI Call WebSocket:
    Handles live bidirectional audio streaming, real-time transcription, and Pipecat execution.
    """
    await websocket.accept()
    logger.info("Voice Call WebSocket connected. Starting Pipecat Pipeline...")

    # Broadcast helper that delivers to both this call's socket and all observer dashboards
    async def broadcast_event(event: Dict[str, Any]):
        event_str = json.dumps(event)
        try:
            await websocket.send_text(event_str)
        except Exception:
            pass
        # Also broadcast appointments to other dashboard tabs
        if event.get("type") in ["appointment_booked", "appointment_cancelled"]:
            await manager.broadcast_to_dashboards(event)

    # Inform client that call is connected
    await broadcast_event({
        "type": "call_connected",
        "greeting": "Hello! Thank you for calling Apex Health Medical Center. My name is Clara. How can I help you today?"
    })

    try:
        async with aiohttp.ClientSession() as aiohttp_session:
            # Create the Pipecat Voice Pipeline Task & Runner
            task, runner = create_pipecat_pipeline(websocket, broadcast_event, aiohttp_session)
            
            # Run the Pipecat voice pipeline
            await runner.run(task)

    except WebSocketDisconnect:
        logger.info("Voice Call WebSocket disconnected by client.")
    except Exception as e:
        logger.error(f"Voice pipeline error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "pipeline_error",
                "error": str(e)
            }))
        except Exception:
            pass
    finally:
        logger.info("Voice Call session ended.")
        try:
            await broadcast_event({"type": "call_ended"})
        except Exception:
            pass
