import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '../db/database';
import type { Incident } from '../types/incident';

interface IncidentStore {
  incidents: Incident[];
  loaded: boolean;
  loadIncidents: () => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  getInProgressIncident: () => Incident | undefined;
}

export const useIncidentStore = create<IncidentStore>()(
  immer((set, get) => ({
    incidents: [],
    loaded: false,

    loadIncidents: async () => {
      const incidents = await db.incidents.orderBy('createdAt').reverse().toArray();
      set((state) => { state.incidents = incidents; state.loaded = true; });
    },

    deleteIncident: async (id) => {
      await db.incidents.delete(id);
      await db.photos.where('incidentId').equals(id).delete();
      set((state) => { state.incidents = state.incidents.filter(i => i.id !== id); });
    },

    getInProgressIncident: () => {
      return get().incidents.find(i => i.status === 'in_progress');
    },
  }))
);
