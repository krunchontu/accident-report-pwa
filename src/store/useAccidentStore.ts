import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/database';
import type { Incident, OtherParty, Witness, DeadlineStatus } from '../types/incident';
import type { EligibilityCheck } from '../types/eligibility';
import { DEADLINES } from '../constants/deadlines';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 300;

function createEmptyEligibility(): EligibilityCheck {
  return {
    hasValidLicence: null, correctLicenceClass: null, licenceExpired: null,
    onSuspension: null, pdlWithInstructor: null, spectaclesWorn: null,
    yearsSincePassing: null, demeritPoints: '',
    underAlcohol: null, underDrugs: null, usingPhone: null,
    fatigued: null, undeclaredMedical: null, sleepDeprived: null,
    isOwner: null, ownerConsent: null, vehicleType: null,
    rentalInsuranceCovered: null, corporatePolicyCovered: null,
    hasInsurance: null, insuranceExpired: null, coverageType: null,
    isNamedDriver: null, meetsAgeRequirement: null, meetsExperienceRequirement: null,
    excessAmount: null, knownExclusions: '',
    roadTaxValid: null, inspectionPassed: null, unauthorisedMods: null,
    correctFuelType: null, safetyFeaturesOk: null, tyresLegal: null,
    correctUsage: null, doingRideHailing: null, doingDelivery: null,
    exceedingCapacity: null, towing: null, illegallyParked: null,
  };
}

function createNewIncident(): Incident {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const deadlines: DeadlineStatus[] = DEADLINES.map(d => ({
    id: d.id, label: d.label, description: d.description,
    deadlineHours: d.deadlineHours, completed: false, completedAt: null,
  }));

  return {
    id, status: 'in_progress', createdAt: now, completedAt: null,
    scene: {
      dateTime: now,
      location: { latitude: 0, longitude: 0, address: '', roadName: '' },
      weather: 'clear', weatherOther: '',
      roadCondition: 'dry', roadConditionOther: '',
      trafficCondition: 'light', speedLimit: '', description: '',
    },
    triage: { anyInjuries: null, ambulanceCalled: false, policeCalled: false, vehiclesMoved: false },
    otherParties: [],
    eligibility: createEmptyEligibility(),
    witnesses: [],
    injuries: {
      anyInjuries: false, ambulanceCalled: false, hospitalName: '', doctorName: '',
      passengerCount: 0, allSeatbeltsWorn: true, childSeatsUsed: null, passengers: [],
    },
    sketchDataUrl: null,
    driverSignature: null, otherPartySignature: null,
    deadlines, additionalNotes: '',
  };
}

interface AccidentState {
  currentIncident: Incident | null;
  currentStep: number;
  lastRoute: string | null;
  startNewIncident: () => Promise<Incident>;
  loadIncident: (id: string) => Promise<void>;
  updateScene: (updates: Partial<Incident['scene']>) => void;
  updateTriage: (updates: Partial<Incident['triage']>) => void;
  updateLocation: (lat: number, lng: number, address?: string, roadName?: string) => void;
  addOtherParty: (party: OtherParty) => void;
  updateOtherParty: (id: string, updates: Partial<OtherParty>) => void;
  removeOtherParty: (id: string) => void;
  updateEligibility: (updates: Partial<EligibilityCheck>) => void;
  addWitness: (witness: Witness) => void;
  updateWitness: (id: string, updates: Partial<Witness>) => void;
  removeWitness: (id: string) => void;
  updateInjuries: (updates: Partial<Incident['injuries']>) => void;
  setSketch: (dataUrl: string) => void;
  setDriverSignature: (dataUrl: string) => void;
  setOtherPartySignature: (dataUrl: string) => void;
  updateDeadline: (id: string, completed: boolean) => void;
  setAdditionalNotes: (notes: string) => void;
  setCurrentStep: (step: number) => void;
  setLastRoute: (route: string) => void;
  saveToDb: () => Promise<void>;
  completeIncident: () => Promise<void>;
}

