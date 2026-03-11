export type MessageSender = "doctor" | "patient" | "clinic";

export type Message = {
  id: string;
  threadId: string;
  senderType: MessageSender;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject?: string;
  body: string;
  sentAt: string;
  read: boolean;
  relatedPatientId?: string;
  relatedAppointmentId?: string;
};

/** Message sent by clinic to a doctor or patient (Firestore messages collection) */
export type SentBy = "clinic" | "doctor" | "patient";

export type ClinicMessage = {
  id: string;
  userId: string;
  sentBy: SentBy;
  recipientType: "doctor" | "patient";
  recipientId: string;
  recipientName: string;
  text: string;
  createdAt: string;
  sendViaWhatsApp?: boolean;
  sendViaSms?: boolean;
  sendViaEmail?: boolean;
};
