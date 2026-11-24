import sqlite3
from typing import Generator
from contextlib import contextmanager
from app.config import settings

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Doctors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                department TEXT NOT NULL,
                bio TEXT,
                room_number TEXT,
                rating REAL DEFAULT 4.9,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Doctor slots table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctor_id INTEGER NOT NULL,
                date TEXT NOT NULL, -- Format: YYYY-MM-DD
                time_slot TEXT NOT NULL, -- e.g. "09:00 AM", "10:30 AM"
                is_booked INTEGER DEFAULT 0, -- 0 = available, 1 = booked
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
            )
        """)
        
        # Appointments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                appointment_code TEXT UNIQUE NOT NULL, -- e.g. "APT-1042"
                doctor_id INTEGER NOT NULL,
                slot_id INTEGER,
                patient_phone TEXT NOT NULL,
                patient_name TEXT DEFAULT 'Caller',
                date TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                status TEXT DEFAULT 'confirmed', -- confirmed, cancelled
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                cancelled_at TIMESTAMP,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
                FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE SET NULL
            )
        """)
        
        # Indices for fast queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_slots_doc_date ON slots(doctor_id, date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(patient_phone)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)")
