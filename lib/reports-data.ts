import type { Report } from "@/types/report";

export const reports: Report[] = [
  {
    id: "r1",
    patientId: "p1",
    patientName: "Sarah Chen",
    doctorId: "d1",
    doctorName: "Dr. Patel",
    type: "lab",
    title: "Complete Blood Count (CBC)",
    date: "2025-02-15",
    summary: "Routine CBC. All parameters within normal range.",
    findings: "Hb: 13.2 g/dL, WBC: 7.1 K/µL, Platelets: 245 K/µL.",
    status: "reviewed",
  },
  {
    id: "r2",
    patientId: "p2",
    patientName: "James Wilson",
    doctorId: "d1",
    doctorName: "Dr. Patel",
    type: "lab",
    title: "Lipid Panel",
    date: "2025-03-01",
    summary: "Fasting lipid profile. LDL slightly elevated.",
    findings: "Total Chol: 218 mg/dL, LDL: 142 mg/dL, HDL: 48 mg/dL, TG: 135 mg/dL.",
    status: "reviewed",
  },
  {
    id: "r3",
    patientId: "p4",
    patientName: "David Kim",
    doctorId: "d2",
    doctorName: "Dr. Lee",
    type: "imaging",
    title: "Chest X-Ray",
    date: "2025-03-05",
    summary: "PA and lateral views. No acute cardiopulmonary findings.",
    findings: "Heart size normal. Lungs clear. No pleural effusion.",
    status: "reviewed",
  },
  {
    id: "r4",
    patientId: "p1",
    patientName: "Sarah Chen",
    doctorId: "d1",
    doctorName: "Dr. Patel",
    type: "lab",
    title: "Thyroid Function (TSH, T4)",
    date: "2025-03-10",
    summary: "Thyroid panel ordered for annual checkup.",
    status: "pending",
  },
  {
    id: "r5",
    patientId: "p3",
    patientName: "Maria Garcia",
    doctorId: "d3",
    doctorName: "Dr. Brown",
    type: "pathology",
    title: "Skin Biopsy - Left Forearm",
    date: "2024-12-20",
    summary: "Benign dermatological finding.",
    findings: "Consistent with benign nevus. No malignancy.",
    status: "reviewed",
  },
];

export function getReportsByPatientId(patientId: string): Report[] {
  return reports.filter((r) => r.patientId === patientId);
}

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}
