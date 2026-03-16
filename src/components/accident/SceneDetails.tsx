import { useNavigate } from 'react-router-dom';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';
import { MapPin } from 'lucide-react';

const WEATHER_OPTIONS = [
  { value: 'clear', label: 'Clear' }, { value: 'rain', label: 'Rain' },
  { value: 'heavy_rain', label: 'Heavy Rain' }, { value: 'overcast', label: 'Overcast' },
  { value: 'night', label: 'Night' }, { value: 'fog', label: 'Fog' }, { value: 'other', label: 'Other' },
] as const;

const ROAD_OPTIONS = [
  { value: 'dry', label: 'Dry' }, { value: 'wet', label: 'Wet' },
  { value: 'flooded', label: 'Flooded' }, { value: 'oily', label: 'Oily' },
  { value: 'debris', label: 'Debris' }, { value: 'other', label: 'Other' },
] as const;

const TRAFFIC_OPTIONS = [
  { value: 'light', label: 'Light' }, { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' }, { value: 'stationary', label: 'Stationary' },
] as const;

const SPEED_PRESETS = ['50', '60', '70', '80', '90'];

export function SceneDetails() {
  const navigate = useNavigate();
  const { currentIncident, updateScene } = useAccidentStore();

  if (!currentIncident) { navigate('/'); return null; }
  const scene = currentIncident.scene;

  const chipClass = (selected: boolean) =>
    `px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
      selected ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-gray-700'
    }`;

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white";

  return (
    <StepWizard currentStep={1} totalSteps={8} stepLabel="Scene Details" onNext={() => navigate('/accident/photos')}>
      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1" /> Location
          </label>
          {scene.location.latitude ? (
            <div className="bg-white rounded-xl p-3 border border-gray-200 text-sm">
              <div className="text-gray-500">GPS: {scene.location.latitude.toFixed(6)}, {scene.location.longitude.toFixed(6)}</div>
              {scene.location.address && <div className="mt-1 font-medium">{scene.location.address}</div>}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-500">Capturing location...</div>
          )}
          <input className={`${inputClass} mt-2`} value={scene.location.roadName} onChange={e => updateScene({ location: { ...scene.location, roadName: e.target.value } })} placeholder="Road name (manual entry)" />
        </div>

        {/* Date/Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date & Time</label>
          <input type="datetime-local" className={inputClass} value={scene.dateTime.slice(0, 16)}
            onChange={e => updateScene({ dateTime: new Date(e.target.value).toISOString() })} />
        </div>

        {/* Weather */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Weather</label>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map(o => (
              <button key={o.value} onClick={() => updateScene({ weather: o.value })} className={chipClass(scene.weather === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          {scene.weather === 'other' && (
            <input className={`${inputClass} mt-2`} value={scene.weatherOther} onChange={e => updateScene({ weatherOther: e.target.value })} placeholder="Describe weather" />
          )}
        </div>

        {/* Road Condition */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Road Surface</label>
          <div className="flex flex-wrap gap-2">
            {ROAD_OPTIONS.map(o => (
              <button key={o.value} onClick={() => updateScene({ roadCondition: o.value })} className={chipClass(scene.roadCondition === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Traffic */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Traffic</label>
          <div className="flex flex-wrap gap-2">
            {TRAFFIC_OPTIONS.map(o => (
              <button key={o.value} onClick={() => updateScene({ trafficCondition: o.value })} className={chipClass(scene.trafficCondition === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Limit */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Speed Limit (km/h)</label>
          <div className="flex gap-2 mb-2">
            {SPEED_PRESETS.map(s => (
              <button key={s} onClick={() => updateScene({ speedLimit: s })} className={chipClass(scene.speedLimit === s)}>
                {s}
              </button>
            ))}
          </div>
          <input className={inputClass} type="number" value={scene.speedLimit} onChange={e => updateScene({ speedLimit: e.target.value })} placeholder="Other speed limit" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">What Happened?</label>
          <textarea className={inputClass} rows={4} value={scene.description}
            onChange={e => updateScene({ description: e.target.value })}
            placeholder="e.g., I was travelling straight on the left lane when the other vehicle changed lanes into my vehicle..." />
        </div>
      </div>
    </StepWizard>
  );
}
