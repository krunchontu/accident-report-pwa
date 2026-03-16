import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';
import type { OtherParty, ForeignVehicleDetails } from '../../types/incident';

function createEmptyParty(): OtherParty {
  return {
    id: crypto.randomUUID(), isForeignVehicle: false,
    driverName: '', idNumber: '', contactNumber: '', email: '', address: '',
    vehicleRegistration: '', vehicleMakeModel: '', vehicleColour: '',
    licenceNumber: '', licenceClass: '', insurerName: '', policyNumber: '',
    isVehicleOwner: true, ownerName: '', ownerContact: '', visibleDamage: '',
    foreign: null,
  };
}

function createEmptyForeign(): ForeignVehicleDetails {
  return {
    nationality: 'Malaysian', idType: 'mykad', homeAddress: '', sgContactNumber: '',
    countryOfRegistration: 'Malaysia',
    foreignLicenceValid: null, foreignLicenceClass: '', foreignLicenceType: 'CDL',
    foreignLicenceExpired: null,
    hasVEP: null, hasAutopassCard: null, entryCheckpoint: 'woodlands',
    hasSGInsuranceCover: null, insuranceType: 'unknown',
    foreignInsurerName: '', foreignPolicyNumber: '', foreignPolicyExpiry: '',
    hasSGClaimsAgent: null, sgClaimsAgentDetails: '',
    isUninsured: false, isHitAndRun: false, fleeDirection: '',
    vehicleDescription: '', driverDescription: '',
  };
}

