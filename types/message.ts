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
