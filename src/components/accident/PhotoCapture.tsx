import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RotateCcw } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useCamera } from '../../hooks/useCamera';
import { useAccidentStore } from '../../store/useAccidentStore';
import { db } from '../../db/database';
import { PHOTO_PROMPTS } from '../../constants/photoPrompts';
import type { IncidentPhoto } from '../../types/incident';

const CATEGORIES: Record<string, string> = {
  scene: 'Scene Photos', your_vehicle: 'Your Vehicle', other_vehicle: 'Other Vehicle',
  other_party_docs: "Other Party's Documents", evidence: 'Evidence',
  injuries: 'Injuries', your_docs: 'Your Documents',
};

export function PhotoCapture() {
  const navigate = useNavigate();
  const { capture, isCapturing } = useCamera();
  const { currentIncident } = useAccidentStore();
  const [capturedPhotos, setCapturedPhotos] = useState<Map<string, IncidentPhoto>>(new Map());

  useEffect(() => {
    if (!currentIncident) return;
    db.photos.where('incidentId').equals(currentIncident.id).toArray().then(photos => {
      const map = new Map<string, IncidentPhoto>();
      for (const p of photos) map.set(p.promptId, p);
      setCapturedPhotos(map);
    });
  }, [currentIncident]);

  if (!currentIncident) { navigate('/'); return null; }

  const requiredCount = PHOTO_PROMPTS.filter(p => p.required).length;
  const capturedRequiredCount = PHOTO_PROMPTS.filter(p => p.required && capturedPhotos.has(p.id)).length;

  const handleCapture = async (promptId: string) => {
    const result = await capture();
    if (!result) return;

    const photo: IncidentPhoto = {
      id: crypto.randomUUID(),
      incidentId: currentIncident.id,
      promptId,
      blob: result.blob,
      thumbnail: result.thumbnail,
      latitude: result.metadata.latitude,
      longitude: result.metadata.longitude,
      timestamp: result.metadata.timestamp,
      compassHeading: result.metadata.compassHeading,
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

  const groupedPrompts = PHOTO_PROMPTS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof PHOTO_PROMPTS[number][]>);

  const handleNext = () => {
    if (capturedRequiredCount < requiredCount) {
      if (!confirm(`You have ${requiredCount - capturedRequiredCount} required photos remaining. Continue anyway?`)) return;
    }
    navigate('/accident/other-party');
  };

  return (
    <StepWizard currentStep={2} totalSteps={8} stepLabel="Photo Evidence" onNext={handleNext}>
      <div className="space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{capturedRequiredCount} of {requiredCount} required photos</span>
            <span className="text-xs text-gray-500">{capturedPhotos.size} total</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(capturedRequiredCount / requiredCount) * 100}%` }} />
          </div>
        </div>

        {/* Photo groups */}
        {Object.entries(groupedPrompts).map(([category, prompts]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{CATEGORIES[category] || category}</h3>
            <div className="space-y-2">
              {prompts.map(prompt => {
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
                          {prompt.required ? (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${captured ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              {captured ? 'Done' : 'Required'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Optional</span>
                          )}
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
          </div>
        ))}
      </div>
    </StepWizard>
  );
}
