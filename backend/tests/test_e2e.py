import asyncio
import json
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.appointment_service import check_doctor_availability, book_appointment, cancel_appointment

def test_rest_and_ws_endpoints():
    print("=== RUNNING END-TO-END VERIFICATION ===")
    
    client = TestClient(app)
    
    # 1. Health Endpoint
    print("\n1. Verifying GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    print(f"   Health check OK: {data}")
    
    # 2. Doctors Endpoint
    print("\n2. Verifying GET /api/doctors...")
    res = client.get("/api/doctors")
    assert res.status_code == 200
    doctors = res.json()
    assert len(doctors) >= 5
    print(f"   Retrieved {len(doctors)} doctors with upcoming slots.")
    first_doc = doctors[0]
    print(f"   Sample Doctor: {first_doc['name']} ({first_doc['specialty']}) - Slots: {len(first_doc['upcoming_slots'])}")
    
    # 3. Appointments Endpoint
    print("\n3. Verifying GET /api/appointments...")
    res = client.get("/api/appointments")
    assert res.status_code == 200
    apts = res.json()
    assert len(apts) >= 1
    print(f"   Retrieved {len(apts)} appointments.")
    
    # 4. Availability Search
    print("\n4. Verifying POST /api/availability...")
    avail_req = {"doctor_name": "Jenkins", "specialty": "Cardiologist"}
    res = client.post("/api/availability", json=avail_req)
    assert res.status_code == 200
    avail_data = res.json()
    assert avail_data["success"] is True
    print(f"   Availability Response: {avail_data['voice_summary']}")

    # 5. Direct Booking
    print("\n5. Verifying POST /api/appointments/book...")
    target_slot = first_doc["upcoming_slots"][0]
    book_payload = {
        "patient_phone": "9876543210",
        "doctor_name": first_doc["name"],
        "date_str": target_slot["date"],
        "time_slot": target_slot["time_slot"],
        "patient_name": "E2E Test Caller"
    }
    res = client.post("/api/appointments/book", json=book_payload)
    assert res.status_code == 200
    book_res = res.json()
    assert book_res["success"] is True
    apt_code = book_res["appointment_code"]
    print(f"   Booking OK! Code: {apt_code}")
    print(f"   Voice Summary: {book_res['voice_summary']}")

    # 6. Direct Cancellation
    print("\n6. Verifying POST /api/appointments/cancel...")
    cancel_payload = {
        "patient_phone": "9876543210",
        "appointment_id_or_date": apt_code
    }
    res = client.post("/api/appointments/cancel", json=cancel_payload)
    assert res.status_code == 200
    cancel_res = res.json()
    assert cancel_res["success"] is True
    print(f"   Cancellation OK! Code: {cancel_res['appointment_code']}")
    print(f"   Voice Summary: {cancel_res['voice_summary']}")

    # 7. WebSocket Handshake Test for Dashboard
    print("\n7. Verifying Dashboard WebSocket /ws/dashboard...")
    with client.websocket_connect("/ws/dashboard") as ws:
        ws.send_text("ping")
        pong = ws.receive_text()
        assert pong == "pong"
        print("   Dashboard WebSocket ping/pong verified.")

    print("\n=== ALL END-TO-END TESTS PASSED FLAWLESSLY! ===")

if __name__ == "__main__":
    test_rest_and_ws_endpoints()