export function OtherPartyDetails() {
  const navigate = useNavigate();
  const { currentIncident, addOtherParty, updateOtherParty, removeOtherParty } = useAccidentStore();
  const [activePartyIdx, setActivePartyIdx] = useState(0);

  if (!currentIncident) { navigate('/'); return null; }

  const parties = currentIncident.otherParties;

  if (parties.length === 0) {
    const newParty = createEmptyParty();
    addOtherParty(newParty);
    return null;
  }

  const party = parties[activePartyIdx] || parties[0];

  const update = (updates: Partial<OtherParty>) => {
    updateOtherParty(party.id, updates);
  };

  const toggleForeign = (isForeign: boolean) => {
    update({
      isForeignVehicle: isForeign,
      foreign: isForeign ? createEmptyForeign() : null,
    });
  };

  const updateForeign = (updates: Partial<ForeignVehicleDetails>) => {
    if (!party.foreign) return;
    update({ foreign: { ...party.foreign, ...updates } });
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const chipClass = (sel: boolean) => `flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-center ${sel ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`;
  const ynClass = (sel: boolean | null, target: boolean) => `flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-center ${sel === target ? (target ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white') : 'border-gray-200 bg-white'}`;

  return (
    <StepWizard currentStep={3} totalSteps={8} stepLabel="Other Party Details" onNext={() => navigate('/accident/eligibility')}>
      <div className="space-y-6">
        {/* Party tabs */}
        {parties.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {parties.map((p, i) => (
              <button key={p.id} onClick={() => setActivePartyIdx(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${i === activePartyIdx ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'}`}>
                Party {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* SG / Foreign toggle */}
        <div>
          <label className={labelClass}>Vehicle Registration Type</label>
          <div className="flex gap-2">
            <button onClick={() => toggleForeign(false)} className={chipClass(!party.isForeignVehicle)}>SG Plate</button>
            <button onClick={() => toggleForeign(true)} className={chipClass(party.isForeignVehicle)}>Foreign Plate</button>
          </div>
        </div>

        {party.isForeignVehicle && (
          <div className="bg-purple/10 border-2 border-purple rounded-xl p-3">
            <div className="flex items-center gap-2 text-purple font-semibold text-sm">
              <AlertTriangle size={16} /> Police report is MANDATORY for foreign vehicles. Call 999 if not done.
            </div>
          </div>
        )}

        {/* Standard fields */}
        <div className="space-y-4">
          <div><label className={labelClass}>Driver's Full Name</label><input className={inputClass} value={party.driverName} onChange={e => update({ driverName: e.target.value })} /></div>
          <div><label className={labelClass}>NRIC / FIN / ID Number</label><input className={inputClass} value={party.idNumber} onChange={e => update({ idNumber: e.target.value })} /></div>
          <div><label className={labelClass}>Contact Number</label><input className={inputClass} type="tel" value={party.contactNumber} onChange={e => update({ contactNumber: e.target.value })} /></div>
          <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={party.email} onChange={e => update({ email: e.target.value })} /></div>
          <div><label className={labelClass}>Address</label><input className={inputClass} value={party.address} onChange={e => update({ address: e.target.value })} /></div>
          <div><label className={labelClass}>Vehicle Registration</label><input className={inputClass} value={party.vehicleRegistration} onChange={e => update({ vehicleRegistration: e.target.value.toUpperCase() })} /></div>
          <div><label className={labelClass}>Vehicle Make / Model</label><input className={inputClass} value={party.vehicleMakeModel} onChange={e => update({ vehicleMakeModel: e.target.value })} /></div>
          <div><label className={labelClass}>Vehicle Colour</label><input className={inputClass} value={party.vehicleColour} onChange={e => update({ vehicleColour: e.target.value })} /></div>
          <div><label className={labelClass}>Licence Number</label><input className={inputClass} value={party.licenceNumber} onChange={e => update({ licenceNumber: e.target.value })} /></div>
          <div><label className={labelClass}>Insurer</label><input className={inputClass} value={party.insurerName} onChange={e => update({ insurerName: e.target.value })} /></div>
          <div><label className={labelClass}>Policy Number</label><input className={inputClass} value={party.policyNumber} onChange={e => update({ policyNumber: e.target.value })} /></div>
          <div>
            <label className={labelClass}>Is the driver the vehicle owner?</label>
            <div className="flex gap-2">
              <button onClick={() => update({ isVehicleOwner: true })} className={ynClass(party.isVehicleOwner, true)}>Yes</button>
              <button onClick={() => update({ isVehicleOwner: false })} className={ynClass(party.isVehicleOwner, false)}>No</button>
            </div>
          </div>
          {!party.isVehicleOwner && (
            <>
              <div><label className={labelClass}>Owner Name</label><input className={inputClass} value={party.ownerName} onChange={e => update({ ownerName: e.target.value })} /></div>
              <div><label className={labelClass}>Owner Contact</label><input className={inputClass} type="tel" value={party.ownerContact} onChange={e => update({ ownerContact: e.target.value })} /></div>
            </>
          )}
          <div><label className={labelClass}>Visible Damage</label><textarea className={inputClass} rows={3} value={party.visibleDamage} onChange={e => update({ visibleDamage: e.target.value })} placeholder="Describe visible damage on the other vehicle" /></div>
        </div>

        {/* Foreign vehicle section */}
        {party.isForeignVehicle && party.foreign && (
          <div className="space-y-4 border-t-2 border-purple pt-4">
            <h3 className="font-bold text-purple">Foreign Vehicle Details</h3>
            <div><label className={labelClass}>Nationality</label><input className={inputClass} value={party.foreign.nationality} onChange={e => updateForeign({ nationality: e.target.value })} /></div>
            <div><label className={labelClass}>ID Type</label>
              <div className="flex gap-2">
                {(['mykad', 'passport', 'other'] as const).map(t => (
                  <button key={t} onClick={() => updateForeign({ idType: t })} className={chipClass(party.foreign!.idType === t)}>{t === 'mykad' ? 'MyKad' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>
            <div><label className={labelClass}>Home Country Address</label><textarea className={inputClass} rows={2} value={party.foreign.homeAddress} onChange={e => updateForeign({ homeAddress: e.target.value })} /></div>
            <div><label className={labelClass}>SG Contact Number</label><input className={inputClass} type="tel" value={party.foreign.sgContactNumber} onChange={e => updateForeign({ sgContactNumber: e.target.value })} /></div>
            <div><label className={labelClass}>Country of Registration</label><input className={inputClass} value={party.foreign.countryOfRegistration} onChange={e => updateForeign({ countryOfRegistration: e.target.value })} /></div>
            <div>
              <label className={labelClass}>Foreign Licence Valid?</label>
              <div className="flex gap-2">
                <button onClick={() => updateForeign({ foreignLicenceValid: true })} className={ynClass(party.foreign.foreignLicenceValid, true)}>Yes</button>
                <button onClick={() => updateForeign({ foreignLicenceValid: false })} className={ynClass(party.foreign.foreignLicenceValid, false)}>No</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Has VEP?</label>
              <div className="flex gap-2">
                <button onClick={() => updateForeign({ hasVEP: true })} className={ynClass(party.foreign.hasVEP, true)}>Yes</button>
                <button onClick={() => updateForeign({ hasVEP: false })} className={ynClass(party.foreign.hasVEP, false)}>No</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Entry Checkpoint</label>
              <div className="flex gap-2">
                {(['woodlands', 'tuas', 'unknown'] as const).map(c => (
                  <button key={c} onClick={() => updateForeign({ entryCheckpoint: c })} className={chipClass(party.foreign!.entryCheckpoint === c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Has SG Insurance Cover?</label>
              <div className="flex gap-2">
                <button onClick={() => updateForeign({ hasSGInsuranceCover: true })} className={ynClass(party.foreign.hasSGInsuranceCover, true)}>Yes</button>
                <button onClick={() => updateForeign({ hasSGInsuranceCover: false })} className={ynClass(party.foreign.hasSGInsuranceCover, false)}>No</button>
              </div>
            </div>
            {(party.foreign.hasSGInsuranceCover === false) && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-sm">
                <p className="font-semibold text-danger">Uninsured foreign vehicle</p>
                <p className="text-gray-600 mt-1">You may need to contact MIB Singapore for uninsured claims.</p>
              </div>
            )}
            <div><label className={labelClass}>Foreign Insurer Name</label><input className={inputClass} value={party.foreign.foreignInsurerName} onChange={e => updateForeign({ foreignInsurerName: e.target.value })} /></div>
            <div><label className={labelClass}>Foreign Policy Number</label><input className={inputClass} value={party.foreign.foreignPolicyNumber} onChange={e => updateForeign({ foreignPolicyNumber: e.target.value })} /></div>
          </div>
        )}

        {/* Multi-party */}
        <div className="flex gap-2">
          <button onClick={() => { const p = createEmptyParty(); addOtherParty(p); setActivePartyIdx(parties.length); }}
            className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2">
            <Plus size={16} /> Add Another Party
          </button>
          {parties.length > 1 && (
            <button onClick={() => { removeOtherParty(party.id); setActivePartyIdx(Math.max(0, activePartyIdx - 1)); }}
              className="p-3 border-2 border-danger/30 rounded-xl text-danger">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </StepWizard>
  );
}
