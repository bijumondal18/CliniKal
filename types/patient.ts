export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  bloodType?: string;
  address?: string;
  lastVisit?: string;
  notes?: string;
};
