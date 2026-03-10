import type { Prescription } from "@/types/prescription";

export const prescriptions: Prescription[] = [
  {
    id: "rx1",
    patientId: "p1",
    patientName: "Sarah Chen",
    doctorId: "d1",
    doctorName: "Dr. Patel",
    date: "2025-02-15",
    diagnosis: "Routine wellness, no acute issues",
    medications: [
      { name: "Multivitamin (OTC)", dosage: "1 tablet", frequency: "Once daily", duration: "Ongoing", instructions: "Take with food." },
    ],
    notes: "Continue healthy diet and exercise.",
    followUp: "Annual checkup in 1 year.",
  },
  {
    id: "rx2",
    patientId: "p2",
    patientName: "James Wilson",
    doctorId: "d1",
    doctorName: "Dr. Patel",
    date: "2025-03-01",
    diagnosis: "Hypertension, elevated LDL",
    medications: [
      { name: "Lisinopril", dosage: "10 mg", frequency: "Once daily", duration: "Ongoing", instructions: "Take in the morning." },
      { name: "Atorvastatin", dosage: "20 mg", frequency: "Once daily at night", duration: "Ongoing", instructions: "Take with dinner." },
    ],
    notes: "Low-sodium diet. Recheck BP and lipids in 6 weeks.",
    followUp: "Follow-up in 6 weeks for lipid and BP check.",
  },
  {
    id: "rx3",
    patientId: "p4",
    patientName: "David Kim",
    doctorId: "d2",
    doctorName: "Dr. Lee",
    date: "2025-03-05",
    diagnosis: "Chest pain evaluation – musculoskeletal",
    medications: [
      { name: "Ibuprofen", dosage: "400 mg", frequency: "Every 6 hours as needed", duration: "5 days", instructions: "Take with food. Do not exceed 1200 mg/day." },
    ],
    notes: "Chest X-ray and ECG unremarkable. Reassure. Avoid heavy lifting for 1 week.",
    followUp: "Return if pain worsens or persists beyond 1 week.",
  },
  {
    id: "rx4",
    patientId: "p5",
    patientName: "Emily Rodriguez",
    doctorId: "d2",
    doctorName: "Dr. Lee",
    date: "2025-03-09",
    diagnosis: "Follow-up hypertension – well controlled",
    medications: [
      { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily", duration: "Ongoing" },
    ],
    notes: "BP 118/76 today. Continue current regimen.",
    followUp: "Routine follow-up in 3 months.",
  },
  {
    id: "rx5",
    patientId: "p3",
    patientName: "Maria Garcia",
    doctorId: "d3",
    doctorName: "Dr. Brown",
    date: "2024-12-20",
    diagnosis: "Upper respiratory infection",
    medications: [
      { name: "Amoxicillin", dosage: "500 mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete full course." },
      { name: "Acetaminophen", dosage: "500 mg", frequency: "Every 6 hours as needed", duration: "As needed for fever/pain" },
    ],
    notes: "Benign skin lesion biopsy done; results discussed. No further action.",
    followUp: "None unless symptoms return.",
  },
];

export function getPrescriptionsByPatientId(patientId: string): Prescription[] {
  return prescriptions.filter((rx) => rx.patientId === patientId);
}

export function getPrescriptionById(id: string): Prescription | undefined {
  return prescriptions.find((rx) => rx.id === id);
}
