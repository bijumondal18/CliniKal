import type { Doctor } from "@/types/doctor";

export const doctors: Doctor[] = [
  {
    id: "d1",
    firstName: "Raj",
    lastName: "Patel",
    title: "MD",
    specializations: ["General Medicine", "Internal Medicine", "Preventive Care"],
    qualification: "MBBS, MD (Internal Medicine)",
    consultationFee: 150,
    phone: "+1 (555) 100-2000",
    email: "dr.patel@clinic.com",
    schedule: [
      { day: "mon", startTime: "09:00", endTime: "13:00", slotMinutes: 30 },
      { day: "wed", startTime: "09:00", endTime: "13:00", slotMinutes: 30 },
      { day: "fri", startTime: "14:00", endTime: "18:00", slotMinutes: 30 },
    ],
    bio: "Over 15 years of experience in general and internal medicine.",
  },
  {
    id: "d2",
    firstName: "Jennifer",
    lastName: "Lee",
    title: "MD",
    specializations: ["Cardiology", "Hypertension", "Preventive Cardiology"],
    qualification: "MBBS, MD (Cardiology), FACC",
    consultationFee: 200,
    phone: "+1 (555) 100-2001",
    email: "dr.lee@clinic.com",
    schedule: [
      { day: "tue", startTime: "10:00", endTime: "16:00", slotMinutes: 45 },
      { day: "thu", startTime: "10:00", endTime: "16:00", slotMinutes: 45 },
    ],
    bio: "Board-certified cardiologist with focus on hypertension and preventive care.",
  },
  {
    id: "d3",
    firstName: "Michael",
    lastName: "Brown",
    title: "DO",
    specializations: ["Family Medicine", "Pediatrics", "Minor Procedures"],
    qualification: "DO, Board Certified Family Medicine",
    consultationFee: 120,
    phone: "+1 (555) 100-2002",
    email: "dr.brown@clinic.com",
    schedule: [
      { day: "mon", startTime: "14:00", endTime: "18:00", slotMinutes: 20 },
      { day: "tue", startTime: "09:00", endTime: "12:00", slotMinutes: 20 },
      { day: "sat", startTime: "09:00", endTime: "13:00", slotMinutes: 20 },
    ],
    bio: "Family physician with same-day appointments and minor procedure availability.",
  },
];

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}
