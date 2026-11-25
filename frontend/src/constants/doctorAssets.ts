export interface DoctorMeta {
  avatar_url: string;
  experience: string;
  education: string;
  department_key: 'cardiology' | 'dermatology' | 'pediatrics' | 'orthopedics' | 'neurology';
  color: string;
  badge: string;
}

export const DOCTOR_METAS: Record<string, DoctorMeta> = {
  "Dr. Sarah Jenkins": {
    avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    experience: "14+ Years",
    education: "MD • Harvard Medical School",
    department_key: "cardiology",
    color: "from-rose-500 to-pink-600",
    badge: "Chief Cardiologist"
  },
  "Dr. Marcus Vance": {
    avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    experience: "11+ Years",
    education: "MD • Johns Hopkins University",
    department_key: "dermatology",
    color: "from-amber-500 to-orange-600",
    badge: "Dermatology Fellow"
  },
  "Dr. Emily Chen": {
    avatar_url: "https://images.unsplash.com/photo-1594824813589-a5c3783c18ff?auto=format&fit=crop&q=80&w=400",
    experience: "9+ Years",
    education: "MD • Stanford Medicine",
    department_key: "pediatrics",
    color: "from-emerald-500 to-teal-600",
    badge: "Pediatric Specialist"
  },
  "Dr. Neil Patel": {
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    experience: "12+ Years",
    education: "MS, Ortho • Columbia University",
    department_key: "orthopedics",
    color: "from-blue-500 to-indigo-600",
    badge: "Sports & Spine Surgeon"
  },
  "Dr. Alena Rostova": {
    avatar_url: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
    experience: "16+ Years",
    education: "MD, PhD • Yale School of Medicine",
    department_key: "neurology",
    color: "from-purple-500 to-violet-600",
    badge: "Senior Neurologist"
  }
};

export const CLARA_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400";
