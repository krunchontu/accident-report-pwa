export interface EligibilityCheck {
  hasValidLicence: boolean | null;
  correctLicenceClass: boolean | null;
  licenceExpired: boolean | null;
  onSuspension: boolean | null;
  pdlWithInstructor: boolean | null;
  spectaclesWorn: boolean | null;
  yearsSincePassing: number | null;
  demeritPoints: string;
  underAlcohol: boolean | null;
  underDrugs: boolean | null;
  usingPhone: boolean | null;
  fatigued: boolean | null;
  undeclaredMedical: boolean | null;
  sleepDeprived: boolean | null;
  isOwner: boolean | null;
  ownerConsent: boolean | null;
  vehicleType: "own" | "rent" | "lease" | "company" | null;
  rentalInsuranceCovered: boolean | null;
  corporatePolicyCovered: boolean | null;
  hasInsurance: boolean | null;
  insuranceExpired: boolean | null;
  coverageType: "comprehensive" | "tpft" | "tpo" | null;
  isNamedDriver: boolean | null;
  meetsAgeRequirement: boolean | null;
  meetsExperienceRequirement: boolean | null;
  excessAmount: number | null;
  knownExclusions: string;
  roadTaxValid: boolean | null;
  inspectionPassed: boolean | null;
  unauthorisedMods: boolean | null;
  correctFuelType: boolean | null;
  safetyFeaturesOk: boolean | null;
  tyresLegal: boolean | null;
  correctUsage: boolean | null;
  doingRideHailing: boolean | null;
  doingDelivery: boolean | null;
  exceedingCapacity: boolean | null;
  towing: boolean | null;
  illegallyParked: boolean | null;
}

export type EligibilityScore = "green" | "amber" | "red";

export interface EligibilityRule {
  field: keyof EligibilityCheck;
  failValue: boolean | number | string | null;
  severity: EligibilityScore;
  consequence: string;
  category: string;
}
