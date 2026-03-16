import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Shield, Car, FileCheck, Users, Check } from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { getValidationError } from '../../utils/validation';
import type { UserProfile, VehicleProfile, InsuranceProfile, FamilyDriver } from '../../types/profile';

const SG_INSURERS = [
  'NTUC Income', 'AXA', 'AIG', 'Allianz', 'MSIG', 'Tokio Marine',
  'Etiqa', 'Sompo', 'Great Eastern', 'Liberty', 'QBE', 'Zurich', 'DirectAsia', 'Other',
];

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const { saveProfile, saveVehicle, saveInsurance, saveFamilyDrivers, setSetupComplete } = useProfileStore();

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    id: crypto.randomUUID(),
    fullName: '', nricFin: '', contactNumber: '', email: '', address: '',
    licenceNumber: '', licenceClass: '3', licenceExpiryDate: '', yearsPassed: 0,
    hasSpectacleCondition: false, medicalConditions: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  const [vehicle, setVehicle] = useState<Partial<VehicleProfile>>({
    id: crypto.randomUUID(),
    registrationNumber: '', make: '', model: '', year: new Date().getFullYear(),
    colour: '', engineChassisNumber: '', roadTaxExpiry: '', lastInspectionDate: '',
    ownership: 'own', modifications: '',
  });

  const [insurance, setInsurance] = useState<Partial<InsuranceProfile>>({
    id: crypto.randomUUID(), vehicleId: '',
    insurerName: '', policyNumber: '', policyType: 'comprehensive',
    policyExpiry: '', driverType: 'named', excessAmount: 0, youngDriverExcess: 0,
    ncdPercentage: 0, claimsHotline: '', workshopType: 'authorised', workshopPanel: '',
    namedDrivers: [], minDriverAge: null, minDrivingExperience: null,
  });

  const [drivers, setDrivers] = useState<FamilyDriver[]>([]);

  const totalSteps = 6;

  const handleSkip = () => {
    setSetupComplete(true);
  };

  const saveCurrentStep = async (currentStep: number) => {
    const now = new Date().toISOString();
    if (currentStep >= 1) {
      const p: UserProfile = {
        id: profile.id || crypto.randomUUID(),
        fullName: profile.fullName || '',
        nricFin: profile.nricFin || '',
        contactNumber: profile.contactNumber || '',
        email: profile.email || '',
        address: profile.address || '',
        licenceNumber: profile.licenceNumber || '',
        licenceClass: profile.licenceClass || '3',
        licenceExpiryDate: profile.licenceExpiryDate || '',
        yearsPassed: profile.yearsPassed || 0,
        hasSpectacleCondition: profile.hasSpectacleCondition || false,
        medicalConditions: profile.medicalConditions || '',
        createdAt: profile.createdAt || now,
        updatedAt: now,
      };
      await saveProfile(p);
    }
    if (currentStep >= 2) {
      const v: VehicleProfile = {
        id: vehicle.id || crypto.randomUUID(),
        registrationNumber: vehicle.registrationNumber || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        colour: vehicle.colour || '',
        engineChassisNumber: vehicle.engineChassisNumber || '',
        roadTaxExpiry: vehicle.roadTaxExpiry || '',
        lastInspectionDate: vehicle.lastInspectionDate || '',
        ownership: vehicle.ownership || 'own',
        modifications: vehicle.modifications || '',
      };
      await saveVehicle(v);
    }
    if (currentStep >= 3) {
      const ins: InsuranceProfile = {
        id: insurance.id || crypto.randomUUID(),
        vehicleId: vehicle.id || '',
        insurerName: insurance.insurerName || '',
        policyNumber: insurance.policyNumber || '',
        policyType: insurance.policyType || 'comprehensive',
        policyExpiry: insurance.policyExpiry || '',
        driverType: insurance.driverType || 'named',
        excessAmount: insurance.excessAmount || 0,
        youngDriverExcess: insurance.youngDriverExcess || 0,
        ncdPercentage: insurance.ncdPercentage || 0,
        claimsHotline: insurance.claimsHotline || '',
        workshopType: insurance.workshopType || 'authorised',
        workshopPanel: insurance.workshopPanel || '',
        namedDrivers: insurance.namedDrivers || [],
        minDriverAge: insurance.minDriverAge ?? null,
        minDrivingExperience: insurance.minDrivingExperience ?? null,
      };
      await saveInsurance(ins);
    }
    if (currentStep >= 4 && drivers.length > 0) {
      await saveFamilyDrivers(drivers);
    }
  };

  // Auto-save with debounce — persists on every field change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (step >= 1) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => { saveCurrentStep(step); }, 500);
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [profile, vehicle, insurance, drivers]);

  const handleFinish = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveCurrentStep(4);
    setSetupComplete(true);
  };

  const addDriver = () => {
    setDrivers([...drivers, { id: crypto.randomUUID(), fullName: '', nricFin: '', licenceClass: '3', relationship: 'spouse' }]);
  };

  const updateDriver = (index: number, field: keyof FamilyDriver, value: string) => {
    const updated = [...drivers];
    (updated[index] as unknown as Record<string, string>)[field] = value;
    setDrivers(updated);
  };

  const removeDriver = (index: number) => {
    setDrivers(drivers.filter((_, i) => i !== index));
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass = "w-full p-3 border border-gray-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-navy/30";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress */}
      <div className="bg-navy text-white px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-bold">Setup ({step + 1}/{totalSteps})</h1>
          <button onClick={handleSkip} className="text-sm opacity-70 hover:opacity-100">Skip for now</button>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center py-8">
            <Shield size={64} className="mx-auto text-navy mb-4" />
            <h2 className="text-2xl font-bold text-navy mb-2">Welcome to SG Accident Kaki</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              This app helps you document accidents and check your claim eligibility.
              Let's set up your details now so you're ready.
            </p>
          </div>
        )}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2"><Shield size={20} /> Personal Details</h2>
            <div>
              <label className={labelClass}>Full Name (as per NRIC/FIN)</label>
              <input className={inputClass} value={profile.fullName || ''} onChange={e => setProfile({...profile, fullName: e.target.value})} placeholder="Full name" />
            </div>
            <div>
              <label className={labelClass}>NRIC / FIN Number</label>
              <input className={inputClass} value={profile.nricFin || ''} onChange={e => setProfile({...profile, nricFin: e.target.value.toUpperCase()})} placeholder="S1234567A" />
              {profile.nricFin && getValidationError('nricFin', profile.nricFin) && (
                <p className="text-xs text-danger mt-1">{getValidationError('nricFin', profile.nricFin)}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Contact Number</label>
              <input className={inputClass} type="tel" value={profile.contactNumber || ''} onChange={e => setProfile({...profile, contactNumber: e.target.value})} placeholder="9123 4567" />
              {profile.contactNumber && getValidationError('contactNumber', profile.contactNumber) && (
                <p className="text-xs text-danger mt-1">{getValidationError('contactNumber', profile.contactNumber)}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} placeholder="you@email.com" />
              {profile.email && getValidationError('email', profile.email) && (
                <p className="text-xs text-danger mt-1">{getValidationError('email', profile.email)}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Block / Street / Unit" />
            </div>
            <div>
              <label className={labelClass}>Driving Licence Number</label>
              <input className={inputClass} value={profile.licenceNumber || ''} onChange={e => setProfile({...profile, licenceNumber: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Licence Class</label>
                <select className={selectClass} value={profile.licenceClass || '3'} onChange={e => setProfile({...profile, licenceClass: e.target.value})}>
                  {['2', '2A', '2B', '3', '3A', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Licence Expiry</label>
                <input className={inputClass} type="date" value={profile.licenceExpiryDate || ''} onChange={e => setProfile({...profile, licenceExpiryDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Years Since Passing</label>
              <input className={inputClass} type="number" min="0" value={profile.yearsPassed || 0} onChange={e => setProfile({...profile, yearsPassed: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={profile.hasSpectacleCondition || false} onChange={e => setProfile({...profile, hasSpectacleCondition: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-navy/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-navy after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className="text-sm">Spectacles condition on licence</span>
            </div>
            <div>
              <label className={labelClass}>Medical Conditions (optional)</label>
              <textarea className={inputClass} rows={2} value={profile.medicalConditions || ''} onChange={e => setProfile({...profile, medicalConditions: e.target.value})} placeholder="Any relevant medical conditions" />
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2"><Car size={20} /> Vehicle Details</h2>
            <div>
              <label className={labelClass}>Registration Number</label>
              <input className={inputClass} value={vehicle.registrationNumber || ''} onChange={e => setVehicle({...vehicle, registrationNumber: e.target.value.toUpperCase()})} placeholder="SBA1234X" />
              {vehicle.registrationNumber && getValidationError('registrationNumber', vehicle.registrationNumber) && (
                <p className="text-xs text-danger mt-1">{getValidationError('registrationNumber', vehicle.registrationNumber)}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Make</label>
                <input className={inputClass} value={vehicle.make || ''} onChange={e => setVehicle({...vehicle, make: e.target.value})} placeholder="Toyota" />
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <input className={inputClass} value={vehicle.model || ''} onChange={e => setVehicle({...vehicle, model: e.target.value})} placeholder="Corolla" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Year</label>
                <input className={inputClass} type="number" value={vehicle.year || ''} onChange={e => setVehicle({...vehicle, year: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className={labelClass}>Colour</label>
                <input className={inputClass} value={vehicle.colour || ''} onChange={e => setVehicle({...vehicle, colour: e.target.value})} placeholder="White" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Engine / Chassis Number</label>
              <input className={inputClass} value={vehicle.engineChassisNumber || ''} onChange={e => setVehicle({...vehicle, engineChassisNumber: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Road Tax Expiry</label>
                <input className={inputClass} type="date" value={vehicle.roadTaxExpiry || ''} onChange={e => setVehicle({...vehicle, roadTaxExpiry: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Last Inspection</label>
                <input className={inputClass} type="date" value={vehicle.lastInspectionDate || ''} onChange={e => setVehicle({...vehicle, lastInspectionDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Ownership</label>
              <div className="grid grid-cols-4 gap-2">
                {(['own', 'rent', 'lease', 'company'] as const).map(o => (
                  <button key={o} onClick={() => setVehicle({...vehicle, ownership: o})}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-colors ${vehicle.ownership === o ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Modifications (optional)</label>
              <textarea className={inputClass} rows={2} value={vehicle.modifications || ''} onChange={e => setVehicle({...vehicle, modifications: e.target.value})} />
            </div>
          </div>
        )}

        {/* Step 3: Insurance Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2"><FileCheck size={20} /> Insurance Details</h2>
            <div>
              <label className={labelClass}>Insurer</label>
              <select className={selectClass} value={insurance.insurerName || ''} onChange={e => setInsurance({...insurance, insurerName: e.target.value})}>
                <option value="">Select insurer...</option>
                {SG_INSURERS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Policy Number</label>
              <input className={inputClass} value={insurance.policyNumber || ''} onChange={e => setInsurance({...insurance, policyNumber: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Policy Type</label>
              <div className="grid grid-cols-3 gap-2">
                {([['comprehensive', 'Comp'], ['tpft', 'TPFT'], ['tpo', 'TPO']] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setInsurance({...insurance, policyType: val})}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-colors ${insurance.policyType === val ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Policy Expiry</label>
              <input className={inputClass} type="date" value={insurance.policyExpiry || ''} onChange={e => setInsurance({...insurance, policyExpiry: e.target.value})} />
            </div>
            <div>
              <label className={labelClass}>Driver Policy</label>
              <div className="grid grid-cols-2 gap-2">
                {([['named', 'Named Driver'], ['any', 'Any Driver']] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setInsurance({...insurance, driverType: val})}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-colors ${insurance.driverType === val ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Excess (SGD)</label>
                <input className={inputClass} type="number" min="0" value={insurance.excessAmount || 0} onChange={e => setInsurance({...insurance, excessAmount: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className={labelClass}>Young Driver Excess</label>
                <input className={inputClass} type="number" min="0" value={insurance.youngDriverExcess || 0} onChange={e => setInsurance({...insurance, youngDriverExcess: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>NCD %</label>
                <input className={inputClass} type="number" min="0" max="60" value={insurance.ncdPercentage || 0} onChange={e => setInsurance({...insurance, ncdPercentage: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className={labelClass}>Claims Hotline</label>
                <input className={inputClass} type="tel" value={insurance.claimsHotline || ''} onChange={e => setInsurance({...insurance, claimsHotline: e.target.value})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Workshop Type</label>
              <div className="grid grid-cols-2 gap-2">
                {([['authorised', 'Authorised Panel'], ['own', 'Own Workshop']] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setInsurance({...insurance, workshopType: val})}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-colors ${insurance.workshopType === val ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Family Drivers */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2"><Users size={20} /> Additional Drivers</h2>
            <p className="text-sm text-gray-600">Does anyone else regularly drive your vehicle?</p>
            {drivers.map((d, i) => (
              <div key={d.id} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Driver {i + 1}</span>
                  <button onClick={() => removeDriver(i)} className="text-danger text-sm">Remove</button>
                </div>
                <input className={inputClass} value={d.fullName} onChange={e => updateDriver(i, 'fullName', e.target.value)} placeholder="Full name" />
                <input className={inputClass} value={d.nricFin} onChange={e => updateDriver(i, 'nricFin', e.target.value)} placeholder="NRIC / FIN" />
                <div className="grid grid-cols-2 gap-2">
                  <select className={selectClass} value={d.licenceClass} onChange={e => updateDriver(i, 'licenceClass', e.target.value)}>
                    {['2', '2A', '2B', '3', '3A', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className={selectClass} value={d.relationship} onChange={e => updateDriver(i, 'relationship', e.target.value)}>
                    {['spouse', 'child', 'parent', 'other'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={addDriver} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium">
              + Add Driver
            </button>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">You're All Set!</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Your details are saved on this device. Tap the red button if you're ever in an accident.
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-600">
              Back
            </button>
          )}
          <button
            onClick={async () => {
              if (step === totalSteps - 1) {
                handleFinish();
              } else {
                await saveCurrentStep(step);
                setStep(step + 1);
              }
            }}
            className="flex-1 py-4 bg-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {step === totalSteps - 1 ? 'Get Started' : 'Next'}
            {step < totalSteps - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
