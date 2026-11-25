import re
import random
from datetime import date, timedelta, datetime
from typing import Optional, Dict, Any, List
from app.database import get_db

def normalize_phone(phone: str) -> str:
    """Extract digits from phone string, handling formatting or country codes."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits

def parse_relative_date(date_str: Optional[str]) -> str:
    """Resolve 'today', 'tomorrow', or explicit dates to YYYY-MM-DD."""
    today = date.today()
    if not date_str:
        return today.isoformat()
    
    clean_date = date_str.strip().lower()
    if clean_date in ["today", "now"]:
        return today.isoformat()
    elif clean_date in ["tomorrow"]:
        return (today + timedelta(days=1)).isoformat()
    elif clean_date in ["day after tomorrow"]:
        return (today + timedelta(days=2)).isoformat()
    
    # Try parsing common formats
    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%B %d, %Y", "%b %d, %Y", "%B %d", "%b %d"]:
        try:
            parsed = datetime.strptime(date_str.strip(), fmt)
            if parsed.year == 1900:  # if year not provided
                parsed = parsed.replace(year=today.year)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue
            
    # Default to tomorrow if not recognized
    return (today + timedelta(days=1)).isoformat()

def check_doctor_availability(
    doctor_name: Optional[str] = None,
    specialty: Optional[str] = None,
    date_str: Optional[str] = None
) -> Dict[str, Any]:
    """
    Tool 1: Returns the available slots for a doctor and/or specialty and date.
    Allows the voice agent to offer available slots to the caller.
    """
    target_date = parse_relative_date(date_str)
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = """
            SELECT 
                d.id as doctor_id,
                d.name as doctor_name,
                d.specialty,
                d.department,
                d.room_number,
                s.id as slot_id,
                s.date,
                s.time_slot
            FROM slots s
            JOIN doctors d ON s.doctor_id = d.id
            WHERE s.date = ? AND s.is_booked = 0
        """
        params: List[Any] = [target_date]
        
        # Build search filters
        conditions = []
        if doctor_name:
            clean_name = doctor_name.replace("Dr.", "").replace("Doctor", "").strip()
            conditions.append("(d.name LIKE ?)")
            params.append(f"%{clean_name}%")
            
        if specialty:
            conditions.append("(d.specialty LIKE ? OR d.department LIKE ?)")
            params.extend([f"%{specialty}%", f"%{specialty}%"])
            
        if conditions:
            query += " AND (" + " OR ".join(conditions) + ")"
            
        query += " ORDER BY d.name, s.time_slot ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # If no slots found on target date, check next available date
        if not rows and not doctor_name and not specialty:
            tomorrow = (date.today() + timedelta(days=1)).isoformat()
            cursor.execute("""
                SELECT 
                    d.id as doctor_id, d.name as doctor_name, d.specialty, d.department, d.room_number,
                    s.id as slot_id, s.date, s.time_slot
                FROM slots s
                JOIN doctors d ON s.doctor_id = d.id
                WHERE s.date >= ? AND s.is_booked = 0
                ORDER BY s.date, d.name, s.time_slot ASC LIMIT 10
            """, [tomorrow])
            rows = cursor.fetchall()
            
        doctors_map: Dict[int, Dict[str, Any]] = {}
        for r in rows:
            doc_id = r["doctor_id"]
            if doc_id not in doctors_map:
                doctors_map[doc_id] = {
                    "doctor_id": doc_id,
                    "doctor_name": r["doctor_name"],
                    "specialty": r["specialty"],
                    "room_number": r["room_number"],
                    "date": r["date"],
                    "slots": []
                }
            doctors_map[doc_id]["slots"].append(r["time_slot"])
            
        results = list(doctors_map.values())
        
        # Format friendly spoken summary for the LLM voice output
        if not results:
            voice_summary = (
                f"I checked the schedule for {target_date}, but unfortunately there are no open slots matching "
                f"your request. Would you like to check another date or another specialty?"
            )
        else:
            doc_summaries = []
            for doc in results[:3]:  # Top 3 to avoid overwhelming caller
                slots_text = ", ".join(doc["slots"][:4])
                doc_summaries.append(f"{doc['doctor_name']} ({doc['specialty']}) has openings at {slots_text}")
            voice_summary = f"On {target_date}: " + "; and ".join(doc_summaries) + "."
            
        return {
            "success": True,
            "target_date": target_date,
            "available_doctors": results,
            "count": len(results),
            "voice_summary": voice_summary
        }

def book_appointment(
    patient_phone: str,
    doctor_name: str,
    date_str: str,
    time_slot: str,
    patient_name: Optional[str] = "Caller"
) -> Dict[str, Any]:
    """
    Tool 2: Books a selected slot for the caller using the spoken phone number.
    Rule: Agent must have verified phone number with caller prior to booking.
    """
    clean_phone = normalize_phone(patient_phone)
    if len(clean_phone) < 7:
        return {
            "success": False,
            "error": "INVALID_PHONE",
            "voice_summary": f"The phone number provided ({patient_phone}) seems incomplete. Please provide a valid 10-digit phone number."
        }
        
    target_date = parse_relative_date(date_str)
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Find matching doctor
        clean_doc_name = doctor_name.replace("Dr.", "").replace("Doctor", "").strip()
        cursor.execute("""
            SELECT id, name, specialty, room_number 
            FROM doctors 
            WHERE name LIKE ? OR specialty LIKE ? 
            LIMIT 1
        """, (f"%{clean_doc_name}%", f"%{clean_doc_name}%"))
        doctor = cursor.fetchone()
        
        if not doctor:
            # Fallback to any doctor matching specialty
            cursor.execute("SELECT id, name, specialty, room_number FROM doctors LIMIT 1")
            doctor = cursor.fetchone()
            
        doc_id = doctor["id"]
        doc_full_name = doctor["name"]
        
        # Check slot availability
        # Flexible matching on time (e.g., "10:30" or "10:30 AM")
        cursor.execute("""
            SELECT id, time_slot, is_booked 
            FROM slots 
            WHERE doctor_id = ? AND date = ? AND (time_slot LIKE ? OR time_slot = ?)
        """, (doc_id, target_date, f"%{time_slot.strip()}%", time_slot.strip()))
        slot = cursor.fetchone()
        
        if not slot:
            # If exact slot not found, find first open slot on that date for this doctor
            cursor.execute("""
                SELECT id, time_slot, is_booked 
                FROM slots 
                WHERE doctor_id = ? AND date = ? AND is_booked = 0 
                ORDER BY time_slot ASC LIMIT 1
            """, (doc_id, target_date))
            slot = cursor.fetchone()
            
        if not slot:
            return {
                "success": False,
                "error": "NO_SLOTS_AVAILABLE",
                "voice_summary": f"Unfortunately, {doc_full_name} has no available slots on {target_date}. Would you like to check another date?"
            }
            
        if slot["is_booked"] == 1:
            return {
                "success": False,
                "error": "SLOT_ALREADY_BOOKED",
                "voice_summary": f"The {slot['time_slot']} slot for {doc_full_name} on {target_date} was just taken. Please choose another time."
            }
            
        slot_id = slot["id"]
        confirmed_time = slot["time_slot"]
        
        # Generate memorable appointment code
        code = f"APT-{random.randint(1000, 9999)}"
        
        # Mark slot as booked
        cursor.execute("UPDATE slots SET is_booked = 1 WHERE id = ?", (slot_id,))
        
        # Insert appointment record
        cursor.execute("""
            INSERT INTO appointments (
                appointment_code, doctor_id, slot_id, patient_phone, 
                patient_name, date, time_slot, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
        """, (code, doc_id, slot_id, clean_phone, patient_name or "Caller", target_date, confirmed_time))
        
        appointment_id = cursor.lastrowid
        
        voice_summary = (
            f"You are all set! Your appointment with {doc_full_name} on {target_date} at {confirmed_time} is confirmed. "
            f"Your confirmation code is {code}. We have linked this to your phone number {clean_phone}."
        )
        
        return {
            "success": True,
            "appointment_id": appointment_id,
            "appointment_code": code,
            "doctor_name": doc_full_name,
            "specialty": doctor["specialty"],
            "room_number": doctor["room_number"],
            "date": target_date,
            "time_slot": confirmed_time,
            "patient_phone": clean_phone,
            "patient_name": patient_name or "Caller",
            "voice_summary": voice_summary
        }

def cancel_appointment(
    patient_phone: str,
    appointment_id_or_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Tool 3: Cancels an existing appointment using the caller's phone number.
    Rule: Agent must have verified phone number with caller prior to cancelling.
    """
    clean_phone = normalize_phone(patient_phone)
    if len(clean_phone) < 7:
        return {
            "success": False,
            "error": "INVALID_PHONE",
            "voice_summary": f"The phone number provided ({patient_phone}) is invalid. Please specify a valid phone number."
        }
        
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Base query for active appointments for this phone number
        base_query = """
            SELECT 
                a.id, a.appointment_code, a.doctor_id, a.slot_id, 
                a.date, a.time_slot, a.status,
                d.name as doctor_name, d.specialty
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            WHERE a.patient_phone = ? AND a.status = 'confirmed'
        """
        
        appointment = None
        
        if appointment_id_or_date and appointment_id_or_date.strip():
            clean_arg = appointment_id_or_date.strip()
            if clean_arg.upper().startswith("APT-"):
                query = base_query + " AND UPPER(a.appointment_code) = ? ORDER BY a.date ASC, a.time_slot ASC LIMIT 1"
                cursor.execute(query, (clean_phone, clean_arg.upper()))
                appointment = cursor.fetchone()
            else:
                # Parse relative dates like 'tomorrow', 'today', or format strings
                parsed_dt = parse_relative_date(clean_arg)
                query = base_query + " AND (a.date = ? OR a.date = ? OR a.appointment_code LIKE ?) ORDER BY a.date ASC, a.time_slot ASC LIMIT 1"
                cursor.execute(query, (clean_phone, clean_arg, parsed_dt, f"%{clean_arg}%"))
                appointment = cursor.fetchone()

        # Fallback: If no match was found with the filter, or no filter was passed,
        # retrieve the caller's next upcoming confirmed appointment
        if not appointment:
            query = base_query + " ORDER BY a.date ASC, a.time_slot ASC LIMIT 1"
            cursor.execute(query, (clean_phone,))
            appointment = cursor.fetchone()
        
        if not appointment:
            return {
                "success": False,
                "error": "NOT_FOUND",
                "voice_summary": f"I could not find any active appointments booked under the phone number {clean_phone}."
            }
            
        apt_id = appointment["id"]
        slot_id = appointment["slot_id"]
        code = appointment["appointment_code"]
        doc_name = appointment["doctor_name"]
        apt_date = appointment["date"]
        apt_time = appointment["time_slot"]
        
        # Update appointment status to cancelled
        cursor.execute("""
            UPDATE appointments 
            SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (apt_id,))
        
        # Free up the slot so others can book it
        if slot_id:
            cursor.execute("UPDATE slots SET is_booked = 0 WHERE id = ?", (slot_id,))
            
        voice_summary = (
            f"Your appointment {code} with {doc_name} on {apt_date} at {apt_time} has been successfully cancelled. "
            f"The slot is now released. Can I help you with anything else today?"
        )
        
        return {
            "success": True,
            "appointment_id": apt_id,
            "appointment_code": code,
            "doctor_name": doc_name,
            "date": apt_date,
            "time_slot": apt_time,
            "patient_phone": clean_phone,
            "voice_summary": voice_summary
        }

def get_all_doctors() -> List[Dict[str, Any]]:
    """Fetch all doctors and their next upcoming slots."""
    today = date.today().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, specialty, department, bio, room_number, rating, phone
            FROM doctors ORDER BY name ASC
        """)
        doctors = [dict(row) for row in cursor.fetchall()]
        
        for doc in doctors:
            cursor.execute("""
                SELECT id, date, time_slot, is_booked 
                FROM slots 
                WHERE doctor_id = ? AND date >= ? 
                ORDER BY date, time_slot ASC LIMIT 6
            """, (doc["id"], today))
            doc["upcoming_slots"] = [dict(s) for s in cursor.fetchall()]
            
        return doctors

def get_all_appointments() -> List[Dict[str, Any]]:
    """Fetch all appointments ordered by recent."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                a.id, a.appointment_code, a.patient_phone, a.patient_name,
                a.date, a.time_slot, a.status, a.created_at, a.cancelled_at,
                d.name as doctor_name, d.specialty, d.room_number
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            ORDER BY a.created_at DESC
        """)
        return [dict(row) for row in cursor.fetchall()]
