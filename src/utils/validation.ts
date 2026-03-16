const NRIC_REGEX = /^[STFGM]\d{7}[A-Z]$/;
const SG_PHONE_REGEX = /^[689]\d{7}$/;
const VEHICLE_REG_REGEX = /^[A-Z]{1,3}\d{1,4}[A-Z]$/;

export function isValidNRIC(value: string): boolean {
  return NRIC_REGEX.test(value.toUpperCase().trim());
}

export function isValidSGPhone(value: string): boolean {
  return SG_PHONE_REGEX.test(value.replace(/\s/g, ''));
}

export function isValidVehicleReg(value: string): boolean {
  return VEHICLE_REG_REGEX.test(value.toUpperCase().trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getValidationError(field: string, value: string): string | null {
  if (!value.trim()) return null; // Don't validate empty — optional until submit
  switch (field) {
    case 'nricFin':
      return isValidNRIC(value) ? null : 'Format: S1234567A';
    case 'contactNumber':
      return isValidSGPhone(value) ? null : 'SG mobile: 8 digits starting with 6/8/9';
    case 'email':
      return isValidEmail(value) ? null : 'Invalid email format';
    case 'registrationNumber':
      return isValidVehicleReg(value) ? null : 'Format: SBA1234X';
    default:
      return null;
  }
}
