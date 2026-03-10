export type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis?: string;
  medications: PrescriptionMedication[];
  notes?: string;
  followUp?: string;
};

export type PrescriptionMedication = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};
