export type ReportType = "lab" | "imaging" | "pathology" | "other";

export type Report = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  type: ReportType;
  title: string;
  date: string;
  summary?: string;
  findings?: string;
  fileUrl?: string;
  status: "pending" | "available" | "reviewed";
};
