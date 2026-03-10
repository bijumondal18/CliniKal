import type { Patient } from "@/types/patient";
import type { Appointment } from "@/types/appointment";

export const patients: Patient[] = [
  {
    id: "p1",
    firstName: "Sarah",
    lastName: "Chen",
    dateOfBirth: "1985-03-12",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 234-5678",
    gender: "female",
    bloodType: "O+",
    lastVisit: "2025-02-15",
    notes: "Annual checkup due March.",
  },
  {
    id: "p2",
    firstName: "James",
    lastName: "Wilson",
    dateOfBirth: "1972-08-22",
    email: "j.wilson@email.com",
    phone: "+1 (555) 891-2345",
    gender: "male",
    bloodType: "A-",
    lastVisit: "2025-03-01",
  },
  {
    id: "p3",
    firstName: "Maria",
    lastName: "Garcia",
    dateOfBirth: "1991-11-05",
    email: "maria.g@email.com",
    phone: "+1 (555) 456-7890",
    gender: "female",
    lastVisit: "2024-12-20",
  },
  {
    id: "p4",
    firstName: "David",
    lastName: "Kim",
    dateOfBirth: "1968-01-30",
    email: "david.kim@email.com",
    phone: "+1 (555) 678-9012",
    gender: "male",
    bloodType: "B+",
    lastVisit: "2025-03-08",
  },
  {
    id: "p5",
    firstName: "Emily",
    lastName: "Rodriguez",
    dateOfBirth: "1995-07-18",
    email: "emily.r@email.com",
    phone: "+1 (555) 321-6549",
    gender: "female",
    lastVisit: "2025-02-28",
  },
];

export const appointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Sarah Chen",
    date: "2025-03-10",
    time: "09:00",
    type: "checkup",
    status: "scheduled",
    doctor: "Dr. Patel",
    notes: "Annual physical.",
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "James Wilson",
    date: "2025-03-10",
    time: "10:30",
    type: "follow-up",
    status: "confirmed",
    doctor: "Dr. Patel",
    notes: "Blood pressure follow-up.",
  },
  {
    id: "a3",
    patientId: "p4",
    patientName: "David Kim",
    date: "2025-03-10",
    time: "11:00",
    type: "consultation",
    status: "scheduled",
    doctor: "Dr. Lee",
  },
  {
    id: "a4",
    patientId: "p3",
    patientName: "Maria Garcia",
    date: "2025-03-11",
    time: "14:00",
    type: "checkup",
    status: "scheduled",
    doctor: "Dr. Patel",
  },
  {
    id: "a5",
    patientId: "p5",
    patientName: "Emily Rodriguez",
    date: "2025-03-09",
    time: "15:30",
    type: "follow-up",
    status: "completed",
    doctor: "Dr. Lee",
  },
];

export function getAppointmentsByDate(date: string): Appointment[] {
  return appointments.filter((a) => a.date === date);
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function getAppointmentsForPatient(patientId: string): Appointment[] {
  return appointments.filter((a) => a.patientId === patientId);
}
