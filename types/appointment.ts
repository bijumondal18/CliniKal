export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type Appointment = {
  id: string;
  /** Serial token number for the visit (usually per-day) */
  tokenNumber?: number;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: "checkup" | "follow-up" | "consultation" | "procedure" | "other";
  status: AppointmentStatus;
  doctor?: string;
  doctorId?: string;
  notes?: string;
};
