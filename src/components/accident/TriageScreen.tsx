import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ambulance, Check } from 'lucide-react';
import { useAccidentStore } from '../../store/useAccidentStore';
import { useGeolocation } from '../../hooks/useGeolocation';

export function TriageScreen() {
  const navigate = useNavigate();
  const { currentIncident, updateTriage, updateLocation } = useAccidentStore();
  const geo = useGeolocation();

  useEffect(() => {
    geo.getCurrentPosition();
  }, [geo.getCurrentPosition]);

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      updateLocation(geo.latitude, geo.longitude, geo.address, geo.roadName);
    }
  }, [geo.latitude, geo.longitude, geo.address, geo.roadName, updateLocation]);

  if (!currentIncident) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-navy text-white px-4 py-6 text-center">
        <h1 className="text-xl font-bold">Is Anyone Injured?</h1>
        <p className="text-sm opacity-80 mt-1">This determines the next steps</p>
        {geo.loading && <p className="text-xs opacity-60 mt-2">Capturing GPS location...</p>}
        {geo.latitude && <p className="text-xs opacity-60 mt-2">Location captured</p>}
      </div>

      <div className="flex-1 p-4 space-y-4">
        <button
          onClick={() => {
            updateTriage({ anyInjuries: true });
            navigate('/accident/emergency');
          }}
          className="w-full bg-danger text-white rounded-2xl p-8 text-left active:scale-[0.98] transition-transform shadow-lg"
        >
          <Ambulance size={40} className="mb-3" />
          <div className="text-xl font-bold">Yes — Someone is Injured</div>
          <div className="text-sm opacity-80 mt-1">Call emergency services first</div>
        </button>

        <button
          onClick={() => {
            updateTriage({ anyInjuries: false });
            navigate('/accident/scene');
          }}
          className="w-full bg-success text-white rounded-2xl p-8 text-left active:scale-[0.98] transition-transform shadow-lg"
        >
          <Check size={40} className="mb-3" />
          <div className="text-xl font-bold">No — Property Damage Only</div>
          <div className="text-sm opacity-80 mt-1">Continue to document the accident</div>
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Not sure? If in doubt, call <a href="tel:995" className="text-danger font-semibold">995</a>
        </p>
      </div>
    </div>
  );
}
