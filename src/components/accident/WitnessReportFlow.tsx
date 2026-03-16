import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RotateCcw, ChevronLeft } from 'lucide-react';
import { useAccidentStore } from '../../store/useAccidentStore';
import { useCamera } from '../../hooks/useCamera';
import { db } from '../../db/database';
import type { IncidentPhoto } from '../../types/incident';

const WITNESS_PHOTO_PROMPTS = [
  { id: 'scene_wide_1', label: 'Full scene (front)', description: 'Wide-angle of the entire accident scene', required: true },
  { id: 'scene_wide_2', label: 'Full scene (rear)', description: 'Scene from the opposite direction', required: false },
  { id: 'vehicle_positions', label: 'Vehicle positions', description: 'Where both vehicles ended up after impact', required: true },
  { id: 'road_markings', label: 'Road markings/signs', description: 'Traffic lights, lane markings at the scene', required: false },
  { id: 'skid_marks', label: 'Skid marks/debris', description: 'Any marks on the road from the accident', required: false },
] as const;

export function WitnessReportFlow() {
  const navigate = useNavigate();
  const { currentIncident, addWitness, updateWitness, completeIncident } = useAccidentStore();
  const { capture, isCapturing } = useCamera();
  const [step, setStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Map<string, IncidentPhoto>>(new Map());

  // The witness adds themselves as a witness entry
  const witness = currentIncident?.witnesses[0];

  useEffect(() => {
    if (!currentIncident) return;
    // Auto-add self as witness if not present
    if (currentIncident.witnesses.length === 0) {
      addWitness({ id: crypto.randomUUID(), fullName: '', contactNumber: '', statement: '' });
    }
    // Load any previously captured photos
    db.photos.where('incidentId').equals(currentIncident.id).toArray().then(photos => {
      const map = new Map<string, IncidentPhoto>();
      for (const p of photos) map.set(p.promptId, p);
      setCapturedPhotos(map);
    });
  }, [currentIncident, addWitness]);

  if (!currentIncident || !witness) { navigate('/'); return null; }

  const inputClass = 'w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const handleCapture = async (promptId: string) => {
    const result = await capture();
    if (!result) return;
    const photo: IncidentPhoto = {
      id: crypto.randomUUID(), incidentId: currentIncident.id, promptId,
      blob: result.blob, thumbnail: result.thumbnail,
      latitude: result.metadata.latitude, longitude: result.metadata.longitude,
      timestamp: result.metadata.timestamp, compassHeading: result.metadata.compassHeading,
      caption: '',
    };
    await db.photos.put(photo);
    setCapturedPhotos(prev => new Map(prev).set(promptId, photo));
  };

  const handleRetake = async (promptId: string) => {
    const existing = capturedPhotos.get(promptId);
    if (existing) await db.photos.delete(existing.id);
    await handleCapture(promptId);
  };

  const handleFinish = async () => {
    await completeIncident();
    navigate('/');
  };

  const totalSteps = 3;
  const stepLabels = ['Your Account', 'Photos', 'Done'];

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm opacity-80">Witness Report — Step {step + 1} of {totalSteps}</span>
        </div>
        <h1 className="text-lg font-semibold">{stepLabels[step]}</h1>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 0: Statement + Contact */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              As a witness or passenger, please share what you saw and your contact details.
            </p>
            <div>
              <label className={labelClass}>Your Full Name</label>
              <input className={inputClass} value={witness.fullName} onChange={e => updateWitness(witness.id, { fullName: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label className={labelClass}>Contact Number</label>
              <input className={inputClass} type="tel" value={witness.contactNumber} onChange={e => updateWitness(witness.id, { contactNumber: e.target.value })} placeholder="9123 4567" />
            </div>
            <div>
              <label className={labelClass}>What did you see?</label>
              <textarea className={inputClass} rows={5} value={witness.statement} onChange={e => updateWitness(witness.id, { statement: e.target.value })} placeholder="Describe what you witnessed — vehicle positions, sequence of events, signals, speeds, etc." />
            </div>
          </div>
        )}

        {/* Step 1: Photo capture (reduced set) */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Capture photos of the scene from your vantage point.</p>
            {WITNESS_PHOTO_PROMPTS.map(prompt => {
              const captured = capturedPhotos.get(prompt.id);
              return (
                <div key={prompt.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    {captured ? (
                      <img src={captured.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{prompt.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          captured ? 'bg-success/10 text-success' : prompt.required ? 'bg-danger/10 text-danger' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {captured ? 'Done' : prompt.required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{prompt.description}</p>
                      <div className="flex gap-2 mt-2">
                        {captured ? (
                          <button onClick={() => handleRetake(prompt.id)} className="flex items-center gap-1 text-xs text-navy font-medium">
                            <RotateCcw size={12} /> Retake
                          </button>
                        ) : (
                          <button onClick={() => handleCapture(prompt.id)} disabled={isCapturing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium disabled:opacity-50">
                            <Camera size={12} /> Capture
                          </button>
                        )}
                      </div>
                    </div>
                    {captured && <Check size={20} className="text-success shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Done */}
        {step === 2 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Thank You</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Your witness report and photos have been saved. The driver can access this from their Records.
            </p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => {
            if (step === totalSteps - 1) handleFinish();
            else setStep(step + 1);
          }}
          className="w-full py-4 bg-navy text-white rounded-xl font-semibold text-lg active:bg-navy-light transition-colors"
        >
          {step === totalSteps - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
