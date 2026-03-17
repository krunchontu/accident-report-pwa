import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';
import type { PassengerInfo } from '../../types/incident';

export function InjuryPassengers() {
  const navigate = useNavigate();
  const { currentIncident, updateInjuries } = useAccidentStore();
  const prefilled = useRef(false);

  if (!currentIncident) { navigate('/'); return null; }
  const injuries = currentIncident.injuries;
  const triage = currentIncident.triage;

  // Pre-fill from triage answers on first render (only if injuries fields are still at defaults)
  useEffect(() => {
    if (prefilled.current) return;
    prefilled.current = true;
    const updates: Partial<typeof injuries> = {};
    if (!injuries.anyInjuries && triage.anyInjuries === true) updates.anyInjuries = true;
    if (!injuries.ambulanceCalled && triage.ambulanceCalled) updates.ambulanceCalled = true;
    if (Object.keys(updates).length > 0) updateInjuries(updates);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const ynClass = (val: boolean, target: boolean) =>
    `flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-center ${val === target ? (target ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white') : 'border-gray-200 bg-white'}`;

  const addPassenger = () => {
    const passengers = [...injuries.passengers, { name: '', contactNumber: '', injured: false, injuryDescription: '' }];
    updateInjuries({ passengers, passengerCount: passengers.length });
  };

  const updatePassenger = (index: number, updates: Partial<PassengerInfo>) => {
    const passengers = injuries.passengers.map((p, i) => i === index ? { ...p, ...updates } : p);
    updateInjuries({ passengers });
  };

  const removePassenger = (index: number) => {
    const passengers = injuries.passengers.filter((_, i) => i !== index);
    updateInjuries({ passengers, passengerCount: passengers.length });
  };

  return (
    <StepWizard currentStep={7} totalSteps={8} stepLabel="Injuries & Passengers" onNext={() => navigate('/accident/summary')}>
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Any injuries to any party?</label>
          <div className="flex gap-2">
            <button onClick={() => updateInjuries({ anyInjuries: true })} className={ynClass(injuries.anyInjuries, true)}>Yes</button>
            <button onClick={() => updateInjuries({ anyInjuries: false })} className={ynClass(injuries.anyInjuries, false)}>No</button>
          </div>
        </div>

        {injuries.anyInjuries && (
          <>
            <div>
              <label className={labelClass}>Ambulance called?</label>
              <div className="flex gap-2">
                <button onClick={() => updateInjuries({ ambulanceCalled: true })} className={ynClass(injuries.ambulanceCalled, true)}>Yes</button>
                <button onClick={() => updateInjuries({ ambulanceCalled: false })} className={ynClass(injuries.ambulanceCalled, false)}>No</button>
              </div>
            </div>
            <div><label className={labelClass}>Hospital / Clinic Name</label><input className={inputClass} value={injuries.hospitalName} onChange={e => updateInjuries({ hospitalName: e.target.value })} /></div>
            <div><label className={labelClass}>Doctor's Name</label><input className={inputClass} value={injuries.doctorName} onChange={e => updateInjuries({ doctorName: e.target.value })} /></div>
          </>
        )}

        <div>
          <label className={labelClass}>All wearing seatbelts?</label>
          <div className="flex gap-2">
            <button onClick={() => updateInjuries({ allSeatbeltsWorn: true })} className={ynClass(injuries.allSeatbeltsWorn, true)}>Yes</button>
            <button onClick={() => updateInjuries({ allSeatbeltsWorn: false })} className={ynClass(injuries.allSeatbeltsWorn, false)}>No</button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Were all child passengers in approved child restraints?</label>
          <p className="text-xs text-gray-500 mb-2">Children below 1.35m must use an approved child seat/booster. Yes = properly restrained, No = not restrained (an offence that may affect liability).</p>
          <div className="flex gap-2">
            <button onClick={() => updateInjuries({ childSeatsUsed: true })} className={ynClass(injuries.childSeatsUsed as boolean, true)}>Yes</button>
            <button onClick={() => updateInjuries({ childSeatsUsed: false })} className={ynClass(injuries.childSeatsUsed as boolean, false)}>No</button>
            <button onClick={() => updateInjuries({ childSeatsUsed: null })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-center ${injuries.childSeatsUsed === null ? 'border-gray-400 bg-gray-200 text-gray-700' : 'border-gray-200 bg-white text-gray-400'}`}>No children</button>
          </div>
        </div>

        {/* Passengers */}
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Passengers in YOUR vehicle</h3>
          {injuries.passengers.map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-4 mb-3 space-y-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Passenger {i + 1}</span>
                <button onClick={() => removePassenger(i)} className="text-danger text-sm"><Trash2 size={14} /></button>
              </div>
              <input className={inputClass} value={p.name} onChange={e => updatePassenger(i, { name: e.target.value })} placeholder="Name" />
              <input className={inputClass} type="tel" value={p.contactNumber} onChange={e => updatePassenger(i, { contactNumber: e.target.value })} placeholder="Contact" />
              <div className="flex gap-2">
                <button onClick={() => updatePassenger(i, { injured: true })} className={ynClass(p.injured, true)}>Injured</button>
                <button onClick={() => updatePassenger(i, { injured: false })} className={ynClass(p.injured, false)}>Not Injured</button>
              </div>
              {p.injured && (
                <textarea className={inputClass} rows={2} value={p.injuryDescription} onChange={e => updatePassenger(i, { injuryDescription: e.target.value })} placeholder="Describe injuries" />
              )}
            </div>
          ))}
          <button onClick={addPassenger}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2">
            <Plus size={16} /> Add Passenger
          </button>
        </div>
      </div>
    </StepWizard>
  );
}
