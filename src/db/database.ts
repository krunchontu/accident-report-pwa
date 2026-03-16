import Dexie, { type Table } from 'dexie';
import type { UserProfile, VehicleProfile, InsuranceProfile, FamilyDriver } from '../types/profile';
import type { Incident, IncidentPhoto } from '../types/incident';

export class AccidentKakiDB extends Dexie {
  profiles!: Table<UserProfile>;
  vehicles!: Table<VehicleProfile>;
  insurance!: Table<InsuranceProfile>;
  familyDrivers!: Table<FamilyDriver>;
  incidents!: Table<Incident>;
  photos!: Table<IncidentPhoto>;

  constructor() {
    super('AccidentKakiDB');
    this.version(1).stores({
      profiles: 'id, updatedAt',
      vehicles: 'id, registrationNumber',
      insurance: 'id, vehicleId, policyExpiry',
      familyDrivers: 'id',
      incidents: 'id, status, createdAt',
      photos: 'id, incidentId, promptId',
    });
  }
}

export const db = new AccidentKakiDB();
