/**
 * Clinic document ID prefixes and next-ID generator.
 * Formats: CP001, CD001, CS001, CA001, CPR001, CR001
 */
export const CLINIC_ID_PREFIX = {
  PATIENT: "CP",
  DOCTOR: "CD",
  STAFF: "CS",
  APPOINTMENT: "CA",
  PRESCRIPTION: "CPR",
  REPORT: "CR",
} as const;

const PAD_LEN = 3;

/**
 * Returns the next ID for a given prefix (e.g. CP001, CP002).
 * Uses existing IDs from the same type to compute the next number.
 */
export function getNextClinicId(prefix: string, existingIds: string[]): string {
  let maxNum = 0;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const numPart = id.slice(prefix.length);
    const num = parseInt(numPart, 10);
    if (!Number.isNaN(num) && num > maxNum) maxNum = num;
  }
  const next = maxNum + 1;
  return prefix + String(next).padStart(PAD_LEN, "0");
}
