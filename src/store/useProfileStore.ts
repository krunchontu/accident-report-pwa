import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/database';
import type { UserProfile, VehicleProfile, InsuranceProfile, FamilyDriver } from '../types/profile';

interface ProfileState {
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
  insurance: InsuranceProfile | null;
  familyDrivers: FamilyDriver[];
  setupComplete: boolean;
  loaded: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  saveVehicle: (vehicle: VehicleProfile) => Promise<void>;
  saveInsurance: (insurance: InsuranceProfile) => Promise<void>;
  saveFamilyDrivers: (drivers: FamilyDriver[]) => Promise<void>;
  setSetupComplete: (complete: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
  immer((set) => ({
    profile: null,
    vehicle: null,
    insurance: null,
    familyDrivers: [],
    setupComplete: false,
    loaded: false,

    loadProfile: async () => {
      try {
        const profiles = await db.profiles.toArray();
        const vehicles = await db.vehicles.toArray();
        const insurances = await db.insurance.toArray();
        const drivers = await db.familyDrivers.toArray();
        const setupDone = localStorage.getItem('setupComplete') === 'true';
        set((state) => {
          state.profile = profiles[0] || null;
          state.vehicle = vehicles[0] || null;
          state.insurance = insurances[0] || null;
          state.familyDrivers = drivers;
          state.setupComplete = setupDone;
          state.loaded = true;
        });
      } catch {
        set((state) => { state.loaded = true; });
      }
    },

    saveProfile: async (profile) => {
      await db.profiles.put(profile);
      set((state) => { state.profile = profile; });
    },

    saveVehicle: async (vehicle) => {
      await db.vehicles.put(vehicle);
      set((state) => { state.vehicle = vehicle; });
    },

    saveInsurance: async (insurance) => {
      await db.insurance.put(insurance);
      set((state) => { state.insurance = insurance; });
    },

    saveFamilyDrivers: async (drivers) => {
      await db.familyDrivers.clear();
      await db.familyDrivers.bulkPut(drivers);
      set((state) => { state.familyDrivers = drivers; });
    },

    setSetupComplete: (complete) => {
      localStorage.setItem('setupComplete', String(complete));
      set((state) => { state.setupComplete = complete; });
    },
  }))
);
