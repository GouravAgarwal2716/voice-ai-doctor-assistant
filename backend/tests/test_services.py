import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import init_db
from app.seed_data import seed_initial_data
from app.appointment_service import (
    check_doctor_availability,
    book_appointment,
    cancel_appointment,
    get_all_doctors,
    get_all_appointments,
    normalize_phone
)

def test_full_appointment_cycle():
    print("1. Initializing database & seeding test data...")
    init_db()
    seed_initial_data()
    
    print("2. Testing phone normalization...")
    assert normalize_phone("+1 (555) 234-5678") == "5552345678"
    assert normalize_phone("987-654-3210") == "9876543210"
    assert normalize_phone("19876543210") == "9876543210"
    print("   Phone normalization OK.")

    print("3. Testing check_doctor_availability...")
    avail = check_doctor_availability(doctor_name="Sarah", specialty="Cardiologist")
    assert avail["success"] is True
    assert len(avail["available_doctors"]) > 0
    doc = avail["available_doctors"][0]
    print(f"   Found doctor: {doc['doctor_name']} with {len(doc['slots'])} slots.")
    
    test_slot = doc["slots"][0]
    test_date = doc["date"]
    test_phone = "9988776655"
    
    print(f"4. Testing book_appointment for {test_phone} at {test_slot} on {test_date}...")
    book_res = book_appointment(
        patient_phone=test_phone,
        doctor_name=doc["doctor_name"],
        date_str=test_date,
        time_slot=test_slot,
        patient_name="Michael Scott"
    )
    assert book_res["success"] is True
    apt_code = book_res["appointment_code"]
    print(f"   Booking confirmed! Code: {apt_code}")
    
    # Verify slot is no longer open
    avail_after = check_doctor_availability(doctor_name="Sarah", date_str=test_date)
    matching = [d for d in avail_after["available_doctors"] if d["doctor_name"] == doc["doctor_name"]]
    if matching:
        assert test_slot not in matching[0]["slots"]
    print("   Slot correctly marked as booked.")
    
    print(f"5. Testing cancel_appointment for {test_phone}...")
    cancel_res = cancel_appointment(patient_phone=test_phone)
    assert cancel_res["success"] is True
    assert cancel_res["appointment_code"] == apt_code
    print(f"   Appointment cancelled successfully! Code: {cancel_res['appointment_code']}")
    
    # Verify slot is released
    avail_released = check_doctor_availability(doctor_name="Sarah", date_str=test_date)
    matching_rel = [d for d in avail_released["available_doctors"] if d["doctor_name"] == doc["doctor_name"]]
    assert matching_rel and test_slot in matching_rel[0]["slots"]
    print("   Slot successfully released!")

    print("6. Verifying get_all_doctors and get_all_appointments...")
    docs = get_all_doctors()
    assert len(docs) >= 5
    apts = get_all_appointments()
    assert len(apts) >= 1
    print(f"   Verified {len(docs)} doctors and {len(apts)} appointments.")
    
    print("\nALL BACKEND LOGIC TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_appointment_cycle()
