from datetime import date, timedelta
from app.database import get_db

def seed_initial_data():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM doctors")
        if cursor.fetchone()["count"] > 0:
            return

        doctors = [
            (
                "Dr. Sarah Jenkins",
                "Cardiologist",
                "Cardiology & Vascular Medicine",
                "Over 14 years specializing in heart rhythm, hypertension, and preventive cardiovascular care.",
                "Room 304",
                4.95,
                "+1 (555) 234-5678"
            ),
            (
                "Dr. Marcus Vance",
                "Dermatologist",
                "Dermatology & Skin Wellness",
                "Board-certified dermatologist experienced in acute skin disorders, eczema, and skin cancer screening.",
                "Room 210",
                4.88,
                "+1 (555) 345-6789"
            ),
            (
                "Dr. Emily Chen",
                "Pediatrician",
                "Pediatrics & Child Development",
                "Compassionate care for infants, adolescents, vaccinations, and routine pediatric wellness.",
                "Room 105",
                4.98,
                "+1 (555) 456-7890"
            ),
            (
                "Dr. Neil Patel",
                "Orthopedic Surgeon",
                "Orthopedics & Joint Health",
                "Specialist in sports injury rehabilitation, joint pain, spine care, and fracture treatment.",
                "Room 412",
                4.92,
                "+1 (555) 567-8901"
            ),
            (
                "Dr. Alena Rostova",
                "Neurologist",
                "Neurology & Brain Health",
                "Expert in persistent migraines, neurological diagnostics, sleep disorders, and cognitive wellness.",
                "Room 508",
                4.94,
                "+1 (555) 678-9012"
            ),
        ]
        
        cursor.executemany("""
            INSERT INTO doctors (name, specialty, department, bio, room_number, rating, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, doctors)
        
        # Get doctor IDs
        cursor.execute("SELECT id, name FROM doctors")
        doc_rows = cursor.fetchall()
        
        today = date.today()
        standard_times = ["09:00 AM", "10:30 AM", "11:45 AM", "02:00 PM", "03:30 PM", "04:45 PM"]
        
        slots_to_insert = []
        for doc in doc_rows:
            doc_id = doc["id"]
            # Generate slots for today, tomorrow, and the next 5 days
            for day_offset in range(7):
                target_date = (today + timedelta(days=day_offset)).isoformat()
                for slot_time in standard_times:
                    slots_to_insert.append((doc_id, target_date, slot_time, 0))
                    
        cursor.executemany("""
            INSERT INTO slots (doctor_id, date, time_slot, is_booked)
            VALUES (?, ?, ?, ?)
        """, slots_to_insert)
        
        # Seed two sample appointments for demonstration and instant testing:
        # One appointment for Dr. Sarah Jenkins with phone "9876543210"
        tomorrow = (today + timedelta(days=1)).isoformat()
        cursor.execute("""
            SELECT id FROM slots 
            WHERE doctor_id = 1 AND date = ? AND time_slot = '10:30 AM'
        """, (tomorrow,))
        slot = cursor.fetchone()
        if slot:
            slot_id = slot["id"]
            cursor.execute("UPDATE slots SET is_booked = 1 WHERE id = ?", (slot_id,))
            cursor.execute("""
                INSERT INTO appointments (appointment_code, doctor_id, slot_id, patient_phone, patient_name, date, time_slot, status)
                VALUES ('APT-7821', 1, ?, '9876543210', 'Alex Johnson', ?, '10:30 AM', 'confirmed')
            """, (slot_id, tomorrow))
            
        # Another appointment for Dr. Marcus Vance with phone "5551234567"
        day_after = (today + timedelta(days=2)).isoformat()
        cursor.execute("""
            SELECT id FROM slots 
            WHERE doctor_id = 2 AND date = ? AND time_slot = '02:00 PM'
        """, (day_after,))
        slot2 = cursor.fetchone()
        if slot2:
            slot_id2 = slot2["id"]
            cursor.execute("UPDATE slots SET is_booked = 1 WHERE id = ?", (slot_id2,))
            cursor.execute("""
                INSERT INTO appointments (appointment_code, doctor_id, slot_id, patient_phone, patient_name, date, time_slot, status)
                VALUES ('APT-8402', 2, ?, '5551234567', 'Samantha Reed', ?, '02:00 PM', 'confirmed')
            """, (slot_id2, day_after))
