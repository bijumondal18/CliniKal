export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specializations: string[];
  qualification: string;
  consultationFee: number;
  phone: string;
  email: string;
  schedule: DoctorScheduleSlot[];
  bio?: string;
  profilePhoto?: string;
};

export type DoctorScheduleSlot = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  startTime: string;
  endTime: string;
  slotMinutes?: number;
};
