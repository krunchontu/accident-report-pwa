import type { EligibilityCheck } from './eligibility';

export interface Incident {
  id: string;
  status: "in_progress" | "completed";
  createdAt: string;
  completedAt: string | null;
  scene: {
    dateTime: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
      roadName: string;
    };
    weather: "clear" | "rain" | "heavy_rain" | "overcast" | "night" | "fog" | "other";
    weatherOther: string;
    roadCondition: "dry" | "wet" | "flooded" | "oily" | "debris" | "other";
    roadConditionOther: string;
    trafficCondition: "light" | "moderate" | "heavy" | "stationary";
    speedLimit: string;
    description: string;
  };
  triage: {
    anyInjuries: boolean | null;
    ambulanceCalled: boolean;
    policeCalled: boolean;
    vehiclesMoved: boolean;
  };
  photos: IncidentPhoto[];
  otherParties: OtherParty[];
  eligibility: EligibilityCheck;
  witnesses: Witness[];
  injuries: {
    anyInjuries: boolean;
    ambulanceCalled: boolean;
    hospitalName: string;
    doctorName: string;
    passengerCount: number;
    allSeatbeltsWorn: boolean;
    childSeatsUsed: boolean | null;
    passengers: PassengerInfo[];
  };
  sketchDataUrl: string | null;
  driverSignature: string | null;
  otherPartySignature: string | null;
  deadlines: DeadlineStatus[];
  additionalNotes: string;
}

export interface IncidentPhoto {
  id: string;
  incidentId: string;
  promptId: string;
  blob: Blob;
  thumbnail: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  compassHeading: number | null;
  caption: string;
}

export interface OtherParty {
  id: string;
  isForeignVehicle: boolean;
  driverName: string;
  idNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  vehicleColour: string;
  licenceNumber: string;
  licenceClass: string;
  insurerName: string;
  policyNumber: string;
  isVehicleOwner: boolean;
  ownerName: string;
  ownerContact: string;
  visibleDamage: string;
  foreign: ForeignVehicleDetails | null;
}

export interface ForeignVehicleDetails {
  nationality: string;
  idType: "mykad" | "passport" | "other";
  homeAddress: string;
  sgContactNumber: string;
  countryOfRegistration: string;
  foreignLicenceValid: boolean | null;
  foreignLicenceClass: string;
  foreignLicenceType: string;
  foreignLicenceExpired: boolean | null;
  hasVEP: boolean | null;
  hasAutopassCard: boolean | null;
  entryCheckpoint: "woodlands" | "tuas" | "unknown";
  hasSGInsuranceCover: boolean | null;
  insuranceType: "my_sg_extension" | "border_insurance" | "separate_sg_policy" | "none" | "unknown";
  foreignInsurerName: string;
  foreignPolicyNumber: string;
  foreignPolicyExpiry: string;
  hasSGClaimsAgent: boolean | null;
  sgClaimsAgentDetails: string;
  isUninsured: boolean;
  isHitAndRun: boolean;
  fleeDirection: string;
  vehicleDescription: string;
  driverDescription: string;
}

export interface Witness {
  id: string;
  fullName: string;
  contactNumber: string;
  statement: string;
}

export interface PassengerInfo {
  name: string;
  contactNumber: string;
  injured: boolean;
  injuryDescription: string;
}

export interface DeadlineStatus {
  id: string;
  label: string;
  description: string;
  deadlineHours: number;
  completed: boolean;
  completedAt: string | null;
}
