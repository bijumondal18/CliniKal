export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type Appointment = {
  id: string;
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