export const useAccidentStore = create<AccidentState>()(
  immer((set, get) => ({
    currentIncident: null,
    currentStep: 0,
    lastRoute: null,

    startNewIncident: async () => {
      const incident = createNewIncident();
      await db.incidents.put(incident);
      set((state) => { state.currentIncident = incident; state.currentStep = 0; });
      return incident;
    },

    loadIncident: async (id) => {
      const incident = await db.incidents.get(id);
      if (incident) set((state) => { state.currentIncident = incident; state.currentStep = 0; });
    },

    updateScene: (updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        Object.assign(state.currentIncident.scene, updates);
      });
      get().saveToDb();
    },

    updateTriage: (updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        Object.assign(state.currentIncident.triage, updates);
      });
      get().saveToDb();
    },

    updateLocation: (lat, lng, address, roadName) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.scene.location.latitude = lat;
        state.currentIncident.scene.location.longitude = lng;
        if (address) state.currentIncident.scene.location.address = address;
        if (roadName) state.currentIncident.scene.location.roadName = roadName;
      });
      get().saveToDb();
    },

    addOtherParty: (party) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.otherParties.push(party);
      });
      get().saveToDb();
    },

    updateOtherParty: (id, updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        const idx = state.currentIncident.otherParties.findIndex(p => p.id === id);
        if (idx >= 0) Object.assign(state.currentIncident.otherParties[idx], updates);
      });
      get().saveToDb();
    },

    removeOtherParty: (id) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.otherParties = state.currentIncident.otherParties.filter(p => p.id !== id);
      });
      get().saveToDb();
    },

    updateEligibility: (updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        Object.assign(state.currentIncident.eligibility, updates);
      });
      get().saveToDb();
    },

    addWitness: (witness) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.witnesses.push(witness);
      });
      get().saveToDb();
    },

    updateWitness: (id, updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        const idx = state.currentIncident.witnesses.findIndex(w => w.id === id);
        if (idx >= 0) Object.assign(state.currentIncident.witnesses[idx], updates);
      });
      get().saveToDb();
    },

    removeWitness: (id) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.witnesses = state.currentIncident.witnesses.filter(w => w.id !== id);
      });
      get().saveToDb();
    },

    updateInjuries: (updates) => {
      set((state) => {
        if (!state.currentIncident) return;
        Object.assign(state.currentIncident.injuries, updates);
      });
      get().saveToDb();
    },

    setSketch: (dataUrl) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.sketchDataUrl = dataUrl;
      });
      get().saveToDb();
    },

    setDriverSignature: (dataUrl) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.driverSignature = dataUrl;
      });
      get().saveToDb();
    },

    setOtherPartySignature: (dataUrl) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.otherPartySignature = dataUrl;
      });
      get().saveToDb();
    },

    updateDeadline: (id, completed) => {
      set((state) => {
        if (!state.currentIncident) return;
        const dl = state.currentIncident.deadlines.find(d => d.id === id);
        if (dl) {
          dl.completed = completed;
          dl.completedAt = completed ? new Date().toISOString() : null;
        }
      });
      get().saveToDb();
    },

    setAdditionalNotes: (notes) => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.additionalNotes = notes;
      });
      get().saveToDb();
    },

    setCurrentStep: (step) => {
      set((state) => { state.currentStep = step; });
    },

    setLastRoute: (route) => {
      set((state) => { state.lastRoute = route; });
    },

    saveToDb: async () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const incident = get().currentIncident;
        if (incident) {
          try {
            await db.incidents.put(structuredClone(incident));
          } catch (err) {
            console.error('Failed to save incident to IndexedDB:', err);
          }
        }
      }, SAVE_DEBOUNCE_MS);
    },

    completeIncident: async () => {
      set((state) => {
        if (!state.currentIncident) return;
        state.currentIncident.status = 'completed';
        state.currentIncident.completedAt = new Date().toISOString();
      });
      // Flush immediately — don't debounce completion
      if (saveTimer) clearTimeout(saveTimer);
      const incident = get().currentIncident;
      if (incident) {
        try {
          await db.incidents.put(structuredClone(incident));
        } catch (err) {
          console.error('Failed to save completed incident:', err);
        }
      }
    },
  }))
);
