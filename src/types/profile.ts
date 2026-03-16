export interface UserProfile {
  id: string;
  fullName: string;
  nricFin: string;
  contactNumber: string;
  email: string;
  address: string;
  licenceNumber: string;
  licenceClass: string;
  licenceExpiryDate: string;
  yearsPassed: number;
  hasSpectacleCondition: boolean;
  medicalConditions: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleProfile {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  engineChassisNumber: string;
  roadTaxExpiry: string;
  lastInspectionDate: string;
  ownership: "own" | "rent" | "lease" | "company";
  modifications: string;
}

export interface InsuranceProfile {
  id: string;
  vehicleId: string;
  insurerName: string;
  policyNumber: string;
  policyType: "comprehensive" | "tpft" | "tpo";
  policyExpiry: string;
  driverType: "named" | "any";
  excessAmount: number;
  youngDriverExcess: number;
  ncdPercentage: number;
  claimsHotline: string;
  workshopType: "authorised" | "own";
  workshopPanel: string;
  namedDrivers: string[];
  minDriverAge: number | null;
  minDrivingExperience: number | null;
}

export interface FamilyDriver {
  id: string;
  fullName: string;
  nricFin: string;
  licenceClass: string;
  relationship: string;
}
