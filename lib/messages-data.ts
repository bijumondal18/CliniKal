import type { Message } from "@/types/message";

export const messages: Message[] = [
  {
    id: "m1",
    threadId: "t1",
    senderType: "patient",
    senderId: "p1",
    senderName: "Sarah Chen",
    recipientId: "d1",
    recipientName: "Dr. Patel",
    subject: "Question about lab results",
    body: "Hi Dr. Patel, I received my CBC results in the portal. Could you please explain what the hemoglobin value means in my case? Thank you.",
    sentAt: "2025-03-09T14:30:00Z",
    read: true,
    relatedPatientId: "p1",
  },
  {
    id: "m2",
    threadId: "t1",
    senderType: "doctor",
    senderId: "d1",
    senderName: "Dr. Patel",
    recipientId: "p1",
    recipientName: "Sarah Chen",
    subject: "Re: Question about lab results",
    body: "Hi Sarah, Your hemoglobin of 13.2 g/dL is within the normal range for women (12–16 g/dL). It reflects good oxygen-carrying capacity. No action needed. We can discuss further at your next visit if you like.",
    sentAt: "2025-03-09T16:45:00Z",
    read: true,
    relatedPatientId: "p1",
  },
  {
    id: "m3",
    threadId: "t2",
    senderType: "doctor",
    senderId: "d1",
    senderName: "Dr. Patel",
    recipientId: "p2",
    recipientName: "James Wilson",
    subject: "Follow-up on lipid panel",
    body: "James, your lipid panel shows slightly elevated LDL. I recommend we schedule a follow-up in 6 weeks to discuss diet and possibly medication. Please book via the front desk or portal.",
    sentAt: "2025-03-02T09:00:00Z",
    read: true,
    relatedPatientId: "p2",
    relatedAppointmentId: "a2",
  },
  {
    id: "m4",
    threadId: "t3",
    senderType: "patient",
    senderId: "p4",
    senderName: "David Kim",
    recipientId: "d2",
    recipientName: "Dr. Lee",
    subject: "Chest X-ray report",
    body: "Dr. Lee, I saw the chest X-ray report is in. Is everything okay? When can we go over it?",
    sentAt: "2025-03-08T11:20:00Z",
    read: false,
    relatedPatientId: "p4",
  },
  {
    id: "m5",
    threadId: "t4",
    senderType: "clinic",
    senderId: "clinic",
    senderName: "Clinic Admin",
    recipientId: "p3",
    recipientName: "Maria Garcia",
    subject: "Appointment reminder - March 11",
    body: "This is a reminder for your appointment on March 11, 2025 at 2:00 PM with Dr. Patel. Please arrive 10 minutes early. Reply to confirm or reschedule.",
    sentAt: "2025-03-10T08:00:00Z",
    read: false,
    relatedPatientId: "p3",
    relatedAppointmentId: "a4",
  },
];

export function getMessagesForRecipient(recipientId: string): Message[] {
  return messages.filter((m) => m.recipientId === recipientId);
}

export function getMessagesByPatient(patientId: string): Message[] {
  return messages.filter((m) => m.relatedPatientId === patientId || m.senderId === patientId);
}

export function getMessageById(id: string): Message | undefined {
  return messages.find((m) => m.id === id);
}

export function getThreadMessages(threadId: string): Message[] {
  return messages.filter((m) => m.threadId === threadId).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}
