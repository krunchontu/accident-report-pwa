import { useState, useEffect } from 'react';
import { Save, User, Car, Shield } from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import type { UserProfile, VehicleProfile, InsuranceProfile } from '../../types/profile';

export function PersonalDetails() {
  const { profile, vehicle, insurance, saveProfile, saveVehicle, saveInsurance } = useProfileStore();
  const [tab, setTab] = useState<'personal' | 'vehicle' | 'insurance'>('personal');
  const [saving, setSaving] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>(profile || {});
  const [editVehicle, setEditVehicle] = useState<Partial<VehicleProfile>>(vehicle || {});
  const [editInsurance, setEditInsurance] = useState<Partial<InsuranceProfile>>(insurance || {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setEditProfile(profile);
    if (vehicle) setEditVehicle(vehicle);
    if (insurance) setEditInsurance(insurance);
  }, [profile, vehicle, insurance]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'personal' && editProfile.id) {
        await saveProfile({ ...editProfile, updatedAt: new Date().toISOString() } as UserProfile);
      } else if (tab === 'vehicle' && editVehicle.id) {
        await saveVehicle(editVehicle as VehicleProfile);
      } else if (tab === 'insurance' && editInsurance.id) {
        await saveInsurance(editInsurance as InsuranceProfile);
      }
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white";
  const selectClass = "w-full p-3 border border-gray-300 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-navy/30";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const tabs = [
    { id: 'personal' as const, icon: User, label: 'Personal' },
    { id: 'vehicle' as const, icon: Car, label: 'Vehicle' },
    { id: 'insurance' as const, icon: Shield, label: 'Insurance' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-navy mb-4">My Details</h1>

      {/* Tab bar */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-white text-navy shadow-sm' : 'text-gray-500'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'personal' && (
          <>
            <div><label className={labelClass}>Full Name</label><input className={inputClass} value={editProfile.fullName || ''} onChange={e => setEditProfile({...editProfile, fullName: e.target.value})} /></div>
            <div><label className={labelClass}>NRIC / FIN</label><input className={inputClass} value={editProfile.nricFin || ''} onChange={e => setEditProfile({...editProfile, nricFin: e.target.value})} /></div>
            <div><label className={labelClass}>Contact</label><input className={inputClass} type="tel" value={editProfile.contactNumber || ''} onChange={e => setEditProfile({...editProfile, contactNumber: e.target.value})} /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={editProfile.email || ''} onChange={e => setEditProfile({...editProfile, email: e.target.value})} /></div>
            <div><label className={labelClass}>Address</label><input className={inputClass} value={editProfile.address || ''} onChange={e => setEditProfile({...editProfile, address: e.target.value})} /></div>
            <div><label className={labelClass}>Licence Number</label><input className={inputClass} value={editProfile.licenceNumber || ''} onChange={e => setEditProfile({...editProfile, licenceNumber: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Licence Class</label>
                <select className={selectClass} value={editProfile.licenceClass || '3'} onChange={e => setEditProfile({...editProfile, licenceClass: e.target.value})}>
                  {['2', '2A', '2B', '3', '3A', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Licence Expiry</label><input className={inputClass} type="date" value={editProfile.licenceExpiryDate || ''} onChange={e => setEditProfile({...editProfile, licenceExpiryDate: e.target.value})} /></div>
            </div>
            <div><label className={labelClass}>Years Since Passing</label><input className={inputClass} type="number" value={editProfile.yearsPassed || 0} onChange={e => setEditProfile({...editProfile, yearsPassed: parseInt(e.target.value) || 0})} /></div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={editProfile.hasSpectacleCondition || false} onChange={e => setEditProfile({...editProfile, hasSpectacleCondition: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-navy/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-navy after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className="text-sm">Spectacles condition on licence</span>
            </div>
            <div><label className={labelClass}>Medical Conditions</label><input className={inputClass} value={editProfile.medicalConditions || ''} onChange={e => setEditProfile({...editProfile, medicalConditions: e.target.value})} placeholder="Optional" /></div>
          </>
        )}
        {tab === 'vehicle' && (
          <>
            <div><label className={labelClass}>Registration Number</label><input className={inputClass} value={editVehicle.registrationNumber || ''} onChange={e => setEditVehicle({...editVehicle, registrationNumber: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Make</label><input className={inputClass} value={editVehicle.make || ''} onChange={e => setEditVehicle({...editVehicle, make: e.target.value})} /></div>
              <div><label className={labelClass}>Model</label><input className={inputClass} value={editVehicle.model || ''} onChange={e => setEditVehicle({...editVehicle, model: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Year</label><input className={inputClass} type="number" value={editVehicle.year || ''} onChange={e => setEditVehicle({...editVehicle, year: parseInt(e.target.value) || 0})} /></div>
              <div><label className={labelClass}>Colour</label><input className={inputClass} value={editVehicle.colour || ''} onChange={e => setEditVehicle({...editVehicle, colour: e.target.value})} /></div>
            </div>
            <div><label className={labelClass}>Road Tax Expiry</label><input className={inputClass} type="date" value={editVehicle.roadTaxExpiry || ''} onChange={e => setEditVehicle({...editVehicle, roadTaxExpiry: e.target.value})} /></div>
          </>
        )}
        {tab === 'insurance' && (
          <>
            <div><label className={labelClass}>Insurer</label><input className={inputClass} value={editInsurance.insurerName || ''} onChange={e => setEditInsurance({...editInsurance, insurerName: e.target.value})} /></div>
            <div><label className={labelClass}>Policy Number</label><input className={inputClass} value={editInsurance.policyNumber || ''} onChange={e => setEditInsurance({...editInsurance, policyNumber: e.target.value})} /></div>
            <div><label className={labelClass}>Policy Expiry</label><input className={inputClass} type="date" value={editInsurance.policyExpiry || ''} onChange={e => setEditInsurance({...editInsurance, policyExpiry: e.target.value})} /></div>
            <div><label className={labelClass}>Claims Hotline</label><input className={inputClass} type="tel" value={editInsurance.claimsHotline || ''} onChange={e => setEditInsurance({...editInsurance, claimsHotline: e.target.value})} /></div>
            <div><label className={labelClass}>NCD %</label><input className={inputClass} type="number" value={editInsurance.ncdPercentage || 0} onChange={e => setEditInsurance({...editInsurance, ncdPercentage: parseInt(e.target.value) || 0})} /></div>
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full mt-6 py-4 bg-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
        <Save size={18} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
